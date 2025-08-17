# Auth Service - Monitoring & Instrumentation

## Overview
The Auth service implements comprehensive monitoring using OpenTelemetry for distributed tracing and Prometheus client for metrics collection. This service handles user authentication operations including sign-up, sign-in, and sign-out.

## Monitoring Stack Components

### OpenTelemetry Instrumentation
The service uses OpenTelemetry SDK for distributed tracing and automatic instrumentation of Node.js applications.

#### Configuration (`instrumentation.ts`)
```typescript
const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    "service.name": "auth-service",
    "service.namespace": "mc-book-sync",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://otel-collector:4318/v1/traces",
    headers: {},
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
```

**Key Features:**
- Service identification with name and namespace
- OTLP HTTP exporter sending traces to collector on port 4318
- Automatic instrumentation for HTTP, database, and other operations
- Custom tracer instance for manual span creation

### Prometheus Metrics
The service exposes custom metrics using the `prom-client` library for monitoring HTTP requests, response times, and active users.

#### Metrics Definitions (`metrics.ts`)

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `http_request_duration_seconds` | Histogram | Duration of HTTP requests | method, route, status_code |
| `http_requests_total` | Counter | Total number of HTTP requests | method, route, status_code |
| `active_users_total` | Gauge | Total number of active users | status |
| `http_response_codes_total` | Counter | HTTP responses by status code | status_code |

#### Middleware Implementation

**Request Metrics Middleware:**
- Captures request duration using histogram timer
- Records request counts with method, route, and status code labels
- Automatically triggered on response finish event

**Active Users Middleware:**
- Increments active users gauge on sign-in (`POST /sign-in/`)
- Decrements active users gauge on sign-out (`POST /sign-out/`)
- Tracks user session state changes

### Manual Instrumentation in Handlers

#### Trace Spans Implementation
Each authentication handler creates custom spans for detailed tracing:

```typescript
export const signUpUser = async (req: Request, res: Response) => {
  const span = tracer.startSpan("signUpUser");
  try {
    // Business logic with span events
    span.addEvent("User successfully registered");
    // Response handling
  } catch (error) {
    span.addEvent("Creating user failed");
    // Error handling
  } finally {
    span.end();
  }
};
```

**Span Events Tracked:**
- `signUpUser`: Email/username existence checks, user creation
- `signInUser`: User lookup, credential verification, token generation
- `signOutUser`: Logout confirmation

## Metrics Exposure

### Endpoint Configuration
- **Metrics Endpoint:** `/metrics`
- **Port:** 5000 (exposed via Docker)
- **Format:** Prometheus text format
- **Update Frequency:** Real-time on request

### Scraped by:
1. **Prometheus** - Direct scraping every 15s
2. **Telegraf** - HTTP input plugin every 10s
3. **Remote Write** - InfluxDB integration via Prometheus

## Integration Points

### OpenTelemetry Collector
- **Protocol:** OTLP HTTP
- **Endpoint:** `http://otel-collector:4318/v1/traces`
- **Data Flow:** Auth Service → OTel Collector → Jaeger

### Metrics Collection Chain
```
Auth Service (:5000/metrics) 
    ↓
Prometheus Scraper (:9090) + Telegraf (:9273)
    ↓
InfluxDB Remote Write (:8086)
    ↓
Grafana Dashboards (:3000)
```

## Monitoring Capabilities

### Distributed Tracing
- End-to-end request tracing across authentication flows
- Performance bottleneck identification
- Error propagation tracking
- Service dependency mapping

### Metrics Monitoring
- Request rate and latency percentiles
- Error rate monitoring by endpoint
- Active user session tracking
- HTTP status code distribution

### Alerting Potential
- High authentication failure rates
- Elevated response times
- Unusual user activity patterns
- Service availability issues

## Best Practices Implemented

1. **Span Lifecycle Management:** Proper span creation, event addition, and termination
2. **Error Tracking:** Dedicated span events for error conditions
3. **Contextual Information:** Meaningful span and event names
4. **Resource Attribution:** Clear service identification in telemetry data
5. **Metric Labeling:** Consistent labeling strategy for dimensional analysis