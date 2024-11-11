const express = require('express');
const HotShot = require('hot-shots');
const opentelemetry = require('@opentelemetry/api');

const myMeter = opentelemetry.metrics.getMeter(
  'app.js',
  '0.1.0',
);
const app = express();
const port = 4000;

// Initialize HotShot client
const client = new HotShot({
  host: 'localhost',
  port: 8125, // Default StatsD port
  prefix: 'statsd.' // Optional prefix for all metrics
});
const requests = myMeter.createCounter('requests');
const histogram = myMeter.createHistogram('my_histogram');
const timing = myMeter.createHistogram('response_time');
const distribution = myMeter.createHistogram('my_distribution');
const guage = myMeter.createGauge('my_guage');

// Middleware to count requests
app.use((req, res, next) => {
  client.increment('requests');
  requests.add(1);

  next();
});

// Example route
app.get('/', (req, res) => {
  // Record response time
  const start = Date.now();
  
  // Simulate some work
  setTimeout(() => {
    const duration = Date.now() - start;
    client.timing('response_time', duration);
    timing.record(duration);
    client.histogram('my_histogram', 42);
    histogram.record(42);
    client.distribution('my_distribution', 50);
    distribution.record(50)
    client.gauge('my_gauge', 123.45);
    guage.record(123.45)
    
    res.send('Hello World!');
  }, 100);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
