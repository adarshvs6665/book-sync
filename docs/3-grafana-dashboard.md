# Grafana Dashboards Guide

## Overview
This document describes the three main dashboards created for monitoring the BookSync microservices application. Each dashboard serves a specific purpose and provides different levels of observability into the system's performance and health.

## Dashboard Architecture

### Dashboard Provisioning
The dashboards are automatically provisioned using Grafana's provisioning system:
```yaml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    options:
      path: /etc/grafana/provisioning/dashboards
```

All dashboards are stored as JSON files and automatically loaded when Grafana starts.

---

## 1. BookSync Backend Monitoring Dashboard

### Purpose
Primary operational dashboard providing high-level overview of system health, request patterns, and business metrics across all microservices.

### Data Sources
- **Primary:** Prometheus (`PBFA97CFB590B2093`)
- **Time Range:** Last 15 minutes (configurable)

### Panels Overview

#### HTTP Response Codes (2xx, 4xx, 5xx)
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  http_response_codes_total{status_code=~"2.."}  # Success responses
  http_response_codes_total{status_code=~"4.."}  # Client errors  
  http_response_codes_total{status_code=~"5.."}  # Server errors
  ```
- **Purpose:** Track response patterns and error rates over time
- **Use Case:** Quick identification of system health and error spikes

#### Total Requests by Service
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  sum(http_requests_total) by (job)
  ```
- **Purpose:** Compare request volume across auth, books, and borrow services
- **Use Case:** Load balancing validation and service utilization analysis

#### Active Logged-in Users
- **Visualization:** Stat panel with gauge
- **Query:** 
  ```promql
  active_users_total
  ```
- **Purpose:** Real-time count of authenticated users in the system
- **Use Case:** User engagement tracking and capacity planning

#### Total Requests by Endpoint
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  sum(http_requests_total) by (job, route)
  ```
- **Purpose:** Detailed breakdown of API endpoint usage
- **Use Case:** Identify popular endpoints and traffic patterns

#### Memory Usage
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  process_resident_memory_bytes
  ```
- **Purpose:** Monitor memory consumption across all services
- **Use Case:** Resource utilization and memory leak detection

#### CPU Utilization
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  process_cpu_seconds_total
  ```
- **Purpose:** Track CPU usage patterns over time
- **Use Case:** Performance optimization and capacity planning

#### Request Latency Across Services
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  rate(http_request_duration_seconds_sum[1m]) / rate(http_request_duration_seconds_count[1m])
  ```
- **Purpose:** Average response time calculation using rate functions
- **Use Case:** Performance monitoring and SLA compliance

### Key Features
- **Real-time Updates:** 15-second refresh intervals
- **Cross-service Comparison:** All three microservices in unified view
- **Business Metrics Integration:** User activity alongside technical metrics
- **Error Rate Monitoring:** Immediate visibility into system health

---

## 2. BookSync Backend Monitoring Telegraf Metrics Dashboard

### Purpose
Detailed system-level monitoring focused on Node.js runtime metrics, memory management, and system resource utilization. Complements the primary dashboard with deeper technical insights.

### Data Sources
- **Primary:** Prometheus (`PBFA97CFB590B2093`)
- **Time Range:** Last 6 hours (configurable)

### Panels Overview

#### Heap Memory Usage
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  go_memstats_heap_alloc_bytes
  ```
- **Purpose:** Track currently allocated heap memory in bytes
- **Use Case:** Memory leak detection and garbage collection analysis

#### Process Memory Usage
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  process_resident_memory_bytes
  ```
- **Purpose:** Total resident memory usage by Node.js processes
- **Use Case:** Overall memory consumption monitoring

#### Active Goroutines
- **Visualization:** Stat panel
- **Query:** 
  ```promql
  go_goroutines
  ```
- **Purpose:** Current number of active goroutines
- **Use Case:** Concurrency monitoring and potential goroutine leaks

#### Next GC Trigger
- **Visualization:** Gauge panel
- **Query:** 
  ```promql
  go_memstats_next_gc_bytes
  ```
- **Purpose:** Heap size at which next garbage collection will trigger
- **Use Case:** GC tuning and memory pressure analysis

#### Garbage Collection Cycles Count
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  go_gc_duration_seconds_count
  ```
- **Purpose:** Total number of GC cycles since application start
- **Use Case:** GC frequency analysis and performance impact assessment

#### Active Threads
- **Visualization:** Stat panel
- **Query:** 
  ```promql
  go_threads
  ```
- **Purpose:** Current number of operating system threads
- **Use Case:** Thread pool monitoring and resource utilization

#### CPU Usage Over Time
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  rate(process_cpu_seconds_total[1m])
  ```
- **Purpose:** CPU utilization rate per second over 1-minute intervals
- **Use Case:** Performance trending and capacity planning

#### Garbage Collection Duration
- **Visualization:** Time series line chart with quantiles
- **Query:** 
  ```promql
  go_gc_duration_seconds
  ```
- **Purpose:** GC duration across different percentiles (50th, 75th, etc.)
- **Use Case:** Application responsiveness during GC pauses

#### Network Traffic Received
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  process_network_receive_bytes_total
  ```
- **Purpose:** Total bytes received over network interfaces
- **Use Case:** Network utilization and traffic pattern analysis

#### Routes Request Duration (Pie Chart)
- **Visualization:** Pie chart
- **Query:** 
  ```promql
  http_request_duration_seconds_sum
  ```
- **Purpose:** Distribution of request processing time by endpoint
- **Use Case:** Identify slow endpoints and optimization opportunities

#### Open File Descriptors
- **Visualization:** Gauge panel
- **Query:** 
  ```promql
  process_open_fds
  ```
- **Purpose:** Current number of open file descriptors
- **Use Case:** Resource leak detection and system limit monitoring

#### Event Loop Lag
- **Visualization:** Time series line chart
- **Query:** 
  ```promql
  nodejs_eventloop_lag_seconds
  ```
- **Purpose:** Node.js event loop delay measurement
- **Use Case:** Application responsiveness and blocking operation detection

#### Node Process Uptime
- **Visualization:** Stat panel
- **Query:** 
  ```promql
  process_start_time_seconds
  ```
- **Purpose:** Process start timestamp for uptime calculation
- **Use Case:** Service availability and restart tracking

### Key Features
- **Runtime Deep Dive:** Node.js and Go runtime specific metrics
- **Memory Management Focus:** Detailed heap and GC monitoring
- **Performance Diagnostics:** Event loop lag and file descriptor tracking
- **Longer Time Window:** 6-hour view for trend analysis

---

## 3. BookSync Backend Monitoring Jaeger Traces Dashboard

### Purpose
Distributed tracing visualization dashboard that provides insights into request flows across microservices, helping with performance analysis and debugging complex interactions.

### Data Sources
- **Primary:** Jaeger (`fev9wgo3nffnkb`)
- **Time Range:** Last 30 minutes (configurable)

### Panels Overview

#### Auth Service Traces
- **Visualization:** Time series line chart
- **Query Configuration:**
  - **Query Type:** search
  - **Service:** auth-service
- **Purpose:** Visualize trace data from authentication service
- **Use Case:** Monitor login/logout flows, user registration performance

#### Books Service Traces
- **Visualization:** Time series line chart
- **Query Configuration:**
  - **Query Type:** search
  - **Service:** books-service
- **Purpose:** Track book catalog operations and search queries
- **Use Case:** Analyze book retrieval performance, catalog update operations

#### Borrow Service Traces
- **Visualization:** Time series line chart
- **Query Configuration:**
  - **Query Type:** search
  - **Service:** borrow-service
- **Purpose:** Monitor borrowing, return, and reservation operations
- **Use Case:** Track library transaction performance, due date processing

#### Jaeger All-in-One Traces
- **Visualization:** Time series line chart
- **Query Configuration:**
  - **Query Type:** search
  - **Service:** jaeger-all-in-one
- **Purpose:** Internal Jaeger system traces for monitoring the tracing infrastructure
- **Use Case:** Ensure tracing system health and performance

### Trace Analysis Capabilities

#### Cross-Service Request Flow
- **Workflow Tracing:** Follow requests as they traverse multiple services
- **Dependency Mapping:** Understand service interaction patterns
- **Latency Attribution:** Identify which service contributes most to overall latency

#### Performance Bottleneck Identification
- **Span Duration Analysis:** Compare operation durations within and across services
- **Database Query Performance:** Monitor ORM/database interaction spans
- **External API Calls:** Track third-party service integration performance

#### Error Propagation Tracking
- **Error Span Identification:** Locate failed operations across the request chain
- **Exception Context:** View error details and stack traces within trace context
- **Recovery Pattern Analysis:** Understand how errors are handled across services

### Key Features
- **Service-Specific Views:** Individual panels for each microservice
- **Interactive Exploration:** Click through to detailed trace views in Jaeger UI
- **Real-time Trace Ingestion:** Live trace data from OpenTelemetry instrumentation
- **Cross-correlation:** Ability to correlate traces with metrics from other dashboards

---

## Dashboard Usage Guidelines

### Operational Monitoring Workflow
1. **Start with Primary Dashboard:** Get overall system health overview
2. **Drill into Telegraf Dashboard:** Investigate resource-related issues
3. **Trace Analysis:** Use Jaeger dashboard for request-level debugging

### Alert Configuration Recommendations
- **Primary Dashboard:** HTTP error rates, active user thresholds
- **Telegraf Dashboard:** Memory usage limits, CPU saturation, GC frequency
- **Jaeger Dashboard:** Trace ingestion failures, service availability

### Performance Investigation Process
1. **Identify Issue:** Error spike or latency increase in primary dashboard
2. **Resource Analysis:** Check CPU, memory, GC patterns in Telegraf dashboard
3. **Request Tracing:** Use Jaeger dashboard to analyze specific slow requests
4. **Root Cause:** Correlate metrics with trace data for comprehensive diagnosis

### Best Practices
- **Regular Review:** Monitor dashboards during business hours
- **Baseline Establishment:** Understand normal patterns for each metric
- **Proactive Monitoring:** Set up alerts before issues become critical
- **Cross-dashboard Correlation:** Use timestamp alignment for comprehensive analysis