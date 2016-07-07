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

    suite.add('test', (threshold) => {
      console.log("Running test with threshold: ", threshold);
      const jsSpeechRecognizer = new JsSpeechRecognizer();
      jsSpeechRecognizer.keywordSpottingMinConfidence = threshold;
      const testHelper = new TestHelper(jsSpeechRecognizer);
      testHelper.model = models.get('default');

      testHelper.startDebugSound();

      return testHelper.testKeywordSpottingWithSample('resources/mozilla.wav');
    })
    .run()
    .then((result) => {
      console.log(result);
    });
  });
}());
