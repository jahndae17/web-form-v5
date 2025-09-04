# New Component Development Process

## Core Architectural Principles
**Flow**: User Input → Inputs Handler → Events Handler → Behavior.js files

### File Structure:
- **Event Handler**: Controls all logic and priority decisions
- **Component**: `[ComponentName].html` + `[ComponentName][BehaviorName].js`

### 1. **Reactive Architecture**
- Events Handler creates events, components respond to them
- Components never poll or check state
- **Flow**: User Action → Inputs Handler → Events Handler → Component Response

### 2. **Separation of Concerns**
- One file = one responsibility
- Events Handler: Logic control only
- Behavior scripts: Response handling only
- Use `addEventListener()` for custom events between Events Handler and behaviors
- Never use `addEventListener()` for system events

### 3. **Minimize Code**
- Consolidate similar logic into helper functions
- Single-line operations when readable
- Eliminate duplicate code immediately
