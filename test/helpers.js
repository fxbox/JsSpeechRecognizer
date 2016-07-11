function promiseMap(array, asyncMap) {
      return Promise.all(array.map(asyncMap));
}

export default class TestHelper {

  constructor(jsSpeechRecognizer) {
    this.speechRec = jsSpeechRecognizer;
    this.mockAudioInput = this.audioContext.createMediaStreamDestination();

    this.speechRec.openMic(this.mockAudioInput);

  }

  generateModelFromSamples(curWord, samples = []) {
    return samples
      .map(this.loadSample.bind(this))
      .map(this.decodeAudioSample.bind(this))
      .reduce((next, current) => {
        return next.then(this.trainWithAudioBuffer.bind(this, curWord, current));
      }, Promise.resolve()).then(() => {

        console.log('training finished');
        return this.speechRec.model;
      });
  }

  set model(model) {
    this.speechRec.model = model
  }

  trainWithAudioBuffer(curWord, audioBufferPromise) {
    return audioBufferPromise.then((audioBuffer) => {
      return new Promise((resolve) => {
        this.speechRec.startTrainingRecording(curWord);

        const source = this.createSource(audioBuffer);

        source.addEventListener('ended', () => {
          this.speechRec.closeMic();
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
    return Promise.resolve(sampleArrayBufferPromise).then((sampleArrayBuffer) => {
      return this.speechRec.audioCtx
        .decodeAudioData(sampleArrayBuffer);
    });
  }

  testKeywordSpottingWithSample(sample) {
    // TODO: Compute many times and compute an average + confidence value
    return this.loadSample(sample)
      .then(this.decodeAudioSample.bind(this))
      .then(this.createSource.bind(this))
      .then((audioBufferSource) => {
        this.speechRec.startKeywordSpottingRecording();

        const keywordSpottedPromise = new Promise((resolve) => {
          this.speechRec.keywordSpottedCallback = (result) => {
            resolve(result);
          };
        });

        const audioEndedPromise = new Promise((resolve) => {
          audioBufferSource.addEventListener('ended', () => {
            console.log('sample playback ended');
            setTimeout(resolve, 1000 /*ms*/);
          });
        });

        audioBufferSource.connect(this.mockAudioInput);
        audioBufferSource.start();

        return Promise.race([keywordSpottedPromise, audioEndedPromise])
          .then((result) => {
            this.speechRec.closeMic();

            // Still wait for audioEnded:
            return audioEndedPromise.then(() => {
              return result;
            });
          });
      });
  }

  startDebugSound() {
    // TODO: equivalent stopDebugSound
    this
      .audioContext
      .createMediaStreamSource(this.mockAudioInput.stream)
      .connect(this.audioContext.destination);
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
