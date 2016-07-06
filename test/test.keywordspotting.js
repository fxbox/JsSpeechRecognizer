import TestHelper from './helpers.js';
import JsSpeechRecognizer from '../JsSpeechRecognizer.js';

const CONFIDENCE_THRESHOLD = 0.5;
const ERROR_THRESHOLD = 0.05;

describe('keyword-spotting', () => {

  const models = new Map();
  let jsSpeechRecognizer;

  before((done) => {
    const jsSpeechRecognizer = new JsSpeechRecognizer();
    const testHelper = new TestHelper(jsSpeechRecognizer);

    const defaultModel = testHelper
      .generateModelFromSamples('mozilla', ['resources/mozilla.wav'])
      .then((model) => {
        models.set('default', model);
      });

    Promise.all([defaultModel]).then(() => done());
  });

  beforeEach(() => {
     jsSpeechRecognizer = new JsSpeechRecognizer();
  });

  it('should recognize a wakeword given a recorded sample', (done) => {
    const testHelper = new TestHelper(jsSpeechRecognizer);
    testHelper.model = models.get('default');

    testHelper.testKeywordSpottingWithSample('resources/mozilla.wav')
      .then((result) => {
        chai.assert(!!result, "No keyword spotted");
        console.log(result);
        chai.assert(result.confidence >= CONFIDENCE_THRESHOLD, "Confidence under threshold");
        // chai.assert(result.error < ERROR_THRESHOLD, "Error too high");
        done();
      });
  });

  it('should contain a model once trained', (done) => {

  });
});
