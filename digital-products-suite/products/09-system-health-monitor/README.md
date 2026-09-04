# System Health Monitor

A lightweight, zero-dependency, production-ready system health and endpoint monitoring dashboard built in pure Node.js. Single-file architecture with zero external runtime dependencies, providing high-frequency host telemetry (CPU, RAM, Disk) and configurable HTTP/HTTPS endpoint availability monitoring.

Developed and maintained by **[QorelySofts](https://qorelysofts.com)**.

---

## Highlights & Features

- ⚡ **Zero External Dependencies**: Operates entirely with Node.js standard library (`node:http`, `node:os`, `node:child_process`, `fetch`). No Express or external npm packages required.
- 💻 **Real-Time System Telemetry**:
  - **CPU Utilization**: Accurate core-averaged tick calculation, load averages (1m, 5m, 15m), and processor metadata.
  - **Memory Metrics**: Total, used, free RAM with dynamic percentage gauges and human-readable byte formats.
  - **Disk Capacity**: Cross-platform storage monitoring (native PowerShell CIM queries on Windows, standard `df` on Linux/macOS).
  - **Host Metadata**: Hostname, platform architecture, OS release version, and node runtime version.
- 🌐 **Automated Endpoint Ping Monitoring**:
  - Monitors HTTP/HTTPS services with configurable polling intervals and request timeouts.
  - Measures true round-trip latency in milliseconds.
  - Tracks HTTP status codes, network errors, and unexpected responses.
- 📊 **Embedded Modern Dark Dashboard**:
  - Single-file inlined HTML5/CSS3/JavaScript responsive UI.
  - Color-coded circular progress gauges (Green `< 70%`, Amber `70% - 89%`, Red `≥ 90%`).
  - Pulsing status badges, latency indicators, and live auto-refresh every 10 seconds without full-page reloads.
  - Real-time SVG timeline graph visualizing the last 60 minutes of metrics history.
- 🔌 **Standard REST JSON APIs**: Clean `/api/health`, `/api/metrics`, and `/api/endpoints` endpoints for integration with Prometheus, Datadog, Grafana, or Uptime Kuma.
- 🛡️ **Graceful Lifecycle Management**: Clean `SIGINT` / `SIGTERM` interception, clearing intervals, closing active sockets, and exiting safely.

---

## Quick Start

### Prerequisites
- Node.js >= 18.0.0 (Supports Node 18, 20, 22+)

### Installation
No `npm install` needed! This product has zero third-party dependencies.

```bash
# Clone or navigate to the product directory
cd 09-system-health-monitor

# Start the dashboard server
npm start
# or directly:
node monitor.js
```

Open your browser and navigate to:
```
http://localhost:3000/
```

---

## Configuration

Configuration is loaded from `config.json` and can be overridden using environment variables.

### Configuration File (`config.json`)
```json
{
  "port": 3000,
  "pingInterval": 30,
  "requestTimeout": 5000,
  "metricsHistorySize": 60,
  "endpoints": [
    {
      "name": "Production API",
      "url": "https://api.example.com/health",
      "expectedStatus": 200
    },
    {
      "name": "Web Application",
      "url": "https://example.com",
      "expectedStatus": 200
    },
    {
      "name": "Authentication Service",
      "url": "https://auth.example.com/status",
      "expectedStatus": 200
    }
  ]
}
```

### Environment Variable Overrides

| Environment Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Number | `3000` | Port on which the HTTP server listens. |
| `PING_INTERVAL` | Number | `30` | Frequency in seconds to ping monitored endpoints. |
| `REQUEST_TIMEOUT` | Number | `5000` | HTTP request timeout in milliseconds for endpoint probes. |
| `METRICS_HISTORY_SIZE`| Number | `60` | Number of historical 1-minute samples to retain in memory. |
| `ENDPOINTS` | String | `(from config)` | Comma-separated list of URLs to monitor (e.g. `https://api.com,https://web.com`). |

Example starting with custom environment variables:
```bash
PORT=8080 PING_INTERVAL=15 ENDPOINTS="https://google.com,https://github.com" node monitor.js
```

On Windows PowerShell:
```powershell
$env:PORT=8080; $env:PING_INTERVAL=15; node monitor.js
```

---

## REST API Reference

All API routes return JSON with appropriate CORS (`Access-Control-Allow-Origin: *`) headers and cache-invalidation headers.

### 1. Overall Health Summary
**`GET /api/health`**

Returns a high-level summary of system status and core thresholds.

```json
{
  "status": "healthy",
  "timestamp": "2026-09-04T17:05:00.000Z",
  "uptime": "2d 4h 12m 30s",
  "cpu": {
    "usagePercent": 14.5,
    "cores": 16
  },
  "memory": {
    "usedPercent": 42.1,
    "usedFormatted": "6.74 GB",
    "totalFormatted": "16.00 GB"
  },
  "disk": {
    "usedPercent": 33.3,
    "drive": "C:"
  },
  "endpoints": {
    "total": 3,
    "up": 3,
    "down": 0
  }
}
```

**Status Threshold Logic:**
- `healthy`: CPU `< 70%`, Memory `< 70%`, Disk `< 70%`, all endpoints operational.
- `warning`: Any metric between `70%` and `89%`, or at least one endpoint down.
- `critical`: Any metric `≥ 90%`, or over 50% of endpoints down.

---

### 2. Comprehensive Metrics & History
**`GET /api/metrics`**

Returns detailed host hardware metrics, load averages, and the 60-point sliding window history array.

```json
{
  "timestamp": "2026-09-04T17:05:00.000Z",
  "status": "healthy",
  "system": {
    "hostname": "PROD-SRV-01",
    "platform": "win32",
    "release": "10.0.22631",
    "type": "Windows_NT",
    "arch": "x64",
    "uptimeSeconds": 187950,
    "uptimeFormatted": "2d 4h 12m 30s",
    "nodeVersion": "v20.11.0"
  },
  "cpu": {
    "usagePercent": 14.5,
    "cores": 16,
    "model": "13th Gen Intel(R) Core(TM) i7-13700H",
    "speedMHz": 2918,
    "loadAverages": { "1m": 0.52, "5m": 0.48, "15m": 0.41 }
  },
  "memory": {
    "totalBytes": 17179869184,
    "freeBytes": 9947152384,
    "usedBytes": 7232716800,
    "usedPercent": 42.1,
    "totalFormatted": "16.00 GB",
    "usedFormatted": "6.74 GB",
    "freeFormatted": "9.26 GB"
  },
  "disk": {
    "drive": "C:",
    "totalBytes": 510287745024,
    "freeBytes": 340353961984,
    "usedBytes": 169933783040,
    "usedPercent": 33.3,
    "totalFormatted": "475.24 GB",
    "usedFormatted": "158.26 GB",
    "freeFormatted": "316.98 GB"
  },
  "endpointsSummary": { "total": 3, "up": 3, "down": 0 },
  "history": [
    {
      "time": "22:30",
      "isoTime": "2026-09-04T17:00:00.000Z",
      "cpu": 12.2,
      "memory": 41.8,
      "disk": 33.3,
      "endpointsUp": 3,
      "endpointsTotal": 3
    }
  ]
}
```

---

### 3. Monitored Endpoints Status
**`GET /api/endpoints`**

Returns the exact status, HTTP response code, and latency in milliseconds for each monitored service.

```json
[
  {
    "name": "Production API",
    "url": "https://api.example.com/health",
    "status": "up",
    "statusCode": 200,
    "statusText": "OK",
    "responseTimeMs": 142,
    "lastChecked": "2026-09-04T17:05:00.123Z",
    "error": null
  },
  {
    "name": "Web Application",
    "url": "https://example.com",
    "status": "up",
    "statusCode": 200,
    "statusText": "OK",
    "responseTimeMs": 85,
    "lastChecked": "2026-09-04T17:05:00.065Z",
    "error": null
  }
]
```

---

## Dashboard Visual Layout

The web interface is served at `GET /`:
1. **Header**: Hostname, platform indicator, live animated operational badge, and manual instant-refresh trigger.
2. **System Meta Bar**: Quick summary chips showing uptime, CPU cores count, installed RAM, volume label, and active targets.
3. **Hardware Gauges**:
   - **CPU Gauge**: Circular progress indicator with core clock and 1m/5m/15m load breakdown.
   - **RAM Gauge**: Circular progress indicator with active vs free memory.
   - **Storage Gauge**: Circular progress indicator with total, used, and free disk space.
4. **Interactive Timeline**: Real-time vector SVG dual-trend sparkline for CPU and RAM percentage progression over the past hour.
5. **Endpoints Table**: Live table showing status pills (OPERATIONAL / OFFLINE), HTTP status codes, latency badges, and timestamps.

---

## Production Deployment Tips

### 1. Running with PM2 (Recommended)
PM2 ensures the process restarts automatically on failure and boots on server restart:
```bash
npm install -g pm2
pm2 start monitor.js --name "system-health-monitor"
pm2 save
pm2 startup
```

### 2. Running via Systemd (Linux / Ubuntu / Debian)
Create `/etc/systemd/system/system-health-monitor.service`:
```ini
[Unit]
Description=System Health Monitor (QorelySofts)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/system-health-monitor
ExecStart=/usr/bin/node monitor.js
Restart=always
RestartSec=5
Environment=PORT=3000
Environment=PING_INTERVAL=30

[Install]
WantedBy=multi-user.target
```

Enable and activate the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable system-health-monitor
sudo systemctl start system-health-monitor
```

### 3. Running with Docker
A minimal Alpine Dockerfile:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json monitor.js config.json ./
EXPOSE 3000
CMD ["node", "monitor.js"]
```

Build and run:
```bash
docker build -t system-health-monitor .
docker run -d -p 3000:3000 --name monitor system-health-monitor
```

---

## Programmatic Library Usage

You can also import `monitor.js` directly in your existing Node.js applications:

```javascript
const { getSystemMetrics, checkAllEndpoints, queryDiskSpace } = require('./monitor.js');

async function checkSystem() {
  const metrics = await getSystemMetrics();
  console.log(`Current CPU: ${metrics.cpu.usagePercent}%`);
  console.log(`Current RAM: ${metrics.memory.usedPercent}%`);
  
  const endpoints = await checkAllEndpoints();
  endpoints.forEach(ep => {
    console.log(`${ep.name}: ${ep.status} (${ep.responseTimeMs}ms)`);
  });
}

checkSystem();
```

---

## License

This software is released under the **MIT License**.

Copyright &copy; 2026 **[QorelySofts](https://qorelysofts.com)**. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction.
