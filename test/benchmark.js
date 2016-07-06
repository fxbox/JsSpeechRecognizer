import BenchmarkSuite from './benchmarksuite.js';

(function runBenchmarks() {
  const suite = new BenchmarkSuite();

  suite.add('test', () => {
    return Promise.resolve({ confidence: Math.random() });
  })
  .run()
  .then((result) => {
    console.log(result);
  });
}());
