# @novel-segment/loader-* Dictionary Loader Packages
# @novel-segment/loader-* dictionary Loader Packages

## Overview / Overview

`@novel-segment/loader-*` is a series of dictionary loader modules for the `novel-segment` Chinese word segmentation library. These modules provide functionality for loading various dictionary file formats, supporting both synchronous and asynchronous operations.

`@novel-segment/loader-*` is a series of dictionary loader modules for the `novel-segment` Chinese word segmentation library. These modules provide functionality for loading various dictionary file formats, supporting both synchronous and asynchronous operations.

## Package List / Package List

| Package Name / Package Name | Description / Description |
|-----------------------------|---------------------------|
| `@novel-segment/dict-loader-core` | Core loader class and utilities / Core loader class and utilities |
| `@novel-segment/loader-line` | Simple line-by-line loader / Simple line-by-line loader |
| `@novel-segment/loader-stopword` | Stopword dictionary loader / Stopword dictionary loader |
| `@novel-segment/loaders/segment` | Segment dictionary loader / Segment dictionary loader |
| `@novel-segment/stream-loader-core` | Stream-based loader utilities / Stream-based loader utilities |

## Class Inheritance Hierarchy / Class Inheritance Hierarchy

```
LoaderClass<T, R>                    # Core loader class / Core loader class
stream-loader-core/                  # Stream utilities / Stream utilities
line.ts                              # Line-by-line stream / Line-by-line stream
stream.ts                            # Async stream loader / Async stream loader
sync.ts                              # Sync stream loader / Sync stream loader
    ReadableSync                     # Synchronous readable stream / Synchronous readable stream
```

## Core Class Descriptions / Core Class Descriptions

### LoaderClass<T, R>

Base class for all dictionary loaders, providing file loading, line parsing, and serialization functionality.

Base class for all dictionary loaders, providing file loading, line parsing, and serialization functionality.

**Main Properties / Main Properties:**

| Property / Property | Type / Type | Description / Description |
|--------------------|-------------|---------------------------|
| `default` | `Function` | Alias for load method / Alias for load method |
| `defaultOptions` | `IOptions` | Default options / Default options |

**Main Methods / Main Methods:**

| Method / Method | Description / Description |
|----------------|---------------------------|
| `load(file, options)` | Load dictionary asynchronously / Load dictionary asynchronously |
| `loadSync(file, options)` | Load dictionary synchronously / Load dictionary synchronously |
| `loadStream(file, options)` | Load as async stream / Load as async stream |
| `loadStreamSync(file, options)` | Load as sync stream / Load as sync stream |
| `parseLine(input)` | Parse a line / Parse a line |
| `stringifyLine(data)` | Stringify a row / Stringify a row |
| `serialize(data)` | Serialize data array / Serialize data array |
| `filter(line)` | Filter lines / Filter lines |

### IOptions<T, R>

Loader options interface.

Loader options interface.

```typescript
interface IOptions<T, R> {
  parseLine?(input: string, oldFn?: (input: string) => R): R;
  mapper?(line): any;
  filter?(line): string | undefined;
  stringifyLine?(data: R): string;
}
```

## Loader Package Details / Loader Package Details

### @novel-segment/dict-loader-core

Core dictionary loader module providing the base `LoaderClass`.

Core dictionary loader module providing the base `LoaderClass`.

**Usage Example / Usage Example:**

```typescript
import { LoaderClass } from '@novel-segment/dict-loader-core';

// Create a custom loader
// Create a custom loader
const myLoader = new LoaderClass<string[], string>({
  parseLine(input: string) {
    return input.trim();
  },
  filter(line: string) {
    // Skip empty lines and comments
    // Skip empty lines and comments
    if (line && !line.startsWith('//')) {
      return line;
    }
  }
});

// Load dictionary
// Load dictionary
const data = myLoader.loadSync('path/to/dict.txt');
```

### @novel-segment/loader-line

Simple line-by-line loader where each line is a separate entry.

Simple line-by-line loader where each line is a separate entry.

**Usage Example / Usage Example:**

```typescript
import { loadSync, Loader } from '@novel-segment/loader-line';

// Load dictionary synchronously
// Load dictionary synchronously
const words = loadSync('words.txt');
// Returns: ['word1', 'word2', 'word3', ...]

// Or using Loader instance
// Or using Loader instance
const words2 = Loader.loadSync('words.txt');
```

### @novel-segment/loader-stopword

Stopword dictionary loader with automatic line trimming.

Stopword dictionary loader with automatic line trimming.

**Usage Example / Usage Example:**

```typescript
import { loadSync } from '@novel-segment/loader-stopword';

// Load stopword dictionary
// Load stopword dictionary
const stopwords = loadSync('stopwords.txt');
// Each line is trimmed before adding
// Each line is trimmed before adding
// Returns: ['the', 'is', 'at', ...]
```

### @novel-segment/loaders/segment

Segment dictionary loader for files with word, part of speech, and frequency.

Segment dictionary loader for files with word, part of speech, and frequency.

**File Format / File Format:**

```
word|pos|frequency
word|pos|frequency
...
```

**Usage Example / Usage Example:**

```typescript
import { loadSync, parseLine, stringifyLine } from '@novel-segment/loaders/segment';

// Load segment dictionary
// Load segment dictionary
const dict = loadSync('dict.txt');
// Returns: [['word', 0x400000, 100], ...]

// Parse a single line
// Parse a single line
const row = parseLine('word|0x400000|100');
// Returns: ['word', 4194304, 100]

// Stringify a row
// Stringify a row
const line = stringifyLine(['word', 4194304, 100]);
// Returns: 'word|0x4000|100'
```

### @novel-segment/stream-loader-core

Stream-based loader utilities for efficient file processing.

Stream-based loader utilities for efficient file processing.

**Main Exports / Main Exports:**

| Module / Module | Description / Description |
|----------------|---------------------------|
| `line.ts` | Line-by-line stream utilities / Line-by-line stream utilities |
| `stream.ts` | Async stream loader / Async stream loader |
| `sync.ts` | Sync stream loader with `ReadableSync` class / Sync stream loader with `ReadableSync` class |

**ReadableSync Class / ReadableSync Class:**

A synchronous readable stream implementation for reading files.

A synchronous readable stream implementation for reading files.

```typescript
import { createReadStreamSync, ReadableSync } from '@novel-segment/stream-loader-core/sync';

// Create a synchronous readable stream
// Create a synchronous readable stream
const stream = createReadStreamSync('large_file.txt');

// Use with line-by-line transform
// Use with line-by-line transform
import { byLine } from '@novel-segment/stream-loader-core/line';

const lineStream = stream.pipe(byLine(line => {
  console.log(line);
}));

// Run the stream
// Run the stream
lineStream.run();
```

## Installation and Usage / Installation and Usage

### Install / Install

```bash
# Install loader packages
# Install loader packages
pnpm add @novel-segment/dict-loader-core
pnpm add @novel-segment/loader-line
pnpm add @novel-segment/loader-stopword
pnpm add @novel-segment/loaders-segment
pnpm add @novel-segment/stream-loader-core
```

### Basic Usage / Basic Usage

```typescript
import { LoaderClass } from '@novel-segment/dict-loader-core';
import { loadSync as loadLine } from '@novel-segment/loader-line';
import { loadSync as loadStopword } from '@novel-segment/loader-stopword';
import { loadSync as loadSegment } from '@novel-segment/loaders/segment';

// Load different dictionary types
// Load different dictionary types
const lines = loadLine('lines.txt');
const stopwords = loadStopword('stopwords.txt');
const segmentDict = loadSegment('segment_dict.txt');

console.log(lines);        // ['line1', 'line2', ...]
console.log(stopwords);    // ['the', 'is', 'at', ...]
console.log(segmentDict);  // [['word', pos, freq], ...]
```

## Creating Custom Loaders / Creating Custom Loaders

You can create custom loaders by extending `LoaderClass`:

You can create custom loaders by extending `LoaderClass`:

```typescript
import { LoaderClass } from '@novel-segment/dict-loader-core';

// Custom loader for CSV format
// Custom loader for CSV format
const csvLoader = new LoaderClass<string[], string[]>({
  parseLine(input: string) {
    return input.split(',').map(v => v.trim());
  },
  
  filter(line: string) {
    // Skip empty lines
    // Skip empty lines
    if (line.trim()) {
      return line;
    }
  },
  
  stringifyLine(data: string[]) {
    return data.join(',');
  }
});

// Use the custom loader
// Use the custom loader
const csvData = csvLoader.loadSync('data.csv');
```

## License / License

MIT License