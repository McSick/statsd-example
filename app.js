const express = require('express');
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'app.js',
  '0.1.0',
);
const app = express();
const port = 4000;

// Middleware to count requests
app.use((req, res, next) => {
  next();
});
const requests = myMeter.createCounter('metric.requests.attempt');
const requests_success = myMeter.createCounter('metric.requests.success');
const requests_failure = myMeter.createCounter('metric.requests.failures');
app.get('/counter', (req, res) => {
  setTimeout(() => {
    let activeSpan = opentelemetry.trace.getActiveSpan();
    requests.add(1); // metric
    activeSpan.setAttribute('span.requests.attempt', 1); // metric as span attribute
    // simulate some failures 10% of the time
    if (Math.random() > 0.9) {
      requests_failure.add(1); // metric
      activeSpan.setAttribute('span.requests.failures', 1); // metric as span attribute
      return res.status(500).send('Failed!');
    } else {

      requests_success.add(1); //metric 
      activeSpan.setAttribute('span.requests.success', 1); // metric as span attribute
      activeSpan.setAttribute('error', true); //use any attribute for group by adhoc metrics
      return res.send('Hello World!');
    }
  }, 100);
});
const bytes_histogram = myMeter.createHistogram('metric.response.size', {
  description: 'The bytes of the response',
  unit: 'bytes'
});
app.get('/histogram', (req, res) => {
  setTimeout(() => {
    let activeSpan = opentelemetry.trace.getActiveSpan();
    let randomBytes = Math.random() * 100;
    bytes_histogram.record(randomBytes); //
    activeSpan.setAttribute('span.response.size',randomBytes); // metric as span attribute & desired state
    return res.send('Histogram!');
  }, 100);
});

const memory_guage = myMeter.createGauge('metric.memory_in_use', {
  description: 'The bytes in use',
  unit: 'bytes'
});
app.get('/guage', (req, res) => {
  setTimeout(() => {
    let activeSpan = opentelemetry.trace.getActiveSpan();
    // simulate memory usage betwee 60-100
    let simulatedMemory = Math.random() * 40 + 60;
    memory_guage.record(simulatedMemory); // metric
    activeSpan.setAttribute('span.memory_in_use',simulatedMemory); // metric as span attribute & desired state
    return res.send('Guage!');
  }, 100);
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
