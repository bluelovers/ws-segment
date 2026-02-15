# @novel-segment/util-compare & @novel-segment/sort-* Packages
# @novel-segment/util-compare & @novel-segment/sort-* Packages

## Overview / Overview

`@novel-segment/util-compare` and `@novel-segment/sort-*` are utility modules for the `novel-segment` Chinese word segmentation library. These modules provide dictionary line processing, comparison utilities, and sorting functionality for dictionary files.

`@novel-segment/util-compare` and `@novel-segment/sort-*` are utility modules for the `novel-segment` Chinese word segmentation library. These modules provide dictionary line processing, comparison utilities, and sorting functionality for dictionary files.

## Package List / Package List

| Package Name / Package Name | Description / Description |
|-----------------------------|---------------------------|
| `@novel-segment/util-compare` | Dictionary line processing and comparison utilities / Dictionary line processing and comparison utilities |
| `@novel-segment/sort-dict-table` | Dictionary table sorting module / Dictionary table sorting module |
| `@novel-segment/sort-synonym` | Synonym dictionary sorting module / Synonym dictionary sorting module |

---

## @novel-segment/util-compare

Core utility module providing dictionary line processing, parsing, and type checking functionality.

Core utility module providing dictionary line processing, parsing, and type checking functionality.

### Exports / Exports

| Export / Export | Type / Type | Description / Description |
|-----------------|-------------|---------------------------|
| `USE_CJK_MODE` | `const` | CJK character processing mode constant (value: 2) / CJK character processing mode constant (value: 2) |
| `EnumLineType` | `const enum` | Line type enumeration / Line type enumeration |
| `ILoadDictFileRow` | `interface` | Dictionary file row data interface / Dictionary file row data interface |
| `ILoadDictFileRow2` | `type` | Extended dictionary file row data interface / Extended dictionary file row data interface |
| `stringifyHandleDictLinesList` | `function` | Convert row list to string array / Convert row list to string array |
| `handleDictLines` | `function` | Process dictionary lines / Process dictionary lines |
| `loadDictFile` | `function` | Load dictionary file asynchronously / Load dictionary file asynchronously |
| `chkLineType` | `function` | Check line type / Check line type |

### EnumLineType / EnumLineType

Enumeration for identifying line types in dictionary files.

Enumeration for identifying line types in dictionary files.

| Value / Value | Name / Name | Description / Description |
|---------------|-------------|---------------------------|
| `0` | `BASE` | Normal dictionary data line / Normal dictionary data line |
| `1` | `COMMENT` | Comment line starting with `//` / Comment line starting with `//` |
| `2` | `COMMENT_TAG` | Tagged comment line with `@todo` or format descriptions / Tagged comment line with `@todo` or format descriptions |

### Usage Examples / Usage Examples

#### Loading and Processing Dictionary Files / Loading and Processing Dictionary Files

```typescript
import { loadDictFile, handleDictLines, chkLineType, EnumLineType } from '@novel-segment/util-compare';

// Load dictionary file asynchronously
// Load dictionary file asynchronously
loadDictFile('dictionary.txt', (list, cur) => {
  // Filter callback - return true to keep the line
  // Filter callback - return true to keep the line
  return cur.data[2] > 100; // Keep lines with frequency > 100
  // Keep lines with frequency > 100
})
.then(rows => {
  console.log(rows);
});
```

#### Checking Line Types / Checking Line Types

```typescript
import { chkLineType, EnumLineType } from '@novel-segment/util-compare';

const line1 = 'word|0x4000|100';
const line2 = '// This is a comment';
const line3 = '// @todo: need to fix';

console.log(chkLineType(line1)); // EnumLineType.BASE (0)
console.log(chkLineType(line2)); // EnumLineType.COMMENT (1)
console.log(chkLineType(line3)); // EnumLineType.COMMENT_TAG (2)
```

#### Processing Lines with Custom Parser / Processing Lines with Custom Parser

```typescript
import { handleDictLines } from '@novel-segment/util-compare';

const lines = ['apple|100|50', 'banana|200|30', '// comment'];

const result = handleDictLines(
  lines,
  (list, cur) => {
    // Custom filter logic
    // Custom filter logic
    return cur.line_type !== EnumLineType.COMMENT;
  },
  {
    parseFn: (line) => line.split('|'),
  }
);
```

---

## @novel-segment/sort-dict-table

Dictionary table sorting module for sorting segment dictionary files by CJK character order.

Dictionary table sorting module for sorting segment dictionary files by CJK character order.

### Exports / Exports

| Export / Export | Type / Type | Description / Description |
|-----------------|-------------|---------------------------|
| `IHandleDictTable` | `type` | Dictionary table row data type / Dictionary table row data type |
| `IOptions` | `interface` | Sort options interface / Sort options interface |
| `sortLines` | `function` | Sort dictionary lines / Sort dictionary lines |
| `loadFile` | `function` | Load and sort dictionary file / Load and sort dictionary file |
| `SortList` | `function` | Sort list of dictionary rows / Sort list of dictionary rows |

### Sorting Rules / Sorting Rules

1. **Tagged Comment Lines (COMMENT_TAG)**: Sorted by original index position
2. **Regular Comment Lines (COMMENT)**: Sorted by original index position
3. **Base Lines (BASE)**: Sorted by CJK character order, with original index as tiebreaker

1. **Tagged Comment Lines (COMMENT_TAG)**: Sorted by original index position
2. **Regular Comment Lines (COMMENT)**: Sorted by original index position
3. **Base Lines (BASE)**: Sorted by CJK character order, with original index as tiebreaker

### Usage Examples / Usage Examples

#### Sorting Dictionary Lines / Sorting Dictionary Lines

```typescript
import { sortLines, loadFile } from '@novel-segment/sort-dict-table';

// Sort lines from string array
// Sort lines from string array
const lines = [
  ' banana|0x4000|100',
  'apple|0x4000|200',
  '// @todo: review',
  'cherry|0x4000|50',
];

const sorted = sortLines(lines, 'dictionary.txt');
// Result: lines sorted by CJK order with comments preserved in position
// Result: lines sorted by CJK order with comments preserved in position
```

#### Loading and Sorting File / Loading and Sorting File

```typescript
import { loadFile } from '@novel-segment/sort-dict-table';

// Load and sort dictionary file
// Load and sort dictionary file
loadFile('path/to/dict.txt', {
  cbIgnore: (cur) => {
    console.log('Ignored line:', cur.line);
    // Log ignored lines (comments)
    // Log ignored lines (comments)
  },
})
.then(sortedRows => {
  console.log('Sorted rows:', sortedRows.length);
});
```

---

## @novel-segment/sort-synonym

Synonym dictionary sorting module for sorting synonym dictionary files.

Synonym dictionary sorting module for sorting synonym dictionary files.

### Exports / Exports

| Export / Export | Type / Type | Description / Description |
|-----------------|-------------|---------------------------|
| `IHandleDictSynonym` | `type` | Synonym row data type / Synonym row data type |
| `sortLines` | `function` | Sort synonym lines / Sort synonym lines |
| `loadFile` | `function` | Load and sort synonym file / Load and sort synonym file |
| `SortList` | `function` | Sort list of synonym rows / Sort list of synonym rows |

### File Format / File Format

Each line contains a main word followed by its synonyms, separated by commas:

Each line contains a main word followed by its synonyms, separated by commas:

```
main_word,synonym1,synonym2,synonym3
main_word,synonym1,synonym2,synonym3
```

### Sorting Rules / Sorting Rules

1. **Tagged Comment Lines (COMMENT_TAG)**: Processed first, `@`-prefixed tags come first
2. **Regular Comment Lines (COMMENT)**: Sorted by original index position
3. **Base Lines (BASE)**: Sorted by CJK character order, with original index as tiebreaker

1. **Tagged Comment Lines (COMMENT_TAG)**: Processed first, `@`-prefixed tags come first
2. **Regular Comment Lines (COMMENT)**: Sorted by original index position
3. **Base Lines (BASE)**: Sorted by CJK character order, with original index as tiebreaker

### Usage Examples / Usage Examples

#### Sorting Synonym Lines / Sorting Synonym Lines

```typescript
import { sortLines, loadFile } from '@novel-segment/sort-synonym';

// Sort synonym lines
// Sort synonym lines
const lines = [
  'happy,joyful,cheerful',
  'big,large,huge',
  '// @todo: add more synonyms',
  'small,tiny,little',
];

const sorted = sortLines(lines, 'synonyms.txt');
// Result: synonyms sorted by CJK order, duplicate synonyms removed
// Result: synonyms sorted by CJK order, duplicate synonyms removed
```

#### Loading and Sorting File / Loading and Sorting File

```typescript
import { loadFile } from '@novel-segment/sort-synonym';

// Load and sort synonym dictionary file
// Load and sort synonym dictionary file
loadFile('path/to/synonyms.txt')
.then(sortedRows => {
  sortedRows.forEach(row => {
    console.log(row.line); // Output sorted synonym lines
    // Output sorted synonym lines
  });
});
```

---

## Installation / Installation

```bash
# Install util-compare
# Install util-compare
pnpm add @novel-segment/util-compare

# Install sort packages
# Install sort packages
pnpm add @novel-segment/sort-dict-table
pnpm add @novel-segment/sort-synonym
```

## Dependencies / Dependencies

These packages depend on:

These packages depend on:

- `@novel-segment/loader-line` - Line loading utilities
- `@novel-segment/loaders/segment` - Segment parsing utilities
- `@novel-segment/util` - CJK character utilities and comparison functions
- `array-hyper-unique` - Array unique utilities
- `bluebird` - Promise library

## License / License

MIT License