// Example filename: tracing.js
'use strict';

const opentelemetry = require('@opentelemetry/sdk-node');
const api = require('@opentelemetry/api');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { DropAggregation, View } = require('@opentelemetry/sdk-metrics');
const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = require('@opentelemetry/semantic-conventions');
const resource = Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: 'sdk-metrics',
      [ATTR_SERVICE_VERSION]: '0.1.0',
    }),
  );
const {
    MeterProvider,
    PeriodicExportingMetricReader,
  } = require('@opentelemetry/sdk-metrics');

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  
    // Default is 20000ms (20 seconds). Set to 20 seconds for demonstrative purposes only.
    exportIntervalMillis: 20000,
  });
  const dropHTTPMetricView = new View({
    aggregation: new DropAggregation(),
    // apply the view to all instruments
    meterName: '@opentelemetry/instrumentation-http',
  });
  const myServiceMeterProvider = new MeterProvider({
    resource: resource,
    readers: [metricReader],
    views: [dropHTTPMetricView]
  });
  // Set this MeterProvider to be global to the app being instrumented.
api.metrics.setGlobalMeterProvider(myServiceMeterProvider);
const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
        getNodeAutoInstrumentations({
            // we recommend disabling fs autoinstrumentation since it can be noisy
            // and expensive during startup
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        }),
    ],
});

sdk.start();
