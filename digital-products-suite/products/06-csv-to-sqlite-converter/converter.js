#!/usr/bin/env node

/**
 * @file High-performance streaming CSV to SQLite converter CLI
 * @author QorelySofts
 */

const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

// ============================================================================
// ANSI TERMINAL FORMATTING UTILITIES
// ============================================================================

const isColorSupported =
  Boolean(process.stdout.isTTY) &&
  !process.env['NO_COLOR'] &&
  process.env['TERM'] !== 'dumb';

const colors = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  blue: isColorSupported ? '\x1b[34m' : '',
  gray: isColorSupported ? '\x1b[90m' : '',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================================================
// CLI ARGUMENT PARSER
// ============================================================================

function parseCliArgs(argv) {
  const args = {
    input: null,
    output: null,
    table: null,
    delimiter: null,
    encoding: 'utf8',
    createIndex: false,
    dryRun: false,
    batchSize: 1000,
    help: false,
    version: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--version' || arg === '-v') {
      args.version = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--create-index') {
      args.createIndex = true;
    } else if (arg === '--input' || arg === '-i') {
      args.input = argv[++i];
    } else if (arg.startsWith('--input=')) {
      args.input = arg.slice('--input='.length);
    } else if (arg === '--output' || arg === '-o') {
      args.output = argv[++i];
    } else if (arg.startsWith('--output=')) {
      args.output = arg.slice('--output='.length);
    } else if (arg === '--table' || arg === '-t') {
      args.table = argv[++i];
    } else if (arg.startsWith('--table=')) {
      args.table = arg.slice('--table='.length);
    } else if (arg === '--delimiter' || arg === '-d') {
      args.delimiter = argv[++i];
    } else if (arg.startsWith('--delimiter=')) {
      args.delimiter = arg.slice('--delimiter='.length);
    } else if (arg === '--encoding' || arg === '-e') {
      args.encoding = argv[++i];
    } else if (arg.startsWith('--encoding=')) {
      args.encoding = arg.slice('--encoding='.length);
    } else if (arg === '--batch-size' || arg === '-b') {
      const b = parseInt(argv[++i], 10);
      if (!Number.isNaN(b) && b > 0) args.batchSize = b;
    } else if (!arg.startsWith('-') && !args.input) {
      args.input = arg;
    }
  }

  // Handle delimiter escape sequences (e.g. "\t")
  if (args.delimiter) {
    if (args.delimiter === '\\t' || args.delimiter === 'tab') {
      args.delimiter = '\t';
    } else if (args.delimiter === '\\s') {
      args.delimiter = ' ';
    }
  }

  return args;
}

function printHelp() {
  console.log(`
${colors.bold}${colors.cyan}CSV to SQLite Converter${colors.reset} - High Performance Streaming ETL
${colors.gray}Developed by QorelySofts${colors.reset}

${colors.bold}USAGE:${colors.reset}
  node converter.js --input <file.csv> [options]
  npx csv-to-sqlite --input <file.csv> [options]

${colors.bold}REQUIRED ARGUMENTS:${colors.reset}
  -i, --input <path>         Path to source CSV file

${colors.bold}OPTIONS:${colors.reset}
  -o, --output <path>        Path to SQLite database file
                             ${colors.gray}(defaults to <input_basename>.db)${colors.reset}
  -t, --table <name>         Target SQLite table name
                             ${colors.gray}(defaults to sanitized input filename)${colors.reset}
  -d, --delimiter <char>     Field delimiter: , ; \\t |
                             ${colors.gray}(auto-detected if omitted)${colors.reset}
  -e, --encoding <enc>       File encoding: utf8, latin1, etc.
                             ${colors.gray}(default: utf8)${colors.reset}
  -b, --batch-size <num>     Rows inserted per transaction batch
                             ${colors.gray}(default: 1000)${colors.reset}
  --create-index             Automatically create indexes on ID, email, and name columns
  --dry-run                  Analyze schema & sample data without writing to database
  -h, --help                 Display this help screen
  -v, --version              Show version number

${colors.bold}EXAMPLES:${colors.reset}
  ${colors.gray}# Simple conversion with auto-detected delimiter & schema:${colors.reset}
  node converter.js --input users.csv

  ${colors.gray}# Custom output DB, table name, and auto-indexing enabled:${colors.reset}
  node converter.js -i data.csv -o analytics.db -t transactions --create-index

  ${colors.gray}# Dry run preview of large file:${colors.reset}
  node converter.js -i bigdata.csv --dry-run
`);
}

// ============================================================================
// STREAMING CSV PARSER & DELIMITER DETECTION
// ============================================================================

/**
 * Auto-detects delimiter by inspecting the first chunk of the file.
 * Tests candidate delimiters: comma, semicolon, tab, and pipe.
 *
 * @param {string} filePath - Absolute or relative file path
 * @param {string} encoding - File character encoding
 * @returns {string} Detected delimiter
 */
function detectDelimiter(filePath, encoding = 'utf8') {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(16384);
  const bytesRead = fs.readSync(fd, buffer, 0, 16384, 0);
  fs.closeSync(fd);

  let sample = buffer.toString(encoding, 0, bytesRead);

  // Strip BOM if present
  if (sample.charCodeAt(0) === 0xfeff) {
    sample = sample.slice(1);
  }

  const candidates = [',', ';', '\t', '|'];
  const lines = sample
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 10);

  if (lines.length === 0) return ',';

  let bestDelimiter = ',';
  let bestScore = -1;

  for (const delimiter of candidates) {
    const counts = lines.map((line) => {
      // Count delimiters outside quotes
      let count = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === delimiter && !inQuotes) {
          count++;
        }
      }
      return count;
    });

    const firstCount = counts[0] || 0;
    if (firstCount === 0) continue;

    const isConsistent = counts.every((c) => c === firstCount);
    let score = firstCount * 10;
    if (isConsistent && counts.length > 1) {
      score += 1000;
    }

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

/**
 * Async generator that streams rows from a CSV file.
 * Accurately parses BOM, quotes, escaped quotes (""), and multiline fields.
 *
 * @param {string} filePath - File path to stream
 * @param {string} delimiter - Delimiter character
 * @param {string} encoding - Text encoding
 * @yields {{ row: string[], lineNumber: number }}
 */
async function* streamCsvRows(filePath, delimiter = ',', encoding = 'utf8') {
  const stream = fs.createReadStream(filePath, {
    encoding,
    highWaterMark: 64 * 1024,
  });

  let isFirstChunk = true;
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let lineNumber = 1;

  for await (const chunk of stream) {
    let str = chunk;

    // Handle UTF-8 BOM
    if (isFirstChunk) {
      if (str.charCodeAt(0) === 0xfeff) {
        str = str.slice(1);
      }
      isFirstChunk = false;
    }

    const len = str.length;
    for (let i = 0; i < len; i++) {
      const ch = str[i];

      if (inQuotes) {
        if (ch === '"') {
          // Check for escaped quote ""
          if (i + 1 < len && str[i + 1] === '"') {
            currentField += '"';
            i++; // skip second quote
          } else {
            inQuotes = false;
          }
        } else {
          currentField += ch;
          if (ch === '\n') {
            lineNumber++;
          }
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          currentRow.push(currentField);
          currentField = '';
        } else if (ch === '\r') {
          // Handle CRLF: peek next character
          if (i + 1 < len && str[i + 1] === '\n') {
            i++;
          }
          currentRow.push(currentField);
          currentField = '';

          // Only yield non-empty row
          if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim().length > 0)) {
            yield { row: currentRow, lineNumber };
          }
          currentRow = [];
          lineNumber++;
        } else if (ch === '\n') {
          currentRow.push(currentField);
          currentField = '';

          if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim().length > 0)) {
            yield { row: currentRow, lineNumber };
          }
          currentRow = [];
          lineNumber++;
        } else {
          currentField += ch;
        }
      }
    }
  }

  // Flush remaining buffer
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim().length > 0)) {
      yield { row: currentRow, lineNumber };
    }
  }
}

// ============================================================================
// HEADER SANITIZATION & TYPE INFERENCE
// ============================================================================

/**
 * Sanitizes header names for SQLite compatibility:
 * - Lowercases characters
 * - Replaces non-alphanumeric chars with underscores
 * - Trims leading/trailing underscores
 * - Deduplicates column names
 *
 * @param {string[]} headers - Raw column headers from CSV
 * @returns {string[]} Sanitized column names
 */
function sanitizeHeaders(headers) {
  const seen = new Map();

  return headers.map((rawHeader, index) => {
    let sanitized = String(rawHeader || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!sanitized) {
      sanitized = `col_${index + 1}`;
    }

    if (seen.has(sanitized)) {
      const count = seen.get(sanitized) + 1;
      seen.set(sanitized, count);
      sanitized = `${sanitized}_${count}`;
    } else {
      seen.set(sanitized, 1);
    }

    return sanitized;
  });
}

/**
 * Checks if a string value represents an ISO/standard Date
 */
function isDateString(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();

  // YYYY-MM-DD or YYYY/MM/DD with optional time
  const dateRegex =
    /^\d{4}[-/]\d{2}[-/]\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
  if (!dateRegex.test(trimmed)) return false;

  const timestamp = Date.parse(trimmed);
  return !Number.isNaN(timestamp);
}

/**
 * Infers SQLite data type for a single cell value
 */
function testValueType(val) {
  if (val === null || val === undefined) return 'EMPTY';
  const s = String(val).trim();
  if (s === '') return 'EMPTY';

  // Integer test
  if (/^-?\d+$/.test(s)) {
    const num = Number(s);
    if (Number.isSafeInteger(num)) {
      return 'INTEGER';
    }
    return 'REAL';
  }

  // Real/Float test
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) {
    const num = Number(s);
    if (!Number.isNaN(num)) {
      return 'REAL';
    }
  }

  // Date test
  if (isDateString(s)) {
    return 'DATE';
  }

  return 'TEXT';
}

/**
 * Analyzes sampled rows and determines the best SQLite column type for each column
 *
 * @param {string[][]} sampleRows - Array of sampled row values
 * @param {number} columnCount - Total column count
 * @returns {string[]} Array of SQLite data types ('INTEGER' | 'REAL' | 'DATE' | 'TEXT')
 */
function inferColumnTypes(sampleRows, columnCount) {
  const columnTypes = [];

  for (let colIdx = 0; colIdx < columnCount; colIdx++) {
    const typesFound = new Set();

    for (const row of sampleRows) {
      if (colIdx < row.length) {
        const type = testValueType(row[colIdx]);
        if (type !== 'EMPTY') {
          typesFound.add(type);
        }
      }
    }

    if (typesFound.size === 0) {
      columnTypes.push('TEXT');
    } else if (typesFound.size === 1 && typesFound.has('INTEGER')) {
      columnTypes.push('INTEGER');
    } else if (
      typesFound.size <= 2 &&
      (typesFound.has('INTEGER') || typesFound.has('REAL')) &&
      !typesFound.has('DATE') &&
      !typesFound.has('TEXT')
    ) {
      columnTypes.push('REAL');
    } else if (typesFound.size === 1 && typesFound.has('DATE')) {
      columnTypes.push('DATE');
    } else {
      columnTypes.push('TEXT');
    }
  }

  return columnTypes;
}

/**
 * Converts raw string cell into typed value for database binding
 */
function castValue(rawValue, type) {
  if (rawValue === null || rawValue === undefined) return null;
  const s = String(rawValue).trim();
  if (s === '') return null;

  if (type === 'INTEGER') {
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : s;
  }
  if (type === 'REAL') {
    const f = parseFloat(s);
    return Number.isNaN(f) ? s : f;
  }

  return rawValue;
}

// ============================================================================
// DATABASE DRIVER ABSTRACTION (better-sqlite3 with node:sqlite fallback)
// ============================================================================

function createDatabaseConnection(outputPath) {
  // 1. Try better-sqlite3
  try {
    const Database = require('better-sqlite3');
    const db = new Database(outputPath);

    // Optimize SQLite for high-speed bulk ingestion
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    return {
      driver: 'better-sqlite3',
      db,
      exec: (sql) => db.exec(sql),
      prepare: (sql) => db.prepare(sql),
      transaction: (fn) => db.transaction(fn),
      close: () => db.close(),
    };
  } catch (betterErr) {
    // 2. Fall back to Node.js builtin node:sqlite (DatabaseSync)
    try {
      const { DatabaseSync } = require('node:sqlite');
      const db = new DatabaseSync(outputPath);

      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA synchronous = NORMAL;');

      return {
        driver: 'node:sqlite',
        db,
        exec: (sql) => db.exec(sql),
        prepare: (sql) => {
          const stmt = db.prepare(sql);
          return {
            run: (...params) => stmt.run(...params),
          };
        },
        transaction: (fn) => {
          return (rows) => {
            db.exec('BEGIN TRANSACTION');
            try {
              fn(rows);
              db.exec('COMMIT');
            } catch (err) {
              db.exec('ROLLBACK');
              throw err;
            }
          };
        },
        close: () => db.close(),
      };
    } catch (nodeSqliteErr) {
      throw new Error(
        `Failed to initialize SQLite engine. Please install 'better-sqlite3' via:\n  npm install better-sqlite3\nDetails: ${betterErr.message}`
      );
    }
  }
}

// ============================================================================
// MAIN CONVERTER PIPELINE
// ============================================================================

async function run() {
  const args = parseCliArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.version) {
    const pkg = require('./package.json');
    console.log(`${pkg.name} v${pkg.version}`);
    process.exit(0);
  }

  if (!args.input) {
    console.error(
      `${colors.red}${colors.bold}Error:${colors.reset} Missing required argument --input <file.csv>`
    );
    console.error(`Run ${colors.cyan}node converter.js --help${colors.reset} for usage instructions.`);
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), args.input);

  if (!fs.existsSync(inputPath)) {
    console.error(
      `${colors.red}${colors.bold}Error:${colors.reset} Input file not found: ${colors.yellow}${inputPath}${colors.reset}`
    );
    process.exit(1);
  }

  const fileStats = fs.statSync(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));

  const outputPath = args.output
    ? path.resolve(process.cwd(), args.output)
    : path.resolve(process.cwd(), `${baseName}.db`);

  const tableName =
    args.table ||
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

  console.log(`\n${colors.bold}${colors.cyan}▶ CSV to SQLite Converter${colors.reset}`);
  console.log(`${colors.gray}File: ${inputPath} (${formatBytes(fileStats.size)})${colors.reset}\n`);

  // 1. Detect or apply delimiter
  let delimiter = args.delimiter;
  let delimiterDetected = false;
  if (!delimiter) {
    delimiter = detectDelimiter(inputPath, args.encoding);
    delimiterDetected = true;
  }

  const displayDelimiter =
    delimiter === '\t' ? '\\t (tab)' : delimiter === ' ' ? '\\s (space)' : delimiter;

  console.log(
    ` ${colors.blue}ℹ${colors.reset} Delimiter:   ${colors.bold}${displayDelimiter}${colors.reset}${
      delimiterDetected ? ` ${colors.gray}[auto-detected]${colors.reset}` : ''
    }`
  );
  console.log(` ${colors.blue}ℹ${colors.reset} Encoding:    ${colors.bold}${args.encoding}${colors.reset}`);
  console.log(` ${colors.blue}ℹ${colors.reset} Target Table: ${colors.bold}${tableName}${colors.reset}`);
  if (!args.dryRun) {
    console.log(` ${colors.blue}ℹ${colors.reset} Output DB:   ${colors.bold}${outputPath}${colors.reset}`);
  }

  const startTime = performance.now();

  // 2. Sample headers and first 100 rows for schema discovery
  let headers = [];
  const sampleRows = [];
  const MAX_SAMPLE_ROWS = 100;
  let rowIterator = streamCsvRows(inputPath, delimiter, args.encoding);

  const firstEntry = await rowIterator.next();
  if (firstEntry.done || !firstEntry.value) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} CSV file is empty.`);
    process.exit(1);
  }

  headers = sanitizeHeaders(firstEntry.value.row);
  const columnCount = headers.length;

  while (sampleRows.length < MAX_SAMPLE_ROWS) {
    const item = await rowIterator.next();
    if (item.done) break;
    sampleRows.push(item.value.row);
  }

  const inferredTypes = inferColumnTypes(sampleRows, columnCount);

  // 3. Check for index candidates
  const indexCandidates = [];
  if (args.createIndex) {
    for (let i = 0; i < columnCount; i++) {
      const col = headers[i];
      if (
        col === 'id' ||
        col.endsWith('_id') ||
        col.startsWith('id_') ||
        col.includes('id') ||
        col.includes('email') ||
        col.includes('name')
      ) {
        indexCandidates.push(col);
      }
    }
  }

  // 4. Generate SQL Statements
  const columnDefs = headers
    .map((col, idx) => `  "${col}" ${inferredTypes[idx]}`)
    .join(',\n');
  const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n${columnDefs}\n);`;

  const indexSqlList = indexCandidates.map(
    (col) => `CREATE INDEX IF NOT EXISTS "idx_${tableName}_${col}" ON "${tableName}" ("${col}");`
  );

  // DRY-RUN MODE: Print schema and exit
  if (args.dryRun) {
    console.log(`\n${colors.magenta}${colors.bold}=== DRY-RUN MODE: SCHEMA PREVIEW ===${colors.reset}\n`);

    console.log(`${colors.bold}Inferred Columns & Types:${colors.reset}`);
    headers.forEach((col, idx) => {
      console.log(
        `  - ${colors.cyan}${col.padEnd(25)}${colors.reset} ${colors.yellow}${inferredTypes[idx]}${colors.reset}`
      );
    });

    console.log(`\n${colors.bold}Generated SQL:${colors.reset}`);
    console.log(`${colors.gray}${createTableSql}${colors.reset}\n`);

    if (indexSqlList.length > 0) {
      console.log(`${colors.bold}Index Statements:${colors.reset}`);
      indexSqlList.forEach((idxSql) => console.log(`  ${colors.gray}${idxSql}${colors.reset}`));
      console.log('');
    }

    console.log(
      `${colors.green}✓ Dry run complete.${colors.reset} Sampled ${sampleRows.length} rows. No database files written.\n`
    );
    process.exit(0);
  }

  // 5. Connect to SQLite Database
  const dbWrapper = createDatabaseConnection(outputPath);
  console.log(` ${colors.gray}Using engine: ${dbWrapper.driver}${colors.reset}`);

  // Create Table and Indexes
  dbWrapper.exec(createTableSql);
  for (const idxSql of indexSqlList) {
    dbWrapper.exec(idxSql);
  }

  // 6. Prepare Batch Insert Statement
  const placeholders = headers.map(() => '?').join(', ');
  const quotedCols = headers.map((h) => `"${h}"`).join(', ');
  const insertSql = `INSERT INTO "${tableName}" (${quotedCols}) VALUES (${placeholders});`;
  const insertStmt = dbWrapper.prepare(insertSql);

  const insertBatch = dbWrapper.transaction((rows) => {
    for (const r of rows) {
      insertStmt.run(...r);
    }
  });

  // 7. Stream all rows and perform batched transactions
  let totalImported = 0;
  let skippedRows = 0;
  let batch = [];
  const errors = [];

  // Reset stream to beginning to import all rows
  rowIterator = streamCsvRows(inputPath, delimiter, args.encoding);

  // Skip header row
  await rowIterator.next();

  let lastProgressUpdate = performance.now();

  for await (const { row, lineNumber } of rowIterator) {
    // Row validation: handle column mismatches
    if (row.length !== columnCount) {
      if (row.length < columnCount) {
        // Pad missing columns with null
        while (row.length < columnCount) {
          row.push(null);
        }
        if (errors.length < 10) {
          errors.push(`Line ${lineNumber}: Row has fewer columns than header (${row.length}/${columnCount}) - padded with null.`);
        }
      } else {
        // Truncate extra columns
        row.length = columnCount;
        if (errors.length < 10) {
          errors.push(`Line ${lineNumber}: Row has extra columns (${row.length}/${columnCount}) - truncated.`);
        }
      }
    }

    // Cast row values according to column types
    const typedRow = new Array(columnCount);
    for (let c = 0; c < columnCount; c++) {
      typedRow[c] = castValue(row[c], inferredTypes[c]);
    }

    batch.push(typedRow);
    totalImported++;

    if (batch.length >= args.batchSize) {
      insertBatch(batch);
      batch = [];

      const now = performance.now();
      if (now - lastProgressUpdate > 150) {
        const rate = Math.round((totalImported / ((now - startTime) / 1000)) || 0);
        process.stdout.write(
          `\r ${colors.cyan}⏳ Processing:${colors.reset} ${colors.bold}${totalImported.toLocaleString()}${colors.reset} rows (${rate.toLocaleString()} rows/s)...`
        );
        lastProgressUpdate = now;
      }
    }
  }

  // Flush final remaining batch
  if (batch.length > 0) {
    insertBatch(batch);
    batch = [];
  }

  // Clear progress line
  process.stdout.write('\r' + ' '.repeat(80) + '\r');

  dbWrapper.close();

  const totalTimeMs = Math.round(performance.now() - startTime);
  const throughput = Math.round((totalImported / (totalTimeMs / 1000)) || 0);

  // 8. Output Summary Report
  console.log(`\n${colors.bold}${colors.green}✔ Conversion Completed Successfully!${colors.reset}\n`);

  console.log(`${colors.gray}┌─────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(
    `${colors.gray}│${colors.reset} ${colors.bold}SUMMARY REPORT${colors.reset}`.padEnd(70) + `${colors.gray}│${colors.reset}`
  );
  console.log(`${colors.gray}├─────────────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(
    `${colors.gray}│${colors.reset} Input File:       ${path.basename(inputPath)} (${formatBytes(fileStats.size)})`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Output DB:        ${path.basename(outputPath)}`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Target Table:     ${tableName}`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Rows Imported:    ${colors.bold}${colors.green}${totalImported.toLocaleString()}${colors.reset}`.padEnd(71) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Columns Detected: ${columnCount}`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Indexes Created:  ${indexCandidates.length}`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(
    `${colors.gray}│${colors.reset} Execution Time:   ${totalTimeMs} ms (${throughput.toLocaleString()} rows/s)`.padEnd(62) + `${colors.gray}│${colors.reset}`
  );
  console.log(`${colors.gray}└─────────────────────────────────────────────────────────────┘${colors.reset}\n`);

  // Column Schema Breakdown
  console.log(`${colors.bold}Detected Schema:${colors.reset}`);
  headers.forEach((col, idx) => {
    const isIndexed = indexCandidates.includes(col);
    const indexTag = isIndexed ? ` ${colors.magenta}[INDEXED]${colors.reset}` : '';
    console.log(
      `  • ${colors.cyan}${col.padEnd(20)}${colors.reset} ${colors.yellow}${inferredTypes[idx].padEnd(10)}${colors.reset}${indexTag}`
    );
  });

  if (errors.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Row Warnings (${errors.length}):${colors.reset}`);
    errors.forEach((err) => console.log(`  ${colors.yellow}⚠${colors.reset} ${err}`));
  }

  console.log('');
}

run().catch((err) => {
  console.error(`\n${colors.red}${colors.bold}Fatal Conversion Error:${colors.reset}`, err);
  process.exit(1);
});
