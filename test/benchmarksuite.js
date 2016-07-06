import stats from 'stats-lite';

export default class BenchmarkSuite {
  constructor() {
    this.running = false;
    this.benchmarks = new Map();
    this.results = new Map();
  }

  add(name, benchmark) {
    if (this.running) {
      throw new Error('Benchmark already running');
    }

    this.benchmarks.set(name, benchmark);
    return this;
  }

  run() {
    this.results = new Map();
    this.running = true;

    const benchmarks = [];

    this.benchmarks.forEach((benchmark, name) => {
      benchmarks.push(() => {

        function runBench(iterations = 0, benchmarkResults = []) {
          return benchmark().then((result) => {
            benchmarkResults.push(result.confidence);

            if (stats.stdev(benchmarkResults) > 2 || iterations < 100) {
              return runBench(iterations + 1, benchmarkResults);
            } else {
              return Promise.resolve(benchmarkResults);
            }
          });
        }

        return runBench().then((confidenceValues) => {
          const mean = stats.mean(confidenceValues);
          const stdev = stats.stdev(confidenceValues);

          this.results.set(name, {
            meanConfidence: mean,
            standardDeviation: stdev,
          });
        });
      });
    });

    return benchmarks
      .reduce((previous, current) => {
        return previous.then(current);
      }, Promise.resolve())
      .then(() => this.results);
  }
}
