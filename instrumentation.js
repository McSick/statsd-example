// Example filename: tracing.js
'use strict';

const opentelemetry = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } =  require('@opentelemetry/exporter-trace-otlp-http');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const {
    MeterProvider,
    PeriodicExportingMetricReader,
  } = require('@opentelemetry/sdk-metrics');
const { DropAggregation, View } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http')
const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            headers: { "x-honeycomb-dataset": `${process.env.SERVICE}-metrics` },
        }),
        interval: 60000,
    }),
    views: [
        // Filter this due to high volume and redundancy with http spans
        new View({
            aggregation: new DropAggregation(),
            meterName: "@opentelemetry/instrumentation-http",
        }),
    ],
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