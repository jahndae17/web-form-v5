# New Component Development Process

## Core Architectural Principles

### 1. **Reactive Architecture**
- Components RESPOND to events, never poll or check state
- Use `addEventListener()` for all interactions
- Events flow: User Action → Inputs Handler (detects user input events) → Events Handler (decides priority) → Component Response

### 2. **Separation of Concerns**
- **One file = One responsibility**
- Never mix concerns within a single file
- Each behavior script handles exactly one capability

### 3. **Minimize Code**
- Consolidate similar logic into helper functions
- Use object spread `Object.assign()` for state updates
- Prefer single-line operations where readable
- Eliminate duplicate code blocks immediately

## Component Creation Process Map

### Phase 1: Structure Definition
```
1. Create Component HTML
   ├── Single <div> with semantic classes
   ├── Inline <style> with consolidated CSS properties
   └── <script src> references to behavior files
   
2. Validate HTML Structure
   ├── Must have: class="[component-name] draggable [ResizeType]"
   ├── Must have: data-component="[component-name]"
   └── Must have: position: absolute in CSS
```

### Phase 2: Behavior Implementation
```
3. Create Behavior Scripts (Separate Files)
   ├── Select Behavior: componentSelected/componentDeselected events
   ├── Move Behavior: dragMove event handling
   ├── Resize Behavior: addResizeHandles/removeResizeHandles/resizeElement
   └── Custom Behaviors: specific to component functionality
   
4. Behavior Script Rules
   ├── Must start with: const component = document.querySelector()
   ├── Must wrap in IIFE: (function() { ... })()
   ├── Must check: if (!component) return;
   └── Must register event listeners, never poll
```

### Phase 3: Control Logic Integration
```
5. Events Handler Integration
   ├── Add component class to handleComponent() conditions
   ├── Ensure selection requirement before operations
   ├── Add to startResize()/startMove() validation
   └── Test priority system (Resize > Move > Select)
   
6. State Management
   ├── Add to Handler Data.json if persistent state needed
   ├── Use inputs['selectedElementList'] for selection tracking
   └── Access via window.handlerData['shared handler data'][0]
```

### Phase 4: Dynamic Loading
```
7. Component Loading Function
   ├── Add to loadComponentBehaviors() array
   ├── Use fetch() with path correction
   ├── Replace generic selectors with component.getElementById()
   └── Handle script execution with eval()
   
8. Validation Steps
   ├── Test: Single component selection/deselection
   ├── Test: Multiple component instances work independently
   ├── Test: Resize/move only work on selected components
   └── Test: Priority system prevents operation conflicts
```

## Code Minimization Standards

### Function Consolidation Rules
```javascript
// ✅ GOOD: Consolidated state object
let state = {
    isResizing: false, isMoving: false, handle: '',
    resizingElement: null, movingElement: null,
    lastResizeTime: 0, lastMoveTime: 0
};

// ❌ BAD: Separate variables
let isResizing = false;
let isMoving = false;
let handle = '';
// ... etc
```

### Helper Function Standards
```javascript
// ✅ GOOD: Reusable helper
function resetState(type) {
    if (type === 'resize') {
        Object.assign(state, {isResizing: false, resizingElement: null, handle: ''});
    }
}

// ❌ BAD: Repeated code
state.isResizing = false;
state.resizingElement = null;
state.handle = '';
```

### Event Handler Patterns
```javascript
// ✅ GOOD: Reactive event listener
component.addEventListener('componentSelected', () => {
    component.style.border = '2px solid blue';
    inputs['selectedElementList'][component.id] = component;
});

// ❌ BAD: Polling/checking
setInterval(() => {
    if (shouldBeSelected) {
        component.style.border = '2px solid blue';
    }
}, 100);
```

## Control Logic Requirements

### 1. **Selection Gating**
```javascript
// For all operations which must check selection first
if (!inputs['selectedElementList'][element.id]) {
    return; // Block operation
}
```

### 2. **Priority System**
```
Resize Operation (Highest Priority)
└── Blocks: Move, Select operations
    
Move Operation (Medium Priority)  
└── Blocks: Select operations
    
Select Operation (Lowest Priority)
└── Only executes if no other operations active
```

### 3. **State Validation**
```javascript
// Double-check in operation start functions
function startResize(element, ...args, inputs) {
    if (!inputs['selectedElementList'][element.id]) {
        console.log('Resize blocked: Element not selected');
        return;
    }
    // ... proceed with operation
}
```

### 4. **Time-Based Controls**
```javascript
// Use consistent timing patterns
const CLICK_THRESHOLD = 99;    // Max time for click detection
const BLOCK_DURATION = 100;    // Operation blocking duration
const HANDLER_INTERVAL = 100;  // Main loop frequency
```

## Debugging Standards

### Required Console Messages
```javascript
// Selection operations
console.log('Select operation');
console.log('Component deselected');

// Operation blocking
console.log('Resize blocked: Element not selected');
console.log('Move blocked: Element not selected');

// Operation lifecycle
console.log('Resize started with handle:', handle);
console.log('Move operation started');
console.log('Resize operation ended');
```

### Validation Checklist
- [ ] Component creates with unique ID
- [ ] Selection works (blue border appears)
- [ ] Deselection works (border disappears)
- [ ] Resize only works when selected
- [ ] Move only works when selected
- [ ] Multiple instances work independently
- [ ] No console errors
- [ ] Priority system functions correctly

## Anti-Patterns to Avoid

### ❌ **Proactive Patterns**
- `setInterval()` for state checking
- Continuous polling for conditions
- Predictive behavior logic

### ❌ **Concern Mixing**
- Selection logic in move behaviors
- Resize logic in select behaviors
- HTML generation in event handlers

### ❌ **Code Duplication**
- Repeated event handling blocks
- Duplicate validation logic
- Similar functions without consolidation

### ❌ **Direct DOM Manipulation Without Events**
- Bypassing event system for component changes
- Direct style changes without component notification
- State changes without proper event dispatch

This process ensures consistent, maintainable, and minimal code while preserving clear separation of concerns and reactive architecture principles.
