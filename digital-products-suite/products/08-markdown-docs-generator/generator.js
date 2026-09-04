#!/usr/bin/env node

/**
 * @file generator.js
 * @description Zero-dependency TypeScript and JSDoc comment parser and Markdown documentation generator.
 * @author QorelySofts
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// ANSI Styling Helpers
// ============================================================================
const isColorSupported = !process.env.NO_COLOR && (process.stdout.isTTY || process.env.FORCE_COLOR);

const style = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  blue: isColorSupported ? '\x1b[34m' : '',
};

// ============================================================================
// CLI Argument Parsing
// ============================================================================
/**
 * @typedef {Object} GeneratorOptions
 * @property {string} input - Source file or directory path.
 * @property {string} output - Output markdown file path.
 * @property {boolean} recursive - Whether to recursively traverse directories.
 * @property {string[]} extensions - Array of file extensions to process.
 * @property {string[]} ignore - Directory/file names to ignore.
 * @property {string} title - Header title of the generated markdown document.
 * @property {boolean} watch - Watch mode flag.
 * @property {boolean} help - Help display flag.
 */

/**
 * Parses command-line arguments into structured generator configuration.
 *
 * @param {string[]} args - Process arguments array.
 * @returns {GeneratorOptions}
 */
function parseCommandLineArgs(args) {
  const options = {
    input: './src',
    output: 'API_DOCUMENTATION.md',
    recursive: true,
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    ignore: ['node_modules', 'dist', '.git', 'coverage', 'build', '.next'],
    title: 'API Reference',
    watch: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--watch' || arg === '-w') {
      options.watch = true;
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    } else if (arg === '--recursive' || arg === '-r') {
      options.recursive = true;
    } else if (arg === '--input' || arg === '-i') {
      options.input = args[++i] || options.input;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i] || options.output;
    } else if (arg === '--title' || arg === '-t') {
      options.title = args[++i] || options.title;
    } else if (arg === '--extensions' || arg === '-e') {
      const extVal = args[++i] || '';
      options.extensions = extVal.split(',').map((e) => (e.startsWith('.') ? e.trim() : `.${e.trim()}`));
    } else if (arg === '--ignore') {
      const ignVal = args[++i] || '';
      options.ignore = ignVal.split(',').map((x) => x.trim()).filter(Boolean);
    }
  }

  return options;
}

/**
 * Prints CLI usage guide to the terminal.
 */
function printHelp() {
  console.log(`
${style.bold}${style.cyan}markdown-docs-generator${style.reset} ${style.dim}v1.0.0 by QorelySofts${style.reset}
Fast, zero-dependency TypeScript & JSDoc documentation generator.

${style.bold}USAGE:${style.reset}
  node generator.js [OPTIONS]

${style.bold}OPTIONS:${style.reset}
  -i, --input <path>         Input source directory or single file (default: ./src)
  -o, --output <file>        Output markdown file path (default: API_DOCUMENTATION.md)
  -t, --title <title>        Documentation main header title (default: "API Reference")
  -e, --extensions <exts>    Comma-separated extensions to scan (default: .ts,.js,.tsx,.jsx)
      --ignore <patterns>    Comma-separated directories to skip (default: node_modules,dist,...)
  -r, --recursive            Recursively search directories (default: true)
      --no-recursive         Disable recursive directory scanning
  -w, --watch                Watch input directory for live regeneration
  -h, --help                 Display this help reference manual

${style.bold}EXAMPLES:${style.reset}
  node generator.js --input ./src --output API.md
  node generator.js -i ./example/sample-source.ts -o ./docs.md --title "Billing Service API"
  node generator.js --watch
`);
}

// ============================================================================
// File Discovery
// ============================================================================
/**
 * Recursively locates all matching source files according to configuration.
 *
 * @param {string} targetPath - Starting file or folder path.
 * @param {GeneratorOptions} options - Search options.
 * @returns {string[]} Array of absolute file paths.
 */
function discoverSourceFiles(targetPath, options) {
  const resolved = path.resolve(process.cwd(), targetPath);

  if (!fs.existsSync(resolved)) {
    return [];
  }

  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    return [resolved];
  }

  const collectedFiles = [];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      console.warn(`${style.yellow}[WARN] Cannot read directory ${currentDir}: ${err.message}${style.reset}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (options.ignore.includes(entry.name)) {
          continue;
        }
        if (options.recursive) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (options.extensions.includes(ext)) {
          collectedFiles.push(fullPath);
        }
      }
    }
  }

  walk(resolved);
  return collectedFiles;
}

// ============================================================================
// JSDoc / TSDoc Comment Parser
// ============================================================================
/**
 * @typedef {Object} DocParam
 * @property {string} name - Parameter name.
 * @property {string} type - Parameter type.
 * @property {string} description - Explanation of the parameter.
 * @property {boolean} optional - Whether parameter is optional.
 * @property {string} [defaultValue] - Default value if specified.
 */

/**
 * @typedef {Object} DocReturn
 * @property {string} type - Return type.
 * @property {string} description - Return value description.
 */

/**
 * @typedef {Object} DocThrow
 * @property {string} type - Exception type or class.
 * @property {string} description - Cause of exception.
 */

/**
 * @typedef {Object} DocSymbol
 * @property {string} name - Identifier name.
 * @property {'function'|'class'|'interface'|'type'|'enum'|'method'|'property'|'constant'} kind - Symbol category.
 * @property {'export'|'export default'|'module.exports'|'internal'} exportType - Export declaration kind.
 * @property {string} description - Overview description.
 * @property {string} signature - Formatted declaration signature.
 * @property {DocParam[]} params - List of parsed parameters.
 * @property {DocReturn|null} returns - Return specification.
 * @property {DocThrow[]} throws - Throws specifications.
 * @property {string[]} examples - Code examples.
 * @property {string|null} deprecated - Deprecation warning if marked.
 * @property {string|null} since - Version since availability.
 * @property {string[]} templates - Generic template types.
 * @property {string[]} see - See references.
 * @property {DocSymbol[]} members - Child members (e.g. methods in a class or properties in an interface).
 * @property {number} line - Source code line number.
 */

/**
 * Parses raw JSDoc tag block into structured data.
 *
 * @param {string} commentText - Raw comment block without delimiters.
 * @returns {Partial<DocSymbol>}
 */
function parseJSDocBlock(commentText) {
  const lines = commentText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd());

  let descriptionLines = [];
  const params = [];
  let returns = null;
  const throws = [];
  const examples = [];
  let deprecated = null;
  let since = null;
  const templates = [];
  const see = [];

  let currentTag = null;
  let currentBuffer = [];

  function flushBuffer() {
    if (!currentTag) {
      if (currentBuffer.length > 0) {
        descriptionLines.push(currentBuffer.join('\n').trim());
      }
      currentBuffer = [];
      return;
    }

    const fullContent = currentBuffer.join('\n').trim();

    if (currentTag === 'param' || currentTag === 'arg' || currentTag === 'argument') {
      // Parse optional type enclosed in balanced { ... }
      let rawType = 'any';
      let remainder = fullContent.trim();

      if (remainder.startsWith('{')) {
        let depth = 0;
        let closeIdx = -1;
        for (let idx = 0; idx < remainder.length; idx++) {
          if (remainder[idx] === '{') depth++;
          else if (remainder[idx] === '}') {
            depth--;
            if (depth === 0) {
              closeIdx = idx;
              break;
            }
          }
        }
        if (closeIdx !== -1) {
          rawType = remainder.substring(1, closeIdx).trim();
          remainder = remainder.substring(closeIdx + 1).trim();
        }
      }

      // Syntax: [name=default] description OR name description
      const nameMatch = remainder.match(/^(\[[^\]]+\]|[^\s]+)(?:\s*-\s*|\s+)?([\s\S]*)$/);
      if (nameMatch) {
        let rawName = nameMatch[1] || '';
        let desc = (nameMatch[2] || '').trim();
        let isOptional = false;
        let defaultValue = undefined;

        if (rawName.startsWith('[') && rawName.endsWith(']')) {
          isOptional = true;
          const inner = rawName.slice(1, -1);
          if (inner.includes('=')) {
            const parts = inner.split('=');
            rawName = parts[0].trim();
            defaultValue = parts.slice(1).join('=').trim();
          } else {
            rawName = inner.trim();
          }
        }

        params.push({
          name: rawName,
          type: rawType,
          description: desc,
          optional: isOptional,
          defaultValue,
        });
      }
    } else if (currentTag === 'returns' || currentTag === 'return') {
      let rawType = 'void';
      let remainder = fullContent.trim();

      if (remainder.startsWith('{')) {
        let depth = 0;
        let closeIdx = -1;
        for (let idx = 0; idx < remainder.length; idx++) {
          if (remainder[idx] === '{') depth++;
          else if (remainder[idx] === '}') {
            depth--;
            if (depth === 0) {
              closeIdx = idx;
              break;
            }
          }
        }
        if (closeIdx !== -1) {
          rawType = remainder.substring(1, closeIdx).trim();
          remainder = remainder.substring(closeIdx + 1).trim();
        }
      }

      const desc = remainder.replace(/^-\s*/, '').trim();
      returns = {
        type: rawType,
        description: desc,
      };
    } else if (currentTag === 'throws' || currentTag === 'exception') {
      let rawType = 'Error';
      let remainder = fullContent.trim();

      if (remainder.startsWith('{')) {
        let depth = 0;
        let closeIdx = -1;
        for (let idx = 0; idx < remainder.length; idx++) {
          if (remainder[idx] === '{') depth++;
          else if (remainder[idx] === '}') {
            depth--;
            if (depth === 0) {
              closeIdx = idx;
              break;
            }
          }
        }
        if (closeIdx !== -1) {
          rawType = remainder.substring(1, closeIdx).trim();
          remainder = remainder.substring(closeIdx + 1).trim();
        }
      }

      const desc = remainder.replace(/^-\s*/, '').trim();
      throws.push({
        type: rawType,
        description: desc,
      });
    } else if (currentTag === 'example') {
      if (fullContent) {
        examples.push(fullContent);
      }
    } else if (currentTag === 'deprecated') {
      deprecated = fullContent || 'This symbol is deprecated and may be removed in future releases.';
    } else if (currentTag === 'since') {
      since = fullContent;
    } else if (currentTag === 'template' || currentTag === 'typeParam') {
      templates.push(fullContent);
    } else if (currentTag === 'see') {
      see.push(fullContent);
    }

    currentTag = null;
    currentBuffer = [];
  }

  for (const line of lines) {
    const tagMatch = line.match(/^@([a-zA-Z0-9_-]+)(?:\s+([\s\S]*))?$/);
    if (tagMatch) {
      flushBuffer();
      currentTag = tagMatch[1];
      const remainder = tagMatch[2] !== undefined ? tagMatch[2] : '';
      currentBuffer = remainder ? [remainder] : [];
    } else {
      currentBuffer.push(line);
    }
  }

  flushBuffer();

  return {
    description: descriptionLines.join('\n\n').trim(),
    params,
    returns,
    throws,
    examples,
    deprecated,
    since,
    templates,
    see,
  };
}

// ============================================================================
// Source Code Declaration Analyzer
// ============================================================================
/**
 * Inspects source code following a JSDoc block to extract declaration details.
 *
 * @param {string} source - Entire file content.
 * @param {number} commentEndIndex - Index where comment terminates (after `* /`).
 * @returns {{ name: string, kind: DocSymbol['kind'], exportType: DocSymbol['exportType'], signature: string, returnType?: string } | null}
 */
function analyzeDeclaration(source, commentEndIndex) {
  const afterComment = source.substring(commentEndIndex);

  // Find start of statement (skip whitespace and line comments)
  let startOffset = 0;
  while (startOffset < afterComment.length) {
    const remaining = afterComment.substring(startOffset);
    const leadingMatch = remaining.match(/^(\s+|\/\/[^\r\n]*\r?\n|\/\*[\s\S]*?\*\/)/);
    if (leadingMatch) {
      startOffset += leadingMatch[0].length;
    } else {
      break;
    }
  }

  const codeSegment = afterComment.substring(startOffset);
  if (!codeSegment) return null;

  // Walk characters to locate boundary of signature:
  let parenDepth = 0;
  let angleDepth = 0;
  let typeBraceDepth = 0;
  let endOffset = -1;
  let isArrow = false;

  for (let i = 0; i < codeSegment.length && i < 2000; i++) {
    const char = codeSegment[i];
    const nextChar = codeSegment[i + 1] || '';

    if (char === '(') {
      parenDepth++;
    } else if (char === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
    } else if (char === '<' && parenDepth === 0) {
      angleDepth++;
    } else if (char === '>' && parenDepth === 0 && angleDepth > 0) {
      angleDepth--;
    } else if (char === '{') {
      if (parenDepth > 0 || angleDepth > 0 || typeBraceDepth > 0) {
        typeBraceDepth++;
      } else {
        // This is the opening brace of the class/function/interface body
        endOffset = i;
        break;
      }
    } else if (char === '}') {
      if (typeBraceDepth > 0) {
        typeBraceDepth--;
      }
    } else if (char === '=' && nextChar === '>' && parenDepth === 0 && angleDepth === 0 && typeBraceDepth === 0) {
      isArrow = true;
      endOffset = i;
      break;
    } else if (char === ';' && parenDepth === 0 && angleDepth === 0 && typeBraceDepth === 0) {
      endOffset = i;
      break;
    }
  }

  if (endOffset === -1) {
    const doubleNewline = codeSegment.indexOf('\n\n');
    endOffset = doubleNewline !== -1 ? doubleNewline : Math.min(codeSegment.length, 120);
  }

  let signature = codeSegment.substring(0, endOffset).trim();
  if (isArrow) {
    signature = signature + ' => ...';
  }

  if (!signature) return null;

  // Detect export status
  let exportType = 'internal';
  if (/^export\s+default\b/.test(signature)) {
    exportType = 'export default';
  } else if (/^export\b/.test(signature)) {
    exportType = 'export';
  } else if (/\bmodule\.exports\b/.test(signature) || /\bexports\.[a-zA-Z0-9_$]+\s*=/.test(signature)) {
    exportType = 'module.exports';
  }

  // Clean declaration for regex matching
  const cleanStmt = signature
    .replace(/^export\s+(?:default\s+)?/, '')
    .trim();

  // 1. Interface
  const interfaceMatch = cleanStmt.match(/^interface\s+([a-zA-Z0-9_$]+)(?:<([^>]+)>)?(?:\s+extends\s+([^{]+))?/);
  if (interfaceMatch) {
    const properties = [];
    if (endOffset !== -1 && codeSegment[endOffset] === '{') {
      let bDepth = 1;
      let bodyEnd = -1;
      for (let j = endOffset + 1; j < codeSegment.length; j++) {
        if (codeSegment[j] === '{') bDepth++;
        else if (codeSegment[j] === '}') {
          bDepth--;
          if (bDepth === 0) {
            bodyEnd = j;
            break;
          }
        }
      }
      if (bodyEnd !== -1) {
        const bodyContent = codeSegment.substring(endOffset + 1, bodyEnd);
        const propRegex = /(?:\/\*\*([\s\S]*?)\*\/\s*)?([a-zA-Z0-9_$]+)(\?)?:\s*([^;]+);/g;
        let pMatch;
        while ((pMatch = propRegex.exec(bodyContent)) !== null) {
          const rawDoc = pMatch[1] ? pMatch[1].replace(/^\s*\*\s?/gm, '').trim() : '';
          properties.push({
            name: pMatch[2],
            optional: !!pMatch[3],
            type: pMatch[4].trim(),
            description: rawDoc,
          });
        }
      }
    }

    return {
      name: interfaceMatch[1],
      kind: 'interface',
      exportType,
      signature,
      properties,
    };
  }

  // 2. Type Alias
  const typeMatch = cleanStmt.match(/^type\s+([a-zA-Z0-9_$]+)(?:<([^>]+)>)?\s*=/);
  if (typeMatch) {
    return {
      name: typeMatch[1],
      kind: 'type',
      exportType,
      signature,
    };
  }

  // 3. Class
  const classMatch = cleanStmt.match(/^class\s+([a-zA-Z0-9_$]+)(?:<([^>]+)>)?(?:\s+extends\s+([^{]+))?(?:\s+implements\s+([^{]+))?/);
  if (classMatch) {
    return {
      name: classMatch[1],
      kind: 'class',
      exportType,
      signature,
    };
  }

  // 4. Enum
  const enumMatch = cleanStmt.match(/^enum\s+([a-zA-Z0-9_$]+)/);
  if (enumMatch) {
    return {
      name: enumMatch[1],
      kind: 'enum',
      exportType,
      signature,
    };
  }

  // 5. Function Declaration (async function foo<T>(...) : RetType)
  const fnMatch = cleanStmt.match(/^(?:async\s+)?function(?:\s*\*)?\s+([a-zA-Z0-9_$]+)(?:<([^>]+)>)?\s*\(/);
  if (fnMatch) {
    const retTypeMatch = signature.match(/\):\s*([^;{]+)$/);
    return {
      name: fnMatch[1],
      kind: 'function',
      exportType,
      signature,
      returnType: retTypeMatch ? retTypeMatch[1].trim() : undefined,
    };
  }

  // 6. Const/Let Arrow Function: const foo = async (...) : RetType =>
  const arrowMatch = cleanStmt.match(/^(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:<([^>]+)>)?\s*\(/);
  if (arrowMatch) {
    const retTypeMatch = signature.match(/\):\s*([^=>{]+)\s*=>/);
    return {
      name: arrowMatch[1],
      kind: 'function',
      exportType,
      signature,
      returnType: retTypeMatch ? retTypeMatch[1].trim() : undefined,
    };
  }

  // 7. Class Method / Constructor
  const methodMatch = cleanStmt.match(/^(?:public|private|protected|static|async|\s)*([a-zA-Z0-9_$]+)\s*\(/);
  if (methodMatch) {
    const name = methodMatch[1];
    const retTypeMatch = signature.match(/\):\s*([^;{]+)$/);
    return {
      name,
      kind: name === 'constructor' ? 'method' : 'method',
      exportType: 'internal',
      signature,
      returnType: retTypeMatch ? retTypeMatch[1].trim() : undefined,
    };
  }

  // 8. General Variable or Constant
  const varMatch = cleanStmt.match(/^(?:const|let|var)\s+([a-zA-Z0-9_$]+)/);
  if (varMatch) {
    return {
      name: varMatch[1],
      kind: 'constant',
      exportType,
      signature,
    };
  }

  return null;
}

/**
 * Parses an entire source file for JSDoc-annotated symbols.
 *
 * @param {string} filePath - Absolute path to source file.
 * @returns {{ filePath: string, fileOverview?: string, symbols: DocSymbol[] }}
 */
function parseSourceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const commentRegex = /\/\*\*([\s\S]*?)\*\//g;
  const symbols = [];
  let fileOverview = null;

  let match;
  while ((match = commentRegex.exec(content)) !== null) {
    const rawComment = match[1];
    const commentEndPos = match.index + match[0].length;

    // Check if this is a top-level @file or @module overview comment
    if (/@file\b|@module\b/.test(rawComment) && match.index < 500) {
      const parsed = parseJSDocBlock(rawComment);
      fileOverview = parsed.description;
      continue;
    }

    const decl = analyzeDeclaration(content, commentEndPos);
    if (!decl) {
      continue;
    }

    const parsedDoc = parseJSDocBlock(rawComment);

    // Reconcile return type if JSDoc didn't specify one
    let finalReturns = parsedDoc.returns;
    if (!finalReturns && decl.returnType) {
      finalReturns = {
        type: decl.returnType,
        description: '',
      };
    }

    // Determine line number
    const line = content.substring(0, match.index).split('\n').length;

    symbols.push({
      name: decl.name,
      kind: decl.kind,
      exportType: decl.exportType,
      signature: decl.signature,
      description: parsedDoc.description || '',
      params: parsedDoc.params || [],
      returns: finalReturns,
      throws: parsedDoc.throws || [],
      examples: parsedDoc.examples || [],
      deprecated: parsedDoc.deprecated || null,
      since: parsedDoc.since || null,
      templates: parsedDoc.templates || [],
      see: parsedDoc.see || [],
      properties: decl.properties || [],
      members: [],
      line,
    });
  }

  // Nest class methods inside classes if declared together
  const consolidated = [];
  let currentClass = null;

  for (const sym of symbols) {
    if (sym.kind === 'class') {
      currentClass = sym;
      consolidated.push(sym);
    } else if (sym.kind === 'method' && currentClass) {
      currentClass.members.push(sym);
    } else {
      if (sym.kind !== 'method') {
        currentClass = null;
      }
      consolidated.push(sym);
    }
  }

  return {
    filePath,
    fileOverview,
    symbols: consolidated,
  };
}

// ============================================================================
// Markdown Document Formatter
// ============================================================================
/**
 * Creates a GitHub markdown anchor slug from string.
 *
 * @param {string} text - Heading text.
 * @returns {string} URL slug.
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Formats parsed documentation symbols into a clean, comprehensive Markdown document.
 *
 * @param {Array<{ filePath: string, fileOverview?: string, symbols: DocSymbol[] }>} fileDocs - Parsed file docs.
 * @param {GeneratorOptions} options - Documentation options.
 * @returns {string} Fully rendered Markdown string.
 */
function generateMarkdown(fileDocs, options) {
  const totalSymbols = fileDocs.reduce((acc, f) => acc + f.symbols.length, 0);
  const totalFiles = fileDocs.length;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  let md = '';

  // 1. Header & Metadata
  md += `# ${options.title}\n\n`;
  md += `> Automatically generated by [markdown-docs-generator](https://github.com/qorelysofts/markdown-docs-generator) on **${timestamp}**.\n\n`;
  md += `| Files Documented | Total Symbols | Generator Engine |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **${totalFiles}** | **${totalSymbols}** | Zero-Dependency AST/Regex Parser |\n\n`;
  md += `---\n\n`;

  // 2. Table of Contents
  md += `## Table of Contents\n\n`;

  for (const doc of fileDocs) {
    const relPath = path.relative(process.cwd(), doc.filePath).replace(/\\/g, '/');
    const fileSlug = createSlug(relPath);
    md += `- [📁 \`${relPath}\`](#${fileSlug})\n`;

    for (const sym of doc.symbols) {
      const symSlug = createSlug(`${sym.name}`);
      const kindBadge = sym.kind.toUpperCase();
      md += `  - [**${sym.name}** (${kindBadge})](#${symSlug})\n`;
      if (sym.members && sym.members.length > 0) {
        for (const m of sym.members) {
          const mSlug = createSlug(`${sym.name}-${m.name}`);
          md += `    - [${m.name}()](#${mSlug})\n`;
        }
      }
    }
  }

  md += `\n---\n\n`;

  // 3. File Sections & API Details
  for (const doc of fileDocs) {
    const relPath = path.relative(process.cwd(), doc.filePath).replace(/\\/g, '/');
    const fileSlug = createSlug(relPath);

    md += `## 📁 \`${relPath}\`\n\n`;

    if (doc.fileOverview) {
      md += `${doc.fileOverview}\n\n`;
    }

    if (doc.symbols.length === 0) {
      md += `*No documented public API symbols found in this file.*\n\n`;
      continue;
    }

    for (const sym of doc.symbols) {
      md += renderSymbolMarkdown(sym, relPath);
    }

    md += `---\n\n`;
  }

  // 4. License & Credits
  md += `## License & Credits\n\n`;
  md += `Documentation generated by **markdown-docs-generator**.\n`;
  md += `Copyright © 2026 **QorelySofts**. All rights reserved.\n`;

  return md;
}

/**
 * Renders an individual symbol (function, class, interface, etc.) to Markdown.
 *
 * @param {DocSymbol} sym - Symbol data.
 * @param {string} relPath - Relative file path for context.
 * @returns {string} Rendered symbol markdown block.
 */
function renderSymbolMarkdown(sym, relPath) {
  let md = '';

  // Heading with Kind Badge
  md += `### ${sym.name}\n\n`;

  // Metadata tags
  const tags = [];
  tags.push(`\`${sym.kind}\``);
  if (sym.exportType && sym.exportType !== 'internal') {
    tags.push(`\`${sym.exportType}\``);
  }
  if (sym.since) {
    tags.push(`\`since ${sym.since}\``);
  }

  if (tags.length > 0) {
    md += `${tags.join(' ')}\n\n`;
  }

  // Deprecation Warning Callout
  if (sym.deprecated) {
    md += `> [!WARNING]\n`;
    md += `> **Deprecated:** ${sym.deprecated}\n\n`;
  }

  // Description
  if (sym.description) {
    md += `${sym.description}\n\n`;
  }

  // Code Signature Block
  if (sym.signature) {
    const lang = relPath.endsWith('.ts') || relPath.endsWith('.tsx') ? 'typescript' : 'javascript';
    md += `\`\`\`${lang}\n${sym.signature}\n\`\`\`\n\n`;
  }

  // Properties Table (for Interfaces / Types)
  if (sym.properties && sym.properties.length > 0) {
    md += `#### Properties\n\n`;
    md += `| Property | Type | Description |\n`;
    md += `| :--- | :--- | :--- |\n`;
    for (const p of sym.properties) {
      const optStr = p.optional ? ` *(optional)*` : '';
      md += `| \`${p.name}\`${optStr} | \`${p.type}\` | ${p.description || '—'} |\n`;
    }
    md += `\n`;
  }

  // Generics / Templates
  if (sym.templates && sym.templates.length > 0) {
    md += `**Generics:**\n`;
    for (const t of sym.templates) {
      md += `- \`<${t}>\`\n`;
    }
    md += `\n`;
  }

  // Parameters Table
  if (sym.params && sym.params.length > 0) {
    md += `#### Parameters\n\n`;
    md += `| Parameter | Type | Default | Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const p of sym.params) {
      const optStr = p.optional ? ` *(optional)*` : '';
      const nameCol = `\`${p.name}\`${optStr}`;
      const typeCol = `\`${p.type || 'any'}\``;
      const defCol = p.defaultValue !== undefined ? `\`${p.defaultValue}\`` : '—';
      const descCol = p.description || '—';
      md += `| ${nameCol} | ${typeCol} | ${defCol} | ${descCol} |\n`;
    }
    md += `\n`;
  }

  // Return Value
  if (sym.returns) {
    md += `#### Returns\n\n`;
    const retType = sym.returns.type ? `\`${sym.returns.type}\`` : '`void`';
    const retDesc = sym.returns.description ? ` — ${sym.returns.description}` : '';
    md += `- ${retType}${retDesc}\n\n`;
  }

  // Throws Exceptions
  if (sym.throws && sym.throws.length > 0) {
    md += `#### Throws\n\n`;
    for (const th of sym.throws) {
      const typeStr = th.type ? `\`${th.type}\`` : '`Error`';
      const descStr = th.description ? ` — ${th.description}` : '';
      md += `- ${typeStr}${descStr}\n`;
    }
    md += `\n`;
  }

  // Code Examples
  if (sym.examples && sym.examples.length > 0) {
    md += `#### Example${sym.examples.length > 1 ? 's' : ''}\n\n`;
    for (const ex of sym.examples) {
      // Check if example is already fenced
      if (ex.includes('```')) {
        md += `${ex}\n\n`;
      } else {
        md += `\`\`\`typescript\n${ex}\n\`\`\`\n\n`;
      }
    }
  }

  // See Also
  if (sym.see && sym.see.length > 0) {
    md += `**See also:** ${sym.see.join(', ')}\n\n`;
  }

  // Nested Members (Class Methods)
  if (sym.members && sym.members.length > 0) {
    md += `#### Methods\n\n`;
    for (const m of sym.members) {
      md += `##### \`${sym.name}.${m.name}()\`\n\n`;
      if (m.deprecated) {
        md += `> ⚠️ **Deprecated:** ${m.deprecated}\n\n`;
      }
      if (m.description) {
        md += `${m.description}\n\n`;
      }
      if (m.signature) {
        md += `\`\`\`typescript\n${m.signature}\n\`\`\`\n\n`;
      }
      if (m.params && m.params.length > 0) {
        md += `| Parameter | Type | Default | Description |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        for (const p of m.params) {
          const optStr = p.optional ? ` *(optional)*` : '';
          md += `| \`${p.name}\`${optStr} | \`${p.type || 'any'}\` | ${p.defaultValue !== undefined ? `\`${p.defaultValue}\`` : '—'} | ${p.description || '—'} |\n`;
        }
        md += `\n`;
      }
      if (m.returns) {
        md += `**Returns:** \`${m.returns.type}\` ${m.returns.description || ''}\n\n`;
      }
    }
  }

  md += `\n`;
  return md;
}

// ============================================================================
// Core Execution Engine
// ============================================================================
/**
 * Runs the documentation generation cycle.
 *
 * @param {GeneratorOptions} options - Configuration options.
 * @returns {{ success: boolean, filesParsed: number, symbolsExtracted: number, durationMs: number }}
 */
function runGenerator(options) {
  const startTime = Date.now();

  const files = discoverSourceFiles(options.input, options);
  if (files.length === 0) {
    console.log(`${style.yellow}[!] No matching source files found for input:${style.reset} ${options.input}`);
    return { success: false, filesParsed: 0, symbolsExtracted: 0, durationMs: 0 };
  }

  const parsedDocs = [];
  let totalSymbols = 0;

  for (const file of files) {
    try {
      const doc = parseSourceFile(file);
      parsedDocs.push(doc);
      totalSymbols += doc.symbols.length;
      const rel = path.relative(process.cwd(), file);
      console.log(`  ${style.green}✓${style.reset} Parsed ${style.bold}${rel}${style.reset} ${style.dim}(${doc.symbols.length} symbols)${style.reset}`);
    } catch (err) {
      console.error(`  ${style.red}✗ Error parsing ${file}:${style.reset} ${err.message}`);
    }
  }

  const markdown = generateMarkdown(parsedDocs, options);
  const resolvedOutput = path.resolve(process.cwd(), options.output);

  // Ensure output parent directories exist
  const outputDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(resolvedOutput, markdown, 'utf-8');

  const durationMs = Date.now() - startTime;
  return {
    success: true,
    filesParsed: files.length,
    symbolsExtracted: totalSymbols,
    durationMs,
  };
}

// ============================================================================
// Watch Mode
// ============================================================================
/**
 * Monitors file system changes and triggers debounced documentation rebuilds.
 *
 * @param {GeneratorOptions} options - Configuration options.
 */
function startWatchMode(options) {
  console.log(`\n${style.cyan}👀 Watch mode active.${style.reset} Monitoring ${style.bold}${options.input}${style.reset} for changes...`);
  console.log(`${style.dim}Press Ctrl+C to stop.${style.reset}\n`);

  let debounceTimer = null;
  const targetPath = path.resolve(process.cwd(), options.input);

  const triggerRebuild = (eventType, filename) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const timeStr = new Date().toTimeString().split(' ')[0];
      console.log(`\n${style.dim}[${timeStr}]${style.reset} File change detected ${style.cyan}(${filename || 'unknown'})${style.reset}. Regenerating docs...`);
      const result = runGenerator(options);
      if (result.success) {
        console.log(`${style.green}✔ Updated ${options.output} in ${result.durationMs}ms (${result.symbolsExtracted} symbols)${style.reset}`);
      }
    }, 250);
  };

  try {
    fs.watch(targetPath, { recursive: options.recursive }, triggerRebuild);
  } catch (err) {
    console.error(`${style.red}Watch mode failed:${style.reset} ${err.message}`);
  }
}

// ============================================================================
// Main CLI Entry
// ============================================================================
function main() {
  const args = process.argv.slice(2);
  const options = parseCommandLineArgs(args);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log(`\n${style.bold}${style.cyan}======================================================${style.reset}`);
  console.log(`  ${style.bold}Markdown Docs Generator${style.reset} ${style.dim}v1.0.0${style.reset}`);
  console.log(`  Input:  ${style.yellow}${options.input}${style.reset}`);
  console.log(`  Output: ${style.green}${options.output}${style.reset}`);
  console.log(`${style.bold}${style.cyan}======================================================${style.reset}\n`);

  const result = runGenerator(options);

  if (result.success) {
    console.log(`\n${style.green}${style.bold}✔ Documentation successfully generated!${style.reset}`);
    console.log(`  Files scanned:    ${result.filesParsed}`);
    console.log(`  Symbols parsed:   ${result.symbolsExtracted}`);
    console.log(`  Target file:      ${style.bold}${options.output}${style.reset}`);
    console.log(`  Execution time:   ${result.durationMs}ms\n`);
  } else {
    console.log(`\n${style.red}Generation failed or no files matched.${style.reset}\n`);
    if (!options.watch) {
      process.exit(1);
    }
  }

  if (options.watch) {
    startWatchMode(options);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseCommandLineArgs,
  discoverSourceFiles,
  parseJSDocBlock,
  analyzeDeclaration,
  parseSourceFile,
  generateMarkdown,
  runGenerator,
};
