import stats from 'stats-lite';

const CONFIDENCE_THRESHOLD_INTERVAL = 0.02;
const MINIMUM_SIGMA = 2;

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

        function findConfidenceMaxima(iterations = 0, lastThreshold = 0.5, currentThreshold = 0.5, benchmarkResults = []) {
          console.log("Iteration: ", iterations);
          return benchmark(currentThreshold).then((result) => {
            if (!result) {
              if (lastThreshold < currentThreshold) {
                // Reduce the threshold by (current - last) / 2
                return findConfidenceMaxima(
                    iterations + 1, currentThreshold,
                    lastThreshold + ((currentThreshold - lastThreshold) / 2),
                    benchmarkResults);
              } else {
                // Reduce the currentThreshold by a fixed amount
                return findConfidenceMaxima(iterations + 1,
                    currentThreshold, currentThreshold - CONFIDENCE_THRESHOLD_INTERVAL,
                    benchmarkResults);
              }
            }

            const confidence = result.confidence;
            console.log("Test confidence: ", confidence);

            benchmarkResults.push(confidence);

            if (stats.stdev(benchmarkResults.slice(benchmarkResults.length - 20)) < MINIMUM_SIGMA && iterations > 20) {
              return Promise.resolve(benchmarkResults.slice(benchmarkResults.length - 20));
            }

            return findConfidenceMaxima(iterations + 1,
              currentThreshold, currentThreshold + CONFIDENCE_THRESHOLD_INTERVAL, benchmarkResults)
          });
        }
        return findConfidenceMaxima().then((confidenceValues) => {
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
