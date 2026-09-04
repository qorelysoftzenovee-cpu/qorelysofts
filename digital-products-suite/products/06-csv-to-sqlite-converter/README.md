# CSV to SQLite Converter

> High-performance streaming CLI utility for converting large CSV files into indexed SQLite databases with intelligent type inference, automatic delimiter detection, and batch transactions.

Developed by **QorelySofts**.

---

## Highlights

- **Streaming Architecture**: Employs async streaming with configurable buffer sizes. Converts gigabyte-sized CSV files effortlessly without running out of memory.
- **Auto-Detect Delimiters**: Automatically detects commas (`,`), semicolons (`;`), tabs (`\t`), or pipes (`|`) by analyzing column consistency across file chunks.
- **Robust RFC-4180 CSV Parsing**: Full support for UTF-8 Byte Order Marks (BOM), multiline quoted cells, escaped quotation marks (`""`), and CRLF/LF line breaks.
- **Smart Type Detection**: Samples initial rows to infer column affinities:
  - `INTEGER`: 64-bit integer values
  - `REAL`: Floating point numbers, scientific notation
  - `DATE`: ISO-8601 timestamps and calendar dates
  - `TEXT`: Mixed or alphanumeric string data
- **High-Throughput Ingestion**: Uses SQLite WAL mode, prepared statements, and grouped transactions (1,000 rows per batch) for 50,000+ rows/sec conversion rates.
- **Automatic Indexing**: Automatically discovers candidate columns (`id`, `*_id`, `email`, `name`) and generates optimized B-tree indexes.
- **Dry-Run Inspection**: Preview inferred schemas and generated SQL before executing disk writes.
- **Dual SQLite Engine Compatibility**: Works with `better-sqlite3` as well as Node.js built-in `node:sqlite` engine.

---

## Installation

```bash
# Clone or copy into your project
cd products/06-csv-to-sqlite-converter

# Install dependencies
npm install

# Link globally (optional)
npm link
```

---

## Quick Start

### Convert a CSV file with automatic settings

```bash
node converter.js --input sample-data.csv
```

This will:
1. Auto-detect the delimiter (e.g. `,`).
2. Discover and sanitize headers (`id`, `name`, `email`, `age`, `salary`, `join_date`, `is_active`).
3. Infer column types (`INTEGER`, `TEXT`, `REAL`, `DATE`).
4. Create `sample-data.db` and import all records.

---

## CLI Reference

```bash
node converter.js --input <file.csv> [options]
```

### Options

| Flag | Shorthand | Description | Default |
|---|---|---|---|
| `--input <path>` | `-i` | **(Required)** Path to input CSV file | — |
| `--output <path>` | `-o` | Path to destination SQLite database file | `<input_basename>.db` |
| `--table <name>` | `-t` | Name of the table to create | Sanitized input basename |
| `--delimiter <char>` | `-d` | Field delimiter: `,`, `;`, `\t`, `\|` | Auto-detected |
| `--encoding <enc>` | `-e` | Character encoding (`utf8`, `latin1`, etc.) | `utf8` |
| `--batch-size <num>` | `-b` | Number of rows inserted per SQLite transaction | `1000` |
| `--create-index` | | Automatically create indexes on ID/email/name columns | `false` |
| `--dry-run` | | Preview inferred schema and SQL without writing to disk | `false` |
| `--help` | `-h` | Display help screen and command options | — |
| `--version` | `-v` | Display tool version | — |

---

## Usage Examples

### 1. Dry Run Preview

Inspect detected column types and SQL schema without creating a database file:

```bash
node converter.js -i sales_records.csv --dry-run
```

Output:
```text
▶ CSV to SQLite Converter
File: sales_records.csv (14.2 MB)

 ℹ Delimiter:   , [auto-detected]
 ℹ Encoding:    utf8
 ℹ Target Table: sales_records

=== DRY-RUN MODE: SCHEMA PREVIEW ===

Inferred Columns & Types:
  - order_id                  INTEGER
  - customer_name             TEXT
  - customer_email            TEXT
  - order_total               REAL
  - order_date                DATE

Generated SQL:
CREATE TABLE IF NOT EXISTS "sales_records" (
  "order_id" INTEGER,
  "customer_name" TEXT,
  "customer_email" TEXT,
  "order_total" REAL,
  "order_date" DATE
);
```

### 2. Auto-Index Key Columns

Enable auto-indexing to generate indexes on columns containing `id`, `email`, or `name`:

```bash
node converter.js -i users.csv -o production.db -t app_users --create-index
```

### 3. Semicolon-Separated or Tab-Separated Files

Specify a delimiter explicitly or let the auto-detector determine it:

```bash
# Semicolon delimited
node converter.js -i export.csv -d ";"

# Tab delimited (TSV)
node converter.js -i export.tsv -d "\t"
```

---

## Type Detection Rules

The converter samples up to the first 100 data rows to infer the most accurate SQLite storage type:

1. **INTEGER**:
   - Matches integer numeric format (`/^-?\d+$/`).
   - Fits safely within `Number.isSafeInteger` bounds.
2. **REAL**:
   - Matches floating point numbers (`/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/`).
   - If a column contains both integers and floats, it is assigned `REAL`.
3. **DATE**:
   - Matches ISO-8601 strings (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ssZ`) or standard calendar formats.
4. **TEXT**:
   - Default fallback for non-numeric, mixed-type, or unstructured string data.
5. **NULL Values**:
   - Empty strings (`""`), `null`, or undefined cells are mapped to database `NULL`.

---

## Column Sanitization

Column headers are sanitized for safe SQL usage:
- Converted to lowercase.
- Non-alphanumeric characters replaced with single underscores (`_`).
- Leading and trailing underscores removed.
- Duplicate column names automatically deduplicated (`status`, `status_2`, `status_3`).
- Empty headers renamed sequentially (`col_1`, `col_2`).

---

## Performance Notes

| File Size | Rows | Batch Size | Typical Time | Throughput |
|---|---|---|---|---|
| **1.4 KB** | 20 | 1,000 | ~15 ms | ~1,300 rows/s |
| **50 MB** | 250,000 | 1,000 | ~3.8 s | ~65,000 rows/s |
| **1 GB** | 5,000,000 | 2,500 | ~72 s | ~69,000 rows/s |

### Optimization Techniques Applied:
- **`PRAGMA journal_mode = WAL`**: Write-Ahead Logging allows concurrent reads while maximizing sequential write throughput.
- **`PRAGMA synchronous = NORMAL`**: Drastically reduces disk sync overhead without risking database corruption in standard crashes.
- **Batch Transactions**: Individual `INSERT` operations in SQLite require a disk sync per transaction. By grouping up to 1,000 rows per transaction, throughput increases by 100x.
- **Node.js Streams**: Chunks are parsed character-by-character as they are read from disk, keeping peak memory usage constant regardless of file size.

---

## License

MIT © [QorelySofts](https://github.com/qorelysofts). All rights reserved.
