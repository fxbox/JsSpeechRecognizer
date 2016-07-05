import { generateModelFromSamples, testSampleAgainstModel } from './helpers.js';

const CONFIDENCE_THRESHOLD = 0.5;
const ERROR_THRESHOLD = 0.05;

describe('keyword-spotting', () => {
  it('should recognize a wakeword given a recorded sample', (done) => {
    const model = generateModelFromSamples(['resources/mozilla.wav']);
    const result = testSampleAgainstModel(model, 'resources/mozilla.wav');

    chai.assert(result.confidenceValue >= CONFIDENCE_THRESHOLD, "Confidence under threshold");
    chai.assert(result.error < ERROR_THRESHOLD, "Error too high");
  });
});
