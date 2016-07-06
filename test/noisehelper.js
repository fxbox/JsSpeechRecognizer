const BUFFER_SIZE = 4096;

function createWhiteNoiseNode(audioContext, level = 0.1) {
  const inputChannels = 1;
  const outputChannels = 1;
  const node = audioContext
    .createScriptProcessor(BUFFER_SIZE, inputChannels, outputChannels);

  node.addEventListener('audioprocess', (e) => {
    for (let channelIndex = 0; channelIndex < e.outputBuffer.numberOfChannels; channelIndex++) {
      const output = e.outputBuffer.getChannelData(channelIndex);
      for (let bufferIndex = 0; bufferIndex < BUFFER_SIZE; bufferIndex++) {
        output[bufferIndex] = _whiteNoiseSample();
      }
    }
  });

  const gainNode = audioContext.createGain();

  gainNode.gain.value = level;

  node.connect(gainNode);
  return gainNode;
}

function _whiteNoiseSample() {
  return (Math.random() * 2) - 1
}

export {
  createWhiteNoiseNode,
};
