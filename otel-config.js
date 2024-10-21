const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

// Trace Exporter configuration
const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    "http://localhost:4318/v1/traces",
});

// Metric Exporter configuration
const metricExporter = new OTLPMetricExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
    "http://localhost:4318/v1/metrics",
});

// Initialize OpenTelemetry SDK with traces and metrics
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "nodejs-web-backend",
    [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
  }),
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // Export metrics every 60 seconds
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
try {
  sdk.start();
  console.log("OpenTelemetry initialized with OTLP and Console Exporters");
} catch (error) {
  console.error("Error initializing OpenTelemetry", error);
}

// Export the SDK for graceful shutdown
module.exports = sdk;
