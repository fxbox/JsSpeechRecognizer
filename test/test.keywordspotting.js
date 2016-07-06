import { createWhiteNoiseNode } from './noisehelper.js';
import JsSpeechRecognizer from '../JsSpeechRecognizer.js';
import TestHelper from './helpers.js';

const assert = chai.assert;

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

  it('should generate a valid model when trained', () => {
    const model = models.get('default');
    assert(Array.isArray(model['mozilla']), 'Model should be an array');;
    assert(model['mozilla'].length, 'Model should not be empty');;
  });

  it('should recognize a wakeword given a recorded sample', (done) => {
    const testHelper = new TestHelper(jsSpeechRecognizer);
    testHelper.model = models.get('default');

    testHelper.testKeywordSpottingWithSample('resources/mozilla.wav')
      .then((result) => {
        assert(!!result, "No keyword spotted");
        console.log(result);
        assert(result.confidence >= CONFIDENCE_THRESHOLD, "Confidence under threshold");
        done();
      });
  });

  it('should not recognize a different word than the trained word', (done) => {
    const testHelper = new TestHelper(jsSpeechRecognizer);
    testHelper.model = models.get('default');

    testHelper.testKeywordSpottingWithSample('resources/television.wav')
      .then((result) => {
        assert(result === undefined, "Keyword was spotted");
        done();
      });
  });

  it('should recognize a wakeword with background white noise', (done) => {
    const testHelper = new TestHelper(jsSpeechRecognizer);
    testHelper.model = models.get('default');

    const whiteNoiseNode = createWhiteNoiseNode(testHelper.audioContext, 0.01);
    whiteNoiseNode.connect(testHelper.mockAudioInput);

    testHelper.startDebugSound();

    testHelper.testKeywordSpottingWithSample('resources/mozilla.wav')
      .then((result) => {
        whiteNoiseNode.disconnect();
        assert(!!result, "No keyword spotted");
        console.log(result);
        assert(result.confidence >= CONFIDENCE_THRESHOLD, "Confidence under threshold");
        done();
      });

  });
});
