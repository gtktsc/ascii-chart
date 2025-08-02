# ASCII Chart Library - AI Coding Instructions

## Architecture Overview

This is a TypeScript library for generating ASCII charts in terminals. The codebase follows a modular service-oriented architecture:

- **Core Entry**: `src/index.ts` exports the main `plot` function and all types
- **Main Service**: `src/services/plot.ts` orchestrates chart generation through coordinate transformation, drawing, and styling
- **Service Modules**: Separate services handle coordinates (`coords.ts`), drawing (`draw.ts`), settings (`settings.ts`), defaults (`defaults.ts`), and overrides (`overrides.ts`)
- **Type System**: All types centralized in `src/types/index.ts` with comprehensive JSDoc documentation
- **Constants**: ASCII symbols defined in `src/constants/index.ts` (AXIS, CHART, THRESHOLDS, POINT)

## Key Patterns & Conventions

### Type System & Documentation

- Use descriptive union types: `Point = [x: number, y: number]`, `Coordinates = SingleLine | MultiLine`
- All public APIs require comprehensive JSDoc documentation (enforced by ESLint)
- Service functions are typed with specific parameter interfaces
- Unused variables prefixed with `_` to avoid ESLint warnings

### Data Flow Architecture

```typescript
Input → getInput() → toPlot() → drawChart() → addOverrides() → Output
```

1. **Input Processing**: Raw coordinates normalized via `getInput()` in `defaults.ts`, with yRange filtering
2. **Coordinate Transformation**: `coords.ts` handles scaling via `scaler()`, two-phase transformation, and bounds checking
3. **Drawing Pipeline**: `draw.ts` renders with position validation and `debugMode` for out-of-bounds logging
4. **Style Overrides**: `overrides.ts` applies colors using ANSI escape codes, labels, legends, thresholds

### Error Handling & Debugging

- **Debug Mode**: `debugMode: true` enables console logging for out-of-bounds drawing attempts
- **Bounds Validation**: `drawPosition()` includes try-catch with silent failures when debugMode is off
- **Input Filtering**: Invalid coordinates filtered early in the pipeline (yRange, undefined points)
- **Graceful Degradation**: Charts render with available data even when some points are invalid

### Testing Strategy

- **Snapshot Testing**: Primary testing method using visual ASCII output comparison
- **Test Structure**: `src/__tests__/snapshot.test.ts` runs all examples against `__snapshots__/*.txt`
- **Example-Driven**: `src/examples.ts` contains 600+ test cases using `create()` helper
- **Test Generation**: `generateAllSettingsExamples()` creates exhaustive boolean/numeric combinations
- **Snapshot Updates**: `npm run snapshots:generate` recreates all expected outputs

### Build System (tsup)

- **Dual Format**: Builds both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) with correct `package.json` exports
- **Type Declarations**: Generates `.d.ts` for ESM and `.d.cts` for CJS
- **Watch Mode**: `npm run build:watch` for development
- **Example Preview**: `npm run examples` with live reloading for chart development

## Development Workflows

### Adding New Features

1. Add types to `src/types/index.ts` with comprehensive JSDoc (required by ESLint)
2. Update `Settings` interface and defaults in `src/services/defaults.ts`
3. Implement logic in appropriate service module (`draw.ts`, `coords.ts`, `overrides.ts`)
4. Add examples to `src/examples.ts` using the `create()` helper and data constants
5. Run `npm run snapshots:generate` to create test fixtures
6. Verify with `npm test` (includes coverage reporting)

### Symbol Customization System

- **Symbol Categories**: `axis` (coordinate system), `chart` (data visualization), `empty`/`background`, `thresholds`, `point`
- **Override Pattern**: Via `Settings.symbols` - see `src/constants/index.ts` for complete defaults
- **Advanced Styling**: Custom symbols via `lineFormatter` functions with `LineFormatterArgs`
- **Color Integration**: Symbols combined with ANSI color codes in overrides

### Coordinate System & Transformations

- **Origin**: Bottom-left by default, customizable via `axisCenter: [x, y]`
- **Two-Phase Transform**: Data coordinates → plot coordinates → ASCII grid via `toPlot()`
- **Scaling**: `scaler()` function handles domain/range mapping with edge case handling
- **Expansion Arrays**: `expansionX/Y` handle non-uniform scaling for better ASCII representation
- **Bounds Filtering**: Points outside `yRange` filtered early, custom ticks filtered by min/max

### Chart Mode Implementation

- **Line Mode** (default): Connected paths using CHART symbols with direction-aware corners
- **Point Mode**: Scatter plots using POINT symbols at exact coordinates
- **Bar Modes**: Vertical/horizontal bars with axis-aware fill direction
- **Fill Areas**: `fillArea: true` uses `area` symbol to fill below line charts

### Performance & Memory Patterns

- **String Building**: ASCII grid built via direct array access, not concatenation
- **Coordinate Caching**: Transformations cached during single `plot()` call
- **Lazy Filtering**: Data filtered progressively through pipeline stages
- **Efficient Testing**: 600+ examples tested via single snapshot comparison loop

### Error Handling & Edge Cases

- **Bounds Checking**: `drawPosition()` includes try-catch with optional debug logging
- **Data Validation**: Empty inputs return early, malformed points filtered
- **Overflow Protection**: Large numbers formatted with k/M suffixes automatically (threshold: 1000)
- **Axis Edge Cases**: Special handling for axis intersections and moved origins
- **Silent Failures**: Drawing errors fail silently when `debugMode: false` to prevent noise
- **Input Sanitization**: Coordinates filtered for `undefined` values and yRange boundaries

## Critical Implementation Details

### ANSI Color System

- **Type Safety**: `Color = 'ansiRed' | 'ansiGreen' | ...` prevents invalid colors
- **Multi-Series**: Colors can be arrays for different data series
- **Dynamic Colors**: `ColorGetter` function type for programmatic color assignment
- **Reset Codes**: Colors wrapped with `\u001b[0m` reset codes to prevent bleeding

### Testing & Quality Assurance

- **Snapshot Workflow**: Visual regression testing via ASCII text comparison
- **Coverage Requirements**: Jest configured with coverage reporting to `coverage/`
- **Example Data**: Predefined datasets in `examples.ts` (short, negativeMixed, simpleHigh, etc.)
- **Boundary Testing**: Edge cases like single points, negative ranges, extreme values

## Common Integration Points

- **CLI Tool**: Separate package `simple-ascii-chart-cli` consumes this library
- **Web API**: Deployed at `simple-ascii-chart.vercel.app/api` with JSON input/output
- **Playground**: Interactive demo at `simple-ascii-chart.vercel.app/playground`
- **Export Formats**: Supports both ESM `import` and CJS `require()` via dual build
