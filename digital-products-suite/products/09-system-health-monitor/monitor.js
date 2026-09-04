/**
 * System Health Monitor - Production Single-File Node.js Health Dashboard
 * 
 * @author QorelySofts
 * @license MIT
 */

const http = require('node:http');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

// ==========================================
// CONFIGURATION LOADER
// ==========================================

const CONFIG_PATH = path.join(__dirname, 'config.json');

/**
 * Loads configuration from config.json and merges with environment variables.
 * @returns {object} Normalized configuration object.
 */
function loadConfiguration() {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      fileConfig = JSON.parse(raw);
    } catch (err) {
      console.warn(`[Config] Failed to read ${CONFIG_PATH}: ${err.message}. Using defaults.`);
    }
  }

  // Parse endpoints from env or config
  let endpoints = [];
  if (process.env.ENDPOINTS) {
    endpoints = process.env.ENDPOINTS.split(',').map((url, idx) => ({
      name: `Endpoint ${idx + 1}`,
      url: url.trim(),
      expectedStatus: 200
    })).filter(ep => ep.url.length > 0);
  } else if (Array.isArray(fileConfig.endpoints)) {
    endpoints = fileConfig.endpoints.map(ep => {
      if (typeof ep === 'string') {
        return { name: ep, url: ep, expectedStatus: 200 };
      }
      return {
        name: ep.name || ep.url,
        url: ep.url,
        expectedStatus: ep.expectedStatus || 200
      };
    });
  } else {
    endpoints = [
      { name: 'HTTPBin Status 200', url: 'https://httpbin.org/status/200', expectedStatus: 200 },
      { name: 'Example Domain', url: 'https://example.com', expectedStatus: 200 },
      { name: 'JSONPlaceholder API', url: 'https://jsonplaceholder.typicode.com/posts/1', expectedStatus: 200 }
    ];
  }

  return {
    port: parseInt(process.env.PORT || fileConfig.port || 3000, 10),
    pingInterval: parseInt(process.env.PING_INTERVAL || fileConfig.pingInterval || 30, 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || fileConfig.requestTimeout || 5000, 10),
    metricsHistorySize: parseInt(process.env.METRICS_HISTORY_SIZE || fileConfig.metricsHistorySize || 60, 10),
    endpoints
  };
}

const config = loadConfiguration();

// ==========================================
// METRICS STATE & COLLECTION
// ==========================================

/**
 * Historical snapshot ring buffer.
 * @type {Array<object>}
 */
const metricsHistory = [];

/**
 * Latest cached endpoint ping results.
 * @type {Array<object>}
 */
let endpointResults = [];

/**
 * Cached disk space metrics to prevent excessive child process execution.
 */
let cachedDiskSpace = {
  totalBytes: 0,
  freeBytes: 0,
  usedBytes: 0,
  usedPercentage: 0,
  drive: 'N/A',
  lastUpdated: 0
};

/**
 * Previous CPU tick state for accurate delta calculation.
 */
let prevCpuTicks = getCpuRawTicks();
let currentCpuPercent = 0;

/**
 * Reads aggregate CPU idle and total ticks across all CPU cores.
 * @returns {{idle: number, total: number}}
 */
function getCpuRawTicks() {
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) {
    return { idle: 0, total: 1 };
  }
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

/**
 * Updates current CPU percentage using delta calculation.
 */
function updateCpuPercentage() {
  const current = getCpuRawTicks();
  const deltaTotal = current.total - prevCpuTicks.total;
  const deltaIdle = current.idle - prevCpuTicks.idle;

  if (deltaTotal > 0) {
    const usage = ((deltaTotal - deltaIdle) / deltaTotal) * 100;
    currentCpuPercent = Math.min(100, Math.max(0, parseFloat(usage.toFixed(1))));
  }
  prevCpuTicks = current;
}

/**
 * Formats bytes to human-readable format.
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats seconds into human-readable uptime.
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * Queries disk space on Windows or Unix/macOS.
 * @returns {Promise<object>}
 */
function queryDiskSpace() {
  return new Promise((resolve) => {
    // Return cached value if fetched within last 10 seconds
    const now = Date.now();
    if (now - cachedDiskSpace.lastUpdated < 10000 && cachedDiskSpace.totalBytes > 0) {
      return resolve(cachedDiskSpace);
    }

    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: use PowerShell CIM query
      const cmd = 'powershell.exe -NoProfile -NonInteractive -Command "Get-CimInstance Win32_LogicalDisk -Filter \\"DriveType=3\\" | Select-Object DeviceID, Size, FreeSpace | ConvertTo-Json"';
      exec(cmd, { timeout: 4000 }, (err, stdout) => {
        if (!err && stdout && stdout.trim()) {
          try {
            const parsed = JSON.parse(stdout.trim());
            const disks = Array.isArray(parsed) ? parsed : [parsed];
            if (disks.length > 0) {
              const primary = disks[0];
              const total = Number(primary.Size) || 0;
              const free = Number(primary.FreeSpace) || 0;
              const used = Math.max(0, total - free);
              const pct = total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0;
              cachedDiskSpace = {
                totalBytes: total,
                freeBytes: free,
                usedBytes: used,
                usedPercentage: pct,
                drive: primary.DeviceID || 'C:',
                lastUpdated: now
              };
              return resolve(cachedDiskSpace);
            }
          } catch (jsonErr) {
            // Ignore parse error and fallback to wmic
          }
        }

        // Fallback to wmic
        exec('wmic logicaldisk get Caption,FreeSpace,Size /format:csv', { timeout: 4000 }, (wmicErr, wmicStdout) => {
          if (!wmicErr && wmicStdout) {
            const lines = wmicStdout.trim().split('\r\n').filter(line => line && !line.startsWith('Node'));
            for (const line of lines) {
              const parts = line.split(',');
              if (parts.length >= 4) {
                const drive = parts[1];
                const free = Number(parts[2]) || 0;
                const total = Number(parts[3]) || 0;
                if (total > 0) {
                  const used = total - free;
                  const pct = parseFloat(((used / total) * 100).toFixed(1));
                  cachedDiskSpace = {
                    totalBytes: total,
                    freeBytes: free,
                    usedBytes: used,
                    usedPercentage: pct,
                    drive: drive || 'C:',
                    lastUpdated: now
                  };
                  return resolve(cachedDiskSpace);
                }
              }
            }
          }
          // Default fallback if query fails
          resolve(cachedDiskSpace);
        });
      });
    } else {
      // Unix / macOS / Linux: use df -kP /
      exec('df -kP /', { timeout: 4000 }, (err, stdout) => {
        if (!err && stdout) {
          const lines = stdout.trim().split('\n');
          if (lines.length >= 2) {
            const tokens = lines[1].replace(/\s+/g, ' ').split(' ');
            if (tokens.length >= 6) {
              const totalKb = parseInt(tokens[1], 10) || 0;
              const usedKb = parseInt(tokens[2], 10) || 0;
              const freeKb = parseInt(tokens[3], 10) || 0;
              const totalBytes = totalKb * 1024;
              const usedBytes = usedKb * 1024;
              const freeBytes = freeKb * 1024;
              const pct = totalBytes > 0 ? parseFloat(((usedBytes / totalBytes) * 100).toFixed(1)) : 0;
              cachedDiskSpace = {
                totalBytes,
                freeBytes,
                usedBytes,
                usedPercentage: pct,
                drive: tokens[5] || '/',
                lastUpdated: now
              };
              return resolve(cachedDiskSpace);
            }
          }
        }
        resolve(cachedDiskSpace);
      });
    }
  });
}

/**
 * Pings a single HTTP/HTTPS endpoint and measures latency.
 * @param {object} ep - Endpoint configuration.
 * @returns {Promise<object>}
 */
async function pingEndpoint(ep) {
  const start = Date.now();
  const url = ep.url;
  const expected = ep.expectedStatus || 200;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.requestTimeout);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'SystemHealthMonitor/1.0 (QorelySofts)'
      }
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const isUp = res.status === expected || (res.status >= 200 && res.status < 400);

    return {
      name: ep.name,
      url: ep.url,
      status: isUp ? 'up' : 'down',
      statusCode: res.status,
      statusText: res.statusText,
      responseTimeMs: latency,
      lastChecked: new Date().toISOString(),
      error: isUp ? null : `Unexpected status code: ${res.status} (expected ${expected})`
    };
  } catch (err) {
    const latency = Date.now() - start;
    const isTimeout = err.name === 'AbortError' || err.code === 20;
    return {
      name: ep.name,
      url: ep.url,
      status: 'down',
      statusCode: 0,
      statusText: isTimeout ? 'Timeout' : 'Network Error',
      responseTimeMs: latency,
      lastChecked: new Date().toISOString(),
      error: isTimeout ? `Request timed out after ${config.requestTimeout}ms` : err.message
    };
  }
}

/**
 * Pings all configured endpoints and updates results state.
 */
async function checkAllEndpoints() {
  const tasks = config.endpoints.map(ep => pingEndpoint(ep));
  const results = await Promise.all(tasks);
  endpointResults = results;
  return results;
}

/**
 * Collects a snapshot of current system metrics.
 * @returns {Promise<object>}
 */
async function getSystemMetrics() {
  const disk = await queryDiskSpace();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercent = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  // Determine overall status
  const endpointsUp = endpointResults.filter(e => e.status === 'up').length;
  const endpointsTotal = endpointResults.length;
  const allEndpointsOk = endpointsTotal === 0 || endpointsUp === endpointsTotal;

  let overallStatus = 'healthy';
  if (currentCpuPercent >= 90 || memoryPercent >= 90 || disk.usedPercentage >= 90 || endpointsUp < endpointsTotal / 2) {
    overallStatus = 'critical';
  } else if (currentCpuPercent >= 70 || memoryPercent >= 70 || disk.usedPercentage >= 70 || !allEndpointsOk) {
    overallStatus = 'warning';
  }

  return {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      type: os.type(),
      arch: os.arch(),
      uptimeSeconds: os.uptime(),
      uptimeFormatted: formatUptime(os.uptime()),
      nodeVersion: process.version
    },
    cpu: {
      usagePercent: currentCpuPercent,
      cores: cpus.length,
      model: cpus[0] ? cpus[0].model : 'Unknown',
      speedMHz: cpus[0] ? cpus[0].speed : 0,
      loadAverages: {
        '1m': parseFloat(loadAvg[0].toFixed(2)),
        '5m': parseFloat(loadAvg[1].toFixed(2)),
        '15m': parseFloat(loadAvg[2].toFixed(2))
      }
    },
    memory: {
      totalBytes: totalMem,
      freeBytes: freeMem,
      usedBytes: usedMem,
      usedPercent: memoryPercent,
      totalFormatted: formatBytes(totalMem),
      usedFormatted: formatBytes(usedMem),
      freeFormatted: formatBytes(freeMem)
    },
    disk: {
      drive: disk.drive,
      totalBytes: disk.totalBytes,
      freeBytes: disk.freeBytes,
      usedBytes: disk.usedBytes,
      usedPercent: disk.usedPercentage,
      totalFormatted: formatBytes(disk.totalBytes),
      usedFormatted: formatBytes(disk.usedBytes),
      freeFormatted: formatBytes(disk.freeBytes)
    },
    endpointsSummary: {
      total: endpointsTotal,
      up: endpointsUp,
      down: endpointsTotal - endpointsUp
    }
  };
}

/**
 * Records a data point into the in-memory circular history buffer.
 */
async function recordHistoryPoint() {
  const metrics = await getSystemMetrics();
  const point = {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isoTime: metrics.timestamp,
    cpu: metrics.cpu.usagePercent,
    memory: metrics.memory.usedPercent,
    disk: metrics.disk.usedPercent,
    endpointsUp: metrics.endpointsSummary.up,
    endpointsTotal: metrics.endpointsSummary.total
  };

  metricsHistory.push(point);
  if (metricsHistory.length > config.metricsHistorySize) {
    metricsHistory.shift();
  }
}

// ==========================================
// EMBEDDED DASHBOARD HTML
// ==========================================

/**
 * Returns the self-contained HTML status page.
 * @returns {string}
 */
function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Health Monitor | QorelySofts</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #090d16;
      --bg-surface: #111827;
      --bg-surface-elevated: #1a2234;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.4);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --color-green: #10b981;
      --color-green-glow: rgba(16, 185, 129, 0.2);
      --color-yellow: #f59e0b;
      --color-yellow-glow: rgba(245, 158, 11, 0.2);
      --color-red: #ef4444;
      --color-red-glow: rgba(239, 68, 68, 0.2);
      --color-accent: #6366f1;
      --font-main: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-main);
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    /* HEADER */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.35);
    }

    .logo-badge svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
    }

    .subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.825rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.12);
      color: var(--color-green);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-badge.warning {
      background: rgba(245, 158, 11, 0.12);
      color: var(--color-yellow);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .status-badge.critical {
      background: rgba(239, 68, 68, 0.12);
      color: var(--color-red);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
      box-shadow: 0 0 8px currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    .btn {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background: #242e44;
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* SUMMARY BANNER */
    .system-meta-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .meta-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .meta-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      font-family: var(--font-mono);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* GAUGES SECTION */
    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .gauge-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .gauge-body {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    /* CIRCLE PROGRESS */
    .circle-chart {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }

    .circle-chart svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .circle-chart circle {
      fill: transparent;
      stroke-width: 9;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease;
    }

    .circle-bg {
      stroke: rgba(255, 255, 255, 0.06);
    }

    .circle-fg {
      stroke-dasharray: 283;
      stroke-dashoffset: 283;
    }

    .circle-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: var(--font-mono);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .gauge-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.825rem;
      padding-bottom: 4px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
    }

    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .detail-label {
      color: var(--text-secondary);
    }

    .detail-value {
      font-family: var(--font-mono);
      font-weight: 600;
    }

    /* COLOR CLASSES */
    .color-green { stroke: var(--color-green); color: var(--color-green); }
    .color-yellow { stroke: var(--color-yellow); color: var(--color-yellow); }
    .color-red { stroke: var(--color-red); color: var(--color-red); }

    /* ENDPOINTS TABLE */
    .endpoints-section {
      margin-bottom: 32px;
    }

    .endpoints-table-container {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      overflow: hidden;
    }

    .endpoints-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .endpoints-table th {
      background: var(--bg-surface-elevated);
      padding: 14px 20px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border-subtle);
    }

    .endpoints-table td {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }

    .endpoints-table tr:last-child td {
      border-bottom: none;
    }

    .endpoint-name-col {
      font-weight: 600;
      color: var(--text-primary);
    }

    .endpoint-url-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      word-break: break-all;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.775rem;
      font-weight: 700;
    }

    .status-pill.up {
      background: rgba(16, 185, 129, 0.15);
      color: var(--color-green);
    }

    .status-pill.down {
      background: rgba(239, 68, 68, 0.15);
      color: var(--color-red);
    }

    .status-pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .latency-tag {
      font-family: var(--font-mono);
      font-size: 0.825rem;
      font-weight: 600;
    }

    /* HISTORY CHART */
    .history-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .chart-container {
      height: 180px;
      width: 100%;
      position: relative;
      margin-top: 16px;
    }

    .chart-container svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .chart-legend {
      display: flex;
      gap: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-color {
      width: 12px;
      height: 4px;
      border-radius: 2px;
    }

    /* FOOTER */
    footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid var(--border-subtle);
      font-size: 0.8rem;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 12px;
    }

    footer a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }

    footer a:hover {
      color: var(--text-primary);
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      body {
        padding: 16px;
      }
      .gauge-body {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .gauge-details {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand-title">
        <div class="logo-badge">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <h1>System Health Monitor</h1>
          <div class="subtitle">
            <span id="hostname">...</span> &bull; 
            <span id="platform">...</span> &bull; 
            <span>Updated <span id="lastUpdatedTime">just now</span></span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <div id="overallStatusBadge" class="status-badge">
          <div class="pulse-dot"></div>
          <span id="overallStatusText">Operational</span>
        </div>
        <button id="refreshBtn" class="btn" onclick="fetchData()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </div>
    </header>

    <!-- METADATA BAR -->
    <div class="system-meta-bar">
      <div class="meta-chip">
        <span class="meta-label">System Uptime</span>
        <span class="meta-value" id="metaUptime">--</span>
      </div>
      <div class="meta-chip">
        <span class="meta-label">CPU Cores</span>
        <span class="meta-value" id="metaCores">--</span>
      </div>
      <div class="meta-chip">
        <span class="meta-label">Total Memory</span>
        <span class="meta-value" id="metaTotalMemory">--</span>
      </div>
      <div class="meta-chip">
        <span class="meta-label">Disk Volume</span>
        <span class="meta-value" id="metaDiskVolume">--</span>
      </div>
      <div class="meta-chip">
        <span class="meta-label">Monitored Endpoints</span>
        <span class="meta-value" id="metaEndpointsCount">--</span>
      </div>
    </div>

    <!-- GAUGES -->
    <h2 class="section-title">Core Resource Utilization</h2>
    <div class="gauge-grid">
      <!-- CPU CARD -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Processor (CPU)</div>
            <div class="card-subtitle" id="cpuModel">Detecting...</div>
          </div>
        </div>
        <div class="gauge-body">
          <div class="circle-chart">
            <svg viewBox="0 0 100 100">
              <circle class="circle-bg" cx="50" cy="50" r="45"></circle>
              <circle id="cpuCircle" class="circle-fg color-green" cx="50" cy="50" r="45"></circle>
            </svg>
            <div class="circle-text" id="cpuPercent">0%</div>
          </div>
          <div class="gauge-details">
            <div class="detail-row">
              <span class="detail-label">1m Load Avg</span>
              <span class="detail-value" id="cpuLoad1">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">5m Load Avg</span>
              <span class="detail-value" id="cpuLoad5">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">15m Load Avg</span>
              <span class="detail-value" id="cpuLoad15">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Clock Speed</span>
              <span class="detail-value" id="cpuClock">--</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MEMORY CARD -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Physical Memory (RAM)</div>
            <div class="card-subtitle">Active vs Free Heap/System</div>
          </div>
        </div>
        <div class="gauge-body">
          <div class="circle-chart">
            <svg viewBox="0 0 100 100">
              <circle class="circle-bg" cx="50" cy="50" r="45"></circle>
              <circle id="memCircle" class="circle-fg color-green" cx="50" cy="50" r="45"></circle>
            </svg>
            <div class="circle-text" id="memPercent">0%</div>
          </div>
          <div class="gauge-details">
            <div class="detail-row">
              <span class="detail-label">Used</span>
              <span class="detail-value" id="memUsed">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Available</span>
              <span class="detail-value" id="memFree">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Installed</span>
              <span class="detail-value" id="memTotal">--</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DISK CARD -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Storage Disk</div>
            <div class="card-subtitle" id="diskMount">Drive Volume</div>
          </div>
        </div>
        <div class="gauge-body">
          <div class="circle-chart">
            <svg viewBox="0 0 100 100">
              <circle class="circle-bg" cx="50" cy="50" r="45"></circle>
              <circle id="diskCircle" class="circle-fg color-green" cx="50" cy="50" r="45"></circle>
            </svg>
            <div class="circle-text" id="diskPercent">0%</div>
          </div>
          <div class="gauge-details">
            <div class="detail-row">
              <span class="detail-label">Used Space</span>
              <span class="detail-value" id="diskUsed">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Free Space</span>
              <span class="detail-value" id="diskFree">--</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Capacity</span>
              <span class="detail-value" id="diskTotal">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- METRICS HISTORY TIMELINE -->
    <div class="history-card">
      <div class="card-header" style="margin-bottom: 8px;">
        <div>
          <div class="card-title">Historical Trends (Last 60 Minutes)</div>
          <div class="card-subtitle">Real-time CPU and Memory utilization timeline</div>
        </div>
      </div>
      <div class="chart-container" id="chartContainer">
        <svg id="timelineSvg" preserveAspectRatio="none" viewBox="0 0 600 120"></svg>
      </div>
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #38bdf8;"></div>
          <span>CPU %</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #a855f7;"></div>
          <span>Memory %</span>
        </div>
      </div>
    </div>

    <!-- ENDPOINTS MONITOR -->
    <div class="endpoints-section">
      <h2 class="section-title">External Endpoint Health &amp; Latency</h2>
      <div class="endpoints-table-container">
        <table class="endpoints-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Endpoint / Target</th>
              <th>HTTP Code</th>
              <th>Response Time</th>
              <th>Last Checked</th>
            </tr>
          </thead>
          <tbody id="endpointsTableBody">
            <tr>
              <td colspan="5" style="text-align: center; color: var(--text-muted);">Pinging endpoints...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FOOTER -->
    <footer>
      <div>System Health Monitor &bull; Self-Hosted Production Node.js Engine</div>
      <div>Designed &amp; Maintained by <a href="https://qorelysofts.com" target="_blank" rel="noopener">QorelySofts</a></div>
    </footer>
  </div>

  <script>
    const CIRCUMFERENCE = 282.74; // 2 * Math.PI * 45

    function getColorClass(percent) {
      if (percent >= 90) return 'color-red';
      if (percent >= 70) return 'color-yellow';
      return 'color-green';
    }

    function updateGauge(circleEl, textEl, percent) {
      const clamped = Math.min(100, Math.max(0, percent));
      const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
      circleEl.style.strokeDashoffset = offset;
      circleEl.className.baseVal = 'circle-fg ' + getColorClass(clamped);
      textEl.textContent = clamped + '%';
    }

    function renderTimeline(history) {
      const svg = document.getElementById('timelineSvg');
      if (!history || history.length < 2) {
        svg.innerHTML = '<text x="300" y="60" text-anchor="middle" fill="#64748b" font-size="12">Collecting data points...</text>';
        return;
      }

      const width = 600;
      const height = 120;
      const padding = 10;
      const step = (width - padding * 2) / (history.length - 1);

      let cpuPoints = [];
      let memPoints = [];

      history.forEach((pt, i) => {
        const x = padding + i * step;
        const yCpu = height - padding - (pt.cpu / 100) * (height - padding * 2);
        const yMem = height - padding - (pt.memory / 100) * (height - padding * 2);
        cpuPoints.push(\`\${x.toFixed(1)},\${yCpu.toFixed(1)}\`);
        memPoints.push(\`\${x.toFixed(1)},\${yMem.toFixed(1)}\`);
      });

      // Horizontal reference grid lines at 25%, 50%, 75%
      let gridLines = '';
      [25, 50, 75].forEach(pct => {
        const y = height - padding - (pct / 100) * (height - padding * 2);
        gridLines += \`<line x1="0" y1="\${y}" x2="\${width}" y2="\${y}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 4" stroke-width="1" />\`;
      });

      svg.innerHTML = \`
        \${gridLines}
        <polyline fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="\${cpuPoints.join(' ')}" />
        <polyline fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="\${memPoints.join(' ')}" />
      \`;
    }

    async function fetchData() {
      try {
        const [metricsRes, endpointsRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/endpoints')
        ]);

        if (!metricsRes.ok || !endpointsRes.ok) return;

        const metricsData = await metricsRes.json();
        const endpointsData = await endpointsRes.json();

        // Update Header & System meta
        document.getElementById('hostname').textContent = metricsData.system.hostname;
        document.getElementById('platform').textContent = \`\${metricsData.system.type} (\${metricsData.system.arch})\`;
        document.getElementById('lastUpdatedTime').textContent = new Date().toLocaleTimeString();

        document.getElementById('metaUptime').textContent = metricsData.system.uptimeFormatted;
        document.getElementById('metaCores').textContent = \`\${metricsData.cpu.cores} Core\${metricsData.cpu.cores > 1 ? 's' : ''}\`;
        document.getElementById('metaTotalMemory').textContent = metricsData.memory.totalFormatted;
        document.getElementById('metaDiskVolume').textContent = metricsData.disk.drive;
        document.getElementById('metaEndpointsCount').textContent = \`\${endpointsData.length} Targets\`;

        // Overall status
        const overallBadge = document.getElementById('overallStatusBadge');
        const overallText = document.getElementById('overallStatusText');
        overallBadge.className = 'status-badge ' + (metricsData.status === 'healthy' ? '' : metricsData.status);
        overallText.textContent = metricsData.status.toUpperCase();

        // CPU Card
        document.getElementById('cpuModel').textContent = metricsData.cpu.model;
        updateGauge(
          document.getElementById('cpuCircle'),
          document.getElementById('cpuPercent'),
          metricsData.cpu.usagePercent
        );
        document.getElementById('cpuLoad1').textContent = metricsData.cpu.loadAverages['1m'];
        document.getElementById('cpuLoad5').textContent = metricsData.cpu.loadAverages['5m'];
        document.getElementById('cpuLoad15').textContent = metricsData.cpu.loadAverages['15m'];
        document.getElementById('cpuClock').textContent = metricsData.cpu.speedMHz ? \`\${metricsData.cpu.speedMHz} MHz\` : 'N/A';

        // Memory Card
        updateGauge(
          document.getElementById('memCircle'),
          document.getElementById('memPercent'),
          metricsData.memory.usedPercent
        );
        document.getElementById('memUsed').textContent = metricsData.memory.usedFormatted;
        document.getElementById('memFree').textContent = metricsData.memory.freeFormatted;
        document.getElementById('memTotal').textContent = metricsData.memory.totalFormatted;

        // Disk Card
        document.getElementById('diskMount').textContent = \`Volume \${metricsData.disk.drive}\`;
        updateGauge(
          document.getElementById('diskCircle'),
          document.getElementById('diskPercent'),
          metricsData.disk.usedPercent
        );
        document.getElementById('diskUsed').textContent = metricsData.disk.usedFormatted;
        document.getElementById('diskFree').textContent = metricsData.disk.freeFormatted;
        document.getElementById('diskTotal').textContent = metricsData.disk.totalFormatted;

        // Render History Sparkline
        renderTimeline(metricsData.history);

        // Endpoints Table
        const tbody = document.getElementById('endpointsTableBody');
        if (endpointsData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No endpoints configured.</td></tr>';
        } else {
          tbody.innerHTML = endpointsData.map(ep => {
            const isUp = ep.status === 'up';
            const statusClass = isUp ? 'up' : 'down';
            const latencyColor = ep.responseTimeMs < 300 ? 'var(--color-green)' : (ep.responseTimeMs < 800 ? 'var(--color-yellow)' : 'var(--color-red)');
            return \`
              <tr>
                <td>
                  <span class="status-pill \${statusClass}">
                    <span class="status-pill-dot"></span>
                    \${isUp ? 'OPERATIONAL' : 'OFFLINE'}
                  </span>
                </td>
                <td>
                  <div class="endpoint-name-col">\${escapeHtml(ep.name)}</div>
                  <div class="endpoint-url-sub">\${escapeHtml(ep.url)}</div>
                </td>
                <td>
                  <span style="font-family: var(--font-mono); font-weight: 600; color: \${isUp ? 'var(--text-primary)' : 'var(--color-red)'}">
                    \${ep.statusCode > 0 ? ep.statusCode : 'ERR'}
                  </span>
                  <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 4px;">\${escapeHtml(ep.statusText || '')}</span>
                </td>
                <td>
                  <span class="latency-tag" style="color: \${latencyColor}">\${ep.responseTimeMs} ms</span>
                </td>
                <td style="color: var(--text-muted); font-size: 0.8rem; font-family: var(--font-mono);">
                  \${new Date(ep.lastChecked).toLocaleTimeString()}
                </td>
              </tr>
            \`;
          }).join('');
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Initial Fetch & 10s auto-refresh
    fetchData();
    setInterval(fetchData, 10000);
  </script>
</body>
</html>`;
}

// ==========================================
// HTTP SERVER & ROUTING
// ==========================================

/**
 * Sends a JSON response with standard CORS and caching headers.
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {object} data
 */
function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(json);
}

/**
 * Handles incoming HTTP requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    if (pathname === '/') {
      const html = renderDashboardHtml();
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
        'Cache-Control': 'no-cache'
      });
      return res.end(html);
    }

    if (pathname === '/api/health') {
      if (endpointResults.length === 0) {
        await checkAllEndpoints();
      }
      const metrics = await getSystemMetrics();
      return sendJson(res, 200, {
        status: metrics.status,
        timestamp: metrics.timestamp,
        uptime: metrics.system.uptimeFormatted,
        cpu: {
          usagePercent: metrics.cpu.usagePercent,
          cores: metrics.cpu.cores
        },
        memory: {
          usedPercent: metrics.memory.usedPercent,
          usedFormatted: metrics.memory.usedFormatted,
          totalFormatted: metrics.memory.totalFormatted
        },
        disk: {
          usedPercent: metrics.disk.usedPercent,
          drive: metrics.disk.drive
        },
        endpoints: metrics.endpointsSummary
      });
    }

    if (pathname === '/api/metrics') {
      const metrics = await getSystemMetrics();
      return sendJson(res, 200, {
        ...metrics,
        history: metricsHistory
      });
    }

    if (pathname === '/api/endpoints') {
      if (endpointResults.length === 0) {
        await checkAllEndpoints();
      }
      return sendJson(res, 200, endpointResults);
    }

    // 404 Fallback
    return sendJson(res, 404, { error: 'Not Found', path: pathname });
  } catch (err) {
    console.error(`[Server Error] ${err.stack || err.message}`);
    return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
}

// ==========================================
// DAEMON & INTERVAL TIMERS
// ==========================================

const server = http.createServer(handleRequest);

let cpuTimer = null;
let pingTimer = null;
let historyTimer = null;

function startBackgroundTasks() {
  // CPU sampler timer (every 2.5s for smooth delta computation)
  cpuTimer = setInterval(updateCpuPercentage, 2500);

  // Endpoint ping loop (every config.pingInterval seconds)
  pingTimer = setInterval(async () => {
    try {
      await checkAllEndpoints();
    } catch (err) {
      console.error('[Ping Loop Error]', err.message);
    }
  }, config.pingInterval * 1000);

  // Historical metrics recorder (every 60s for 60-min history)
  historyTimer = setInterval(async () => {
    try {
      await recordHistoryPoint();
    } catch (err) {
      console.error('[History Recorder Error]', err.message);
    }
  }, 60000);
}

// Initial bootstrap run when executed directly
if (require.main === module) {
  (async () => {
    updateCpuPercentage();
    await queryDiskSpace();
    await checkAllEndpoints();
    await recordHistoryPoint();
    startBackgroundTasks();

    server.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`  SYSTEM HEALTH MONITOR - QorelySofts`);
      console.log(`======================================================`);
      console.log(`  Dashboard URL : http://localhost:${config.port}/`);
      console.log(`  Health API    : http://localhost:${config.port}/api/health`);
      console.log(`  Metrics API   : http://localhost:${config.port}/api/metrics`);
      console.log(`  Endpoints API : http://localhost:${config.port}/api/endpoints`);
      console.log(`  Ping Interval : ${config.pingInterval} seconds`);
      console.log(`  Endpoints     : ${config.endpoints.length} configured`);
      console.log(`======================================================\n`);
    });
  })();

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

function shutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully stopping System Health Monitor...`);
  if (cpuTimer) clearInterval(cpuTimer);
  if (pingTimer) clearInterval(pingTimer);
  if (historyTimer) clearInterval(historyTimer);

  server.close(() => {
    console.log('[Shutdown] HTTP server closed cleanly. Exiting.');
    process.exit(0);
  });

  // Force exit after 5 seconds if connections hang
  setTimeout(() => {
    console.error('[Shutdown] Forceful termination after timeout.');
    process.exit(1);
  }, 5000).unref();
}

module.exports = {
  server,
  config,
  getSystemMetrics,
  checkAllEndpoints,
  queryDiskSpace,
  renderDashboardHtml
};
