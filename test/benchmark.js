import BenchmarkSuite from './benchmarksuite.js';
import JsSpeechRecognizer from '../JsSpeechRecognizer.js';
import TestHelper from './helpers.js';

(function runBenchmarks() {
  const suite = new BenchmarkSuite();

  // Create models for benchmarks
  (function createModels() {
    const models = new Map();
    const jsSpeechRecognizer = new JsSpeechRecognizer();
    const testHelper = new TestHelper(jsSpeechRecognizer);

    const defaultModel = testHelper
      .generateModelFromSamples('mozilla', ['resources/mozilla.wav'])
      .then((model) => {
        models.set('default', model);
      });

    return Promise.all([defaultModel]).then(() => models);
  }()).then((models) => {

    suite.add('test', () => {
      const jsSpeechRecognizer = new JsSpeechRecognizer();

      const testHelper = new TestHelper(jsSpeechRecognizer);
      testHelper.model = models.get('default');

      return testHelper.testKeywordSpottingWithSample('resources/mozilla.wav');
    })
    .run()
    .then((result) => {
      console.log(result);
    });
  });
}());
