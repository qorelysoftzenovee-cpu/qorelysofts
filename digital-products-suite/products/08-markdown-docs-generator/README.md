# markdown-docs-generator

> High-performance, zero-dependency TypeScript & JSDoc comment parser that compiles codebase comments into structured Markdown API reference documentation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](package.json)

`markdown-docs-generator` scans your JavaScript, TypeScript, and JSX/TSX source code, parses JSDoc and TSDoc comment blocks, analyzes function signatures, classes, interfaces, and type aliases, and outputs GitHub-flavored Markdown documents complete with anchor navigation, tables, code examples, and deprecation alerts.

---

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Options Reference](#cli-options-reference)
- [Supported Code Declarations](#supported-code-declarations)
- [Supported JSDoc / TSDoc Tags](#supported-jsdoc--tsdoc-tags)
- [Watch Mode (Live Regeneration)](#watch-mode-live-regeneration)
- [Example Input & Output](#example-input--output)
- [Programmatic API](#programmatic-api)
- [License](#license)

---

## Key Features

- **Zero External Dependencies**: Built entirely using native Node.js core modules (`fs`, `path`). No bloated AST tree-sitter packages, npm vulnerability risks, or native build toolchains required.
- **Deep TypeScript Support**: Automatically detects generics (`<T, K>`), parameter types, complex return types (including nested object return signatures like `Promise<{ data: T; error?: string }>`), optional parameters, and defaults.
- **Full Interface & Class Extraction**: Extracts interfaces with property tables, optional flags, and field comments, plus class constructors and public/private methods.
- **Rich JSDoc Parsing**: Supports `@param`, `@returns`, `@example`, `@deprecated`, `@since`, `@throws`, `@template`, and `@see`.
- **Live Watch Mode**: Debounced file watcher (`--watch`) automatically rebuilds API docs in milliseconds as you write code in your editor.
- **GitHub Flavored Markdown Output**: Clean table layouts, anchor slugs in the Table of Contents, syntax-highlighted code blocks, and GitHub-style alert callouts (`> [!WARNING]`).
- **ANSI Terminal Output**: Colorized terminal logs detailing files scanned, symbol counts, and generation benchmark timings.

---

## Installation

### Local Project Installation

```bash
npm install markdown-docs-generator --save-dev
```

Add a script to your `package.json`:

```json
{
  "scripts": {
    "docs": "markdown-docs-generator --input ./src --output docs/API.md",
    "docs:watch": "markdown-docs-generator --input ./src --output docs/API.md --watch"
  }
}
```

### Global CLI Tool

```bash
npm install -g markdown-docs-generator
```

---

## Quick Start

Generate documentation for all TypeScript and JavaScript files in `./src`:

```bash
node generator.js --input ./src --output API_DOCUMENTATION.md
```

Target a single file:

```bash
node generator.js --input ./example/sample-source.ts --output ./API.md --title "Payment Gateway API"
```

---

## CLI Options Reference

| Option | Shorthand | Default | Description |
| :--- | :--- | :--- | :--- |
| `--input <path>` | `-i` | `./src` | Target directory or individual source file path |
| `--output <file>` | `-o` | `API_DOCUMENTATION.md` | Target destination Markdown file path |
| `--title <title>` | `-t` | `"API Reference"` | Header title for the generated documentation |
| `--extensions <exts>` | `-e` | `.ts,.js,.tsx,.jsx` | Comma-separated list of file extensions to include |
| `--ignore <dirs>` | — | `node_modules,dist,...`| Comma-separated directory names to skip |
| `--recursive` | `-r` | `true` | Recursively scan nested subdirectories |
| `--no-recursive` | — | `false` | Scan only top-level directory without descending |
| `--watch` | `-w` | `false` | Watch source directory and re-compile on change |
| `--help` | `-h` | — | Display CLI help reference manual |

---

## Supported Code Declarations

The generator automatically analyzes the following TypeScript and modern JavaScript structures:

1. **Standard & Async Functions**:
   ```typescript
   export async function fetchUsers<T>(query: string): Promise<T[]> { ... }
   ```
2. **Arrow Functions & Variables**:
   ```typescript
   export const validateToken = (token: string): boolean => ...
   ```
3. **Classes & Methods**:
   ```typescript
   export class AuthService {
     constructor(config: AuthConfig) { ... }
     public async login(creds: Credentials): Promise<Session> { ... }
   }
   ```
4. **Interfaces & Properties**:
   ```typescript
   export interface UserProfile {
     /** Database primary key */
     id: string;
     /** Display name */
     name: string;
     /** Optional email address */
     email?: string;
   }
   ```
5. **Type Aliases**:
   ```typescript
   export type Status = 'active' | 'inactive' | 'suspended';
   ```
6. **Enums**:
   ```typescript
   export enum HttpMethod { GET = 'GET', POST = 'POST' }
   ```

---

## Supported JSDoc / TSDoc Tags

| Tag | Format | Description |
| :--- | :--- | :--- |
| `@param` / `@arg` | `@param {Type} [name=default] Description` | Documents parameter type, optionality, default value, and purpose |
| `@returns` / `@return` | `@returns {Type} Description` | Documents return data type and description |
| `@example` | `@example \`\`\`ts code \`\`\`` | Rendered directly as syntax-highlighted code blocks |
| `@deprecated` | `@deprecated Reason for deprecation` | Generates a high-visibility GitHub warning alert |
| `@throws` | `@throws {ErrorType} Cause` | Creates a formatted table of thrown exceptions |
| `@since` | `@since v1.2.0` | Adds an inline version badge |
| `@template` | `@template T Description` | Documents generic type parameters |
| `@see` | `@see URL or symbol` | Appends reference links |

---

## Watch Mode (Live Regeneration)

When developing libraries or documentation, enable `--watch` mode:

```bash
node generator.js --input ./src --output docs/API.md --watch
```

Output:

```text
======================================================
  Markdown Docs Generator v1.0.0
  Input:  ./src
  Output: docs/API.md
======================================================

  ✓ Parsed src/client.ts (4 symbols)
  ✓ Parsed src/utils.ts (8 symbols)

✔ Documentation successfully generated!
  Files scanned:    2
  Symbols parsed:   12
  Target file:      docs/API.md
  Execution time:   8ms

👀 Watch mode active. Monitoring ./src for changes...
Press Ctrl+C to stop.

[22:30:12] File change detected (client.ts). Regenerating docs...
✔ Updated docs/API.md in 6ms (12 symbols)
```

Debouncing ensures that rapid keystrokes or IDE auto-save routines do not cause thrashing.

---

## Example Input & Output

### Input Source (`sample.ts`):

```typescript
/**
 * Formats a monetary number into a localized currency string.
 *
 * @param {number} amount - The numeric monetary value to format.
 * @param {string} [currency='USD'] - Three-letter ISO currency code.
 * @returns {string} Localized currency string.
 * @since v1.0.0
 * @example
 * ```typescript
 * formatCurrency(1250.50, 'USD'); // "$1,250.50"
 * ```
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `$${amount.toFixed(2)}`;
}
```

### Generated Output (`API.md`):

````markdown
### formatCurrency

`function` `export` `since v1.0.0`

Formats a monetary number into a localized currency string.

```typescript
export function formatCurrency(amount: number, currency: string = 'USD'): string
```

#### Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `amount` | `number` | — | The numeric monetary value to format. |
| `currency` *(optional)* | `string` | `'USD'` | Three-letter ISO currency code. |

#### Returns

- `string` — Localized currency string.

#### Example

```typescript
formatCurrency(1250.50, 'USD'); // "$1,250.50"
```
````

---

## Programmatic API

You can also import and use the generator programmatically inside custom Node.js build scripts:

```javascript
const { runGenerator, parseSourceFile, generateMarkdown } = require('markdown-docs-generator');

// 1. Run generation cycle directly
const result = runGenerator({
  input: './src',
  output: './docs/API.md',
  title: 'My Custom Library API',
  extensions: ['.ts', '.js'],
  recursive: true,
  ignore: ['node_modules', 'dist'],
});

console.log(`Generated docs for ${result.symbolsExtracted} symbols in ${result.durationMs}ms`);

// 2. Or parse a single file's AST manually:
const parsedDoc = parseSourceFile('/path/to/my-file.ts');
console.log(parsedDoc.symbols);
```

---

## License

MIT License © 2026 **QorelySofts**. All rights reserved.
See [LICENSE](LICENSE) for details.
