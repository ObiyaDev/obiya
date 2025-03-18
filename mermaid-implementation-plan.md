# Mermaid Flow Visualization Implementation Plan

## Overview

This document outlines the implementation plan for adding a feature to automatically generate mermaid diagram files for flows in the Motia project. These diagrams will be updated whenever flows are built or changed (with hot reloading).

## Requirements

1. Generate mermaid diagram files for each flow
2. Place them in a directory structure under `steps/mermaid/`
3. Update these files whenever flows are built or changed (with hot reloading)
4. Minimal impact on package size (no large dependencies)

## Implementation Steps

### 1. Create a Mermaid Generator Module

- [x] Create a new file `packages/core/src/mermaid-generator.ts`
- [x] Implement a `MermaidGenerator` class
- [x] Add methods to generate mermaid diagrams from flow data
- [x] Add methods to save diagrams to files in the `steps/mermaid/` directory

### 2. Hook into Flow Update Events

- [x] Add event handlers for flow creation, updates, and removal
- [x] Connect these handlers to the `LockedData` class events

### 3. Integrate with Development Process

- [x] Modify `packages/snap/src/dev.ts` to initialize the mermaid generator
- [x] Ensure diagrams are generated during initial build
- [x] Ensure diagrams are updated during hot reloading

### 4. Testing

- [x] Test with existing flows
- [x] Verify diagrams are correctly generated
- [x] Verify diagrams are updated when flows change

## Progress Log

_This section will be updated as implementation progresses._

### Initial Setup (Date: 3/18/2025)

- Created implementation plan document
- Analyzed existing codebase to understand flow structure and event system

### Implementation (Date: 3/18/2025)

- Created `packages/core/src/mermaid-generator.ts` with the `MermaidGenerator` class
- Implemented methods to generate mermaid diagrams from flow data
- Added methods to save diagrams to files in the `steps/mermaid/` directory
- Added event handlers for flow creation, updates, and removal
- Connected these handlers to the `LockedData` class events
- Modified `packages/snap/src/dev.ts` to initialize the mermaid generator
- Updated `packages/core/index.ts` to export the `MermaidGenerator` class

### Issues Encountered (Date: 3/18/2025)

- Error: `Module '"@motiadev/core"' has no exported member 'MermaidGenerator'`
- Need to build the core package after adding the new file and updating the exports
- Built the core package using `npm run build` to make the MermaidGenerator class available
- Modified `packages/snap/src/dev.ts` to use a direct import from the mermaid-generator.ts file
- Built the snap package using `npm run build` to apply the changes
- Added debug logging to the MermaidGenerator class to troubleshoot issues

### Testing and Verification (Date: 3/18/2025)

- Successfully generated mermaid diagrams for all flows
- Verified the diagrams are correctly generated with proper nodes and connections
- Confirmed the diagrams are updated when flows change
