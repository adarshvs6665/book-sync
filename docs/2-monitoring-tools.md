# Monitoring Services Configuration Guide

## Overview
This document provides a comprehensive breakdown of all configuration files and Docker Compose setup for the BookSync microservices monitoring stack. Every configuration parameter is explained with its purpose and impact on the monitoring system.

---

## Docker Compose Configuration

### Application Services

#### Auth Service Configuration
```yaml
auth:
  build:
    dockerfile: Dockerfile
    context: ./auth
  container_name: auth
  ports:
    - "5000:5000"
  restart: always
  volumes:
    - .:/app
    - /app/auth/node_modules
  env_file:
    - ./auth/.env.development
  networks:
    - monitoring
  depends_on:
    - jaeger
```

**Configuration Breakdown:**
- `build.dockerfile: Dockerfile` - Uses Dockerfile in the auth directory for building the container image
- `build.context: ./auth` - Sets build context to the auth service directory, allowing COPY commands to access auth service files
- `container_name: auth` - Assigns fixed container name for service discovery within Docker network
- `ports: "5000:5000"` - Maps host port 5000 to container port 5000, enabling external access to auth API and metrics endpoint
- `restart: always` - Ensures container automatically restarts on failure or system reboot
- `volumes: .:/app` - Mounts project root to /app for development hot-reload
- `volumes: /app/auth/node_modules` - Creates anonymous volume for node_modules to prevent host overwriting container dependencies
- `env_file: ./auth/.env.development` - Loads environment variables from development configuration file
- `networks: monitoring` - Connects to monitoring network for inter-service communication
- `depends_on: jaeger` - Ensures Jaeger starts before auth service, preventing OpenTelemetry connection failures

#### Books Service Configuration
```yaml
books:
  build:
    dockerfile: Dockerfile
    context: ./books
  container_name: books
  ports:
    - "5001:5001"
  restart: always
  volumes:
    - .:/app
    - /app/books/node_modules
  env_file:
    - ./books/.env.development
  networks:
    - monitoring
```

**Configuration Breakdown:**
- `ports: "5001:5001"` - Exposes books service on port 5001 for API access and Prometheus metrics scraping
- `context: ./books` - Build context for books service, isolating build dependencies
- `volumes: /app/books/node_modules` - Prevents host node_modules from overriding container-optimized dependencies
- No `depends_on` specified - Books service can start independently of other services

#### Borrow Service Configuration
```yaml
borrow:
  build:
    dockerfile: Dockerfile
    context: ./borrow
  container_name: borrow
  ports:
    - "5002:5002"
  restart: always
  volumes:
    - .:/app/
    - /app/borrow/node_modules
  env_file:
    - ./borrow/.env.development
  networks:
    - monitoring
```

**Configuration Breakdown:**
- `ports: "5002:5002"` - Unique port assignment for borrow service to avoid conflicts
- `volumes: .:/app/` - Note the trailing slash, functionally identical to `.:/app`
- Similar volume and network configuration pattern as other microservices

#### Nginx Proxy Configuration
```yaml
nginx-proxy:
  build:
    dockerfile: Dockerfile
    context: ./proxy
  depends_on:
    - auth
    - books
    - borrow
  ports:
    - 8001:8001
  networks:
    - monitoring
```

**Configuration Breakdown:**
- `depends_on: [auth, books, borrow]` - Ensures all backend services are available before proxy starts
- `ports: 8001:8001` - Exposes load balancer on port 8001
- No restart policy - Relies on manual restart for proxy configuration changes
- No volumes - Proxy configuration is baked into the Docker image

### Monitoring Infrastructure Services

#### Prometheus Configuration
```yaml
prometheus:
  image: prom/prometheus
  container_name: prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus-data:/prometheus
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - monitoring
```

**Configuration Breakdown:**
- `image: prom/prometheus` - Uses official Prometheus Docker image instead of building from Dockerfile
- `ports: "9090:9090"` - Standard Prometheus web UI and API port
- `volumes: ./prometheus-data:/prometheus` - Persists TSDB data to host filesystem for data retention across container restarts
- `volumes: ./prometheus.yml:/etc/prometheus/prometheus.yml` - Mounts custom configuration file, overriding default settings
- No restart policy - Prometheus data persistence allows for manual restarts without data loss

#### Grafana Configuration
```yaml
grafana:
  image: grafana/grafana
  container_name: grafana
  ports:
    - "3000:3000"
  volumes:
    - grafana-data:/var/lib/grafana
    - ./provisioning:/etc/grafana/provisioning
  networks:
    - monitoring
```

**Configuration Breakdown:**
- `image: grafana/grafana` - Official Grafana Docker image
- `ports: "3000:3000"` - Standard Grafana web interface port
- `volumes: grafana-data:/var/lib/grafana` - Named volume for Grafana database and dashboard storage
- `volumes: ./provisioning:/etc/grafana/provisioning` - Mounts provisioning directory for automatic datasource and dashboard configuration
- Named volume ensures data persistence while allowing multiple containers to share the same data

#### Jaeger Configuration
```yaml
jaeger:
  image: jaegertracing/all-in-one:latest
  container_name: jaeger
  ports:
    - "16686:16686"
    - "14268"
    - "14250"
  networks:
    - monitoring
  restart: always
```

**Configuration Breakdown:**
- `image: jaegertracing/all-in-one:latest` - Single container with all Jaeger components (collector, query, UI)
- `ports: "16686:16686"` - Jaeger web UI port exposed to host
- `ports: "14268"` - Jaeger collector HTTP port (container-only access)
- `ports: "14250"` - Jaeger collector gRPC port (container-only access)
- Ports without host mapping are accessible only within Docker network
- `restart: always` - Ensures tracing availability for application services

#### InfluxDB Configuration
```yaml
influxdb:
  image: influxdb:2.7
  container_name: influxdb
  ports:
    - "8086:8086"
  volumes:
    - influxdb-data:/var/lib/influxdb2
    - ./influxdb-config:/etc/influxdb2
  environment:
    - DOCKER_INFLUXDB_INIT_MODE=setup
    - DOCKER_INFLUXDB_INIT_USERNAME=admin
    - DOCKER_INFLUXDB_INIT_PASSWORD=admin123
    - DOCKER_INFLUXDB_INIT_ORG=book-sync-org
    - DOCKER_INFLUXDB_INIT_BUCKET=monitoring-bucket
  networks:
    - monitoring
  restart: always
```

**Configuration Breakdown:**
- `image: influxdb:2.7` - InfluxDB version 2.7 for time series data storage
- `ports: "8086:8086"` - Standard InfluxDB API and web UI port
- `volumes: influxdb-data:/var/lib/influxdb2` - Persists time series database files
- `volumes: ./influxdb-config:/etc/influxdb2` - Mounts additional configuration files
- `DOCKER_INFLUXDB_INIT_MODE=setup` - Automatically initializes database on first run
- `DOCKER_INFLUXDB_INIT_USERNAME=admin` - Sets initial admin username
- `DOCKER_INFLUXDB_INIT_PASSWORD=admin123` - Sets initial admin password (should be changed in production)
- `DOCKER_INFLUXDB_INIT_ORG=book-sync-org` - Creates default organization for data isolation
- `DOCKER_INFLUXDB_INIT_BUCKET=monitoring-bucket` - Creates default bucket for metrics storage
- `restart: always` - Critical for continuous metrics storage

#### OpenTelemetry Collector Configuration
```yaml
otel-collector:
  image: otel/opentelemetry-collector:latest
  container_name: otel-collector
  ports:
    - "1888:1888"   # pprof extension
    - "8888:8888"   # Prometheus metrics exposed by the collector
    - "8889:8889"   # Prometheus exporter metrics
    - "13133:13133" # health_check extension
    - "4317:4317"   # OTLP gRPC receiver
    - "55679:55679" # zpages extension
  volumes:
    - ./collector-config.yaml:/etc/otelcol/config.yaml
  command: ["--config=/etc/otelcol/config.yaml"]
  depends_on:
    - jaeger
  networks:
    - monitoring
  restart: always
```

**Configuration Breakdown:**
- `image: otel/opentelemetry-collector:latest` - Official OpenTelemetry Collector
- `ports: "1888:1888"` - pprof extension for Go profiling and debugging
- `ports: "8888:8888"` - Internal collector metrics in Prometheus format
- `ports: "8889:8889"` - Prometheus exporter metrics endpoint
- `ports: "13133:13133"` - Health check endpoint for monitoring collector status
- `ports: "4317:4317"` - OTLP gRPC receiver for high-performance trace ingestion
- `ports: "55679:55679"` - zpages extension for collector debugging and statistics
- `volumes: ./collector-config.yaml:/etc/otelcol/config.yaml` - Custom collector configuration
- `command: ["--config=/etc/otelcol/config.yaml"]` - Overrides default configuration path
- `depends_on: jaeger` - Ensures Jaeger is available for trace export

#### Telegraf Configuration
```yaml
telegraf:
  image: telegraf:latest
  container_name: telegraf
  ports:
    - "9273:9273"
  restart: always
  networks:
    - monitoring
  volumes:
    - ./telegraf.conf:/etc/telegraf/telegraf.conf:ro
  depends_on:
    - auth
    - books
    - borrow
  command: telegraf --config /etc/telegraf/telegraf.conf
```

**Configuration Breakdown:**
- `image: telegraf:latest` - Latest Telegraf metrics collection agent
- `ports: "9273:9273"` - Prometheus client output port for metrics exposure
- `volumes: ./telegraf.conf:/etc/telegraf/telegraf.conf:ro` - Read-only mount of configuration file
- `depends_on: [auth, books, borrow]` - Ensures target services are available before metrics collection
- `command: telegraf --config /etc/telegraf/telegraf.conf` - Explicitly specifies configuration file path

### Volume and Network Configuration

#### Named Volumes
```yaml
volumes:
  grafana-data:
  influxdb-data:
```

**Configuration Breakdown:**
- `grafana-data:` - Named volume for Grafana dashboards, users, and settings persistence
- `influxdb-data:` - Named volume for InfluxDB time series data persistence
- Named volumes are managed by Docker and survive container removal
- Provides better data isolation than host-mounted volumes

#### Network Configuration
```yaml
networks:
  monitoring:
```

**Configuration Breakdown:**
- `monitoring:` - Custom bridge network for all services
- Enables service-to-service communication using container names as hostnames
- Provides network isolation from other Docker networks
- Default driver is `bridge` when not specified

---

## Prometheus Configuration (prometheus.yml)

### Global Settings
```yaml
global:
  scrape_interval: 15s
```

**Configuration Breakdown:**
- `scrape_interval: 15s` - Default interval for collecting metrics from all targets
- 15-second interval balances data granularity with resource usage
- Can be overridden per job for specific requirements

### Scrape Configurations
```yaml
scrape_configs:
  - job_name: "auth"
    static_configs:
      - targets: ["auth:5000"]
  - job_name: "books"
    static_configs:
      - targets: ["books:5001"]
  - job_name: "borrow"
    static_configs:
      - targets: ["borrow:5002"]
  - job_name: "telegraf"
    static_configs:
      - targets: ["telegraf:9273"]
```

**Configuration Breakdown:**
- `job_name: "auth"` - Logical grouping for auth service metrics
- `static_configs:` - Manual target specification (alternative to service discovery)
- `targets: ["auth:5000"]` - Container name and port for metrics endpoint
- Each job targets `/metrics` endpoint by default
- Telegraf job collects metrics from Telegraf's Prometheus client output

### Remote Write Configuration
```yaml
remote_write:
  - url: "http://influxdb:8086/api/v1/prom/write?bucket=monitoring-bucket&org=book-sync-org"
    bearer_token: "admin123"
```

**Configuration Breakdown:**
- `remote_write:` - Sends metrics to remote storage system
- `url: "http://influxdb:8086/api/v1/prom/write"` - InfluxDB Prometheus remote write endpoint
- `bucket=monitoring-bucket` - Target InfluxDB bucket for data storage
- `org=book-sync-org` - InfluxDB organization for data isolation
- `bearer_token: "admin123"` - Authentication token for InfluxDB API access
- Enables dual storage: Prometheus TSDB + InfluxDB for different query patterns

---

## Telegraf Configuration (telegraf.conf)

### HTTP Input Plugin
```toml
[[inputs.http]]
  urls = [
    "http://auth:5000/metrics",
    "http://books:5001/metrics",
    "http://borrow:5002/metrics"
  ]
  method = "GET"
  interval = "10s"
```

**Configuration Breakdown:**
- `[[inputs.http]]` - HTTP input plugin for scraping web endpoints
- `urls = [...]` - List of Prometheus metrics endpoints to scrape
- `method = "GET"` - HTTP method for endpoint requests
- `interval = "10s"` - Collection frequency (faster than Prometheus 15s)
- Automatically parses Prometheus format metrics

### Prometheus Client Output
```toml
[[outputs.prometheus_client]]
  listen = ":9273"
```

**Configuration Breakdown:**
- `[[outputs.prometheus_client]]` - Exposes collected metrics in Prometheus format
- `listen = ":9273"` - Port for Prometheus to scrape Telegraf metrics
- Creates a metrics re-export mechanism for additional processing

### InfluxDB Output
```toml
[[outputs.influxdb_v2]]
  urls = ["http://influxdb:8086"]
  token = "admin123"
  organization = "book-sync-org"
  bucket = "monitoring-bucket"
```

**Configuration Breakdown:**
- `[[outputs.influxdb_v2]]` - InfluxDB v2 output plugin
- `urls = ["http://influxdb:8086"]` - InfluxDB server URL
- `token = "admin123"` - Authentication token for API access
- `organization = "book-sync-org"` - Target organization
- `bucket = "monitoring-bucket"` - Target bucket for data storage
- Provides direct data path bypassing Prometheus

---

## OpenTelemetry Collector Configuration (collector-config.toml)

### Receivers Configuration
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
```

**Configuration Breakdown:**
- `receivers:` - Defines how telemetry data is received
- `otlp:` - OpenTelemetry Protocol receiver
- `protocols.grpc.endpoint: 0.0.0.0:4317` - gRPC protocol on all interfaces, port 4317
- `protocols.http.endpoint: 0.0.0.0:4318` - HTTP protocol on all interfaces, port 4318
- `0.0.0.0` binds to all network interfaces within container
- Supports both binary (gRPC) and JSON (HTTP) formats

### Exporters Configuration
```yaml
exporters:
  otlp:
    endpoint: jaeger:4317
    tls:
      insecure: true
  
  influxdb:
    endpoint: "http://influxdb:8086"
    token: "admin123"
    org: "book-sync-org"
    bucket: "monitoring-bucket"
```

**Configuration Breakdown:**
- `exporters:` - Defines where processed telemetry data is sent
- `otlp.endpoint: jaeger:4317` - Forwards traces to Jaeger collector
- `tls.insecure: true` - Disables TLS for internal communication
- `influxdb.endpoint: "http://influxdb:8086"` - InfluxDB server URL
- `influxdb.token: "admin123"` - InfluxDB authentication token
- `influxdb.org: "book-sync-org"` - InfluxDB organization
- `influxdb.bucket: "monitoring-bucket"` - Target bucket for trace data

### Service Pipeline Configuration
```yaml
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]
```

**Configuration Breakdown:**
- `service:` - Defines data processing pipelines
- `pipelines.traces:` - Pipeline for trace data processing
- `receivers: [otlp]` - Uses OTLP receiver for trace ingestion
- `exporters: [otlp]` - Exports traces to Jaeger via OTLP
- No processors defined - traces pass through without modification

---

## Grafana Provisioning Configuration

### Dashboard Provisioning (dashboard.yml)
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

**Configuration Breakdown:**
- `apiVersion: 1` - Grafana provisioning API version
- `providers:` - List of dashboard providers
- `name: 'default'` - Unique provider name
- `orgId: 1` - Target Grafana organization ID (1 is default)
- `folder: ''` - Empty string means root folder (no subfolder)
- `type: file` - File-based dashboard provisioning
- `disableDeletion: false` - Allows dashboard deletion via UI
- `options.path: /etc/grafana/provisioning/dashboards` - Directory containing dashboard JSON files

### Datasource Provisioning (datasource.yml)
```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
    editable: true
```

**Configuration Breakdown:**
- `apiVersion: 1` - Grafana provisioning API version
- `datasources:` - List of datasource configurations

**Prometheus Datasource:**
- `name: Prometheus` - Display name in Grafana UI
- `type: prometheus` - Datasource plugin type
- `access: proxy` - Grafana server proxies requests (vs browser direct access)
- `url: http://prometheus:9090` - Prometheus server URL using container name
- `isDefault: true` - Sets as default datasource for new panels
- `editable: true` - Allows modification via UI

**Jaeger Datasource:**
- `name: Jaeger` - Display name in Grafana UI
- `type: jaeger` - Jaeger tracing plugin type
- `access: proxy` - Server-side request proxying
- `url: http://jaeger:16686` - Jaeger query service URL
- `editable: true` - Allows UI configuration changes
- No `isDefault` - Secondary datasource for trace queries

---

## Configuration Integration Analysis

### Data Flow Configuration
1. **Metrics Collection:** Application services expose metrics on `/metrics` endpoints
2. **Dual Collection:** Both Prometheus (15s) and Telegraf (10s) scrape same endpoints
3. **Storage:** Prometheus stores in TSDB, Telegraf writes to InfluxDB
4. **Visualization:** Grafana queries both datasources for comprehensive dashboards

### Trace Data Flow
1. **Generation:** Applications send traces via OTLP to collector
2. **Processing:** Collector receives on ports 4317/4318 and forwards to Jaeger
3. **Storage:** Jaeger stores traces for querying and visualization
4. **Analysis:** Grafana Jaeger datasource enables dashboard trace integration

### High Availability Considerations
- `restart: always` policies ensure service recovery
- Named volumes provide data persistence across container restarts
- Multiple metrics collection paths provide redundancy
- Network isolation prevents external interference

This configuration provides a robust, scalable monitoring foundation with comprehensive observability coverage for the BookSync microservices architecture.