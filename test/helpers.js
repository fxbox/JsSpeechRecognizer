function generateModelFromSamples(samples = []) {
  return samples.map(loadSample);
}

function testSampleAgainstModel(model, sample) {
  return {
    confidenceValue: 0,
    error: 0,
    noise: 0,
  };
}

function loadSample(wav) {
}

export {
  loadSample,
  testSampleAgainstModel,
  generateModelFromSamples,
};
