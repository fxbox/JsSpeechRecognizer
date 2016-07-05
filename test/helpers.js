function promiseMap(array, asyncMap) {
      return Promise.all(array.map(asyncMap));
}

export default class TestHelper {

  constructor(jsSpeechRecognizer) {
//    window.speechRec = jsSpeechRecognizer;
    this.speechRec = jsSpeechRecognizer;
    this.mockAudioInput = this.audioContext.createMediaStreamDestination();
  }

  generateModelFromSamples(curWord, samples = []) {
    return samples
      .map(this.loadSample.bind(this))
      .map(this.decodeAudioSample.bind(this))
      .reduce((next, current) => {
        return next.then(this.trainWithAudioBuffer.bind(null, curWord, current));
      }, Promise.resolve()).then(() => {

        console.log('training finished');
      });
  }

  trainWithAudioBuffer(curWord, audioBufferPromise) {
    return audioBufferPromise.then((audioBuffer) => {
      return new Promise((resolve) => {
        this.speechRec.startTrainingRecording(curWord);

        const source = this.createSource(audioBuffer);

        source.addEventListener('ended', () => {
          this.speechRec.stopRecording();
          this.speechRec.generateModel();
          resolve();
        });

        source.connect(this.mockAudioInput);
        source.start();
      });
    });
  }

  createSource(audioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    return source;
  }

  get audioContext() {
    return this.speechRec.audioCtx;
  }

  decodeAudioSample(sampleArrayBufferPromise) {
    return sampleArrayBufferPromise.then((sampleArrayBuffer) => {
      return this.speechRec.audioCtx
        .decodeAudioData(sampleArrayBuffer);
    });
  }

  testSampleAgainstModel(model, sample) {
    return {
      confidenceValue: 0,
      error: 0,
      noise: 0,
    };
  }

  loadSample(wav) {
    return fetch(wav).then((response) => {
      if (!response.ok) {
        throw new Error("wav fetch failed");
      }

      return response.arrayBuffer();
    });
  }
}
