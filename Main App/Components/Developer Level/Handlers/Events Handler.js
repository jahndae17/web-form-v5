// Events Handler.js - Handles event delegation and control flow
// =========== NEW ===========

// === STATE MANAGEMENT ===
let state = {
    operation: null, // 'move', 'resize', 'nesting', or null
    element: null,   // Active element
    handle: null,    // For resize operations
    lastMousePos: { x: 0, y: 0 },
    leftClickProcessed: false,
    rightClickProcessed: false
};

// === MAIN CONTROL LOOP ===
setInterval(() => {
    if (!window.handlerData) return;
    
    const {context, inputs} = window.handlerData['shared handler data'][0];
    
    // Simple mouse state
    const mouse = {
        x: context['now'].x,
        y: context['now'].y,

        // Frame by Frame
        deltaX: context['now'].x - (state.lastMousePos.x || context['now'].x),
        deltaY: context['now'].y - (state.lastMousePos.y || context['now'].y),

        // Since Operation Start
        totalDeltaX: context['now'].x - context['on last mouse down'].x,
        totalDeltaY: context['now'].y - context['on last mouse down'].y,
        isDragging: context['on last mouse down'].time > context['on last mouse up'].time,
        element: context['now'].element,

        // Click detection
        rightClickJustHappened: context['on last mouse down'].button === 2 && 
                                   Date.now() - context['on last mouse down'].time < 100 &&
                                   !state.rightClickProcessed,
        leftClickJustHappened: context['on last mouse down'].button === 1 && 
                                   Date.now() - context['on last mouse down'].time < 100 &&
                                   !state.leftClickProcessed,
    };
    mouse.justReleased = !mouse.isDragging && (Date.now() - context['on last mouse up'].time < 20);

    // Right Click Menu Target Selection
    if (mouse.rightClickJustHappened && context['on last mouse down'].element?.classList?.contains('base-user-component')) {
        window.rightClickTarget = context['on last mouse down'].element;
        state.rightClickProcessed = true; // Set flag to prevent repeats
        console.log('Right-click target stored:', window.rightClickTarget.id);
    }

    // Reset processed flags when mouse is released
    if (mouse.justReleased) {
        state.rightClickProcessed = false;
        state.leftClickProcessed = false;
    }

    // Handle active operations
    if (mouse.isDragging && state.operation && state.element) {
        const eventName = `live${state.operation.charAt(0).toUpperCase() + state.operation.slice(1)}`;
        const detail = state.operation === 'resize' ? {mouse, handle: state.handle} : mouse;
        state.element.dispatchEvent(new CustomEvent(eventName, {detail}));
    }
    
    // Complete operations on mouse release
    if (mouse.justReleased && state.operation && state.element) {
        const eventName = `complete${state.operation.charAt(0).toUpperCase() + state.operation.slice(1)}`;
        state.element.dispatchEvent(new CustomEvent(eventName, {detail: mouse}));
        resetState();
    }
    
    // Route new interactions
    if (!state.operation && mouse.element) {
        routeInteraction(mouse, context);
    }
    
    state.lastMousePos = { x: mouse.x, y: mouse.y };
}, 10);

// === INTERACTION ROUTING ===
function routeInteraction(mouse, context) {
    if (mouse.element.classList?.contains('resize-handle')) {
        const component = mouse.element.closest('.base-user-component');
        component?.dispatchEvent(new CustomEvent('handleResize', {detail: {mouse, handle: mouse.element}}));
    } else if (mouse.element.classList?.contains('base-user-component') && 
                            context['on last mouse down'].button === 0) {
        mouse.element.dispatchEvent(new CustomEvent('handleComponent', {detail: mouse}));
    } else if (mouse.element.id === 'mainCanvas') {
        document.dispatchEvent(new CustomEvent('handleCanvas', {detail: mouse}));
    } else {
        document.dispatchEvent(new CustomEvent('handleMouseOff', {detail: mouse}));
    }
}

// === STATE MANAGEMENT ===
function resetState() {
    state.element?.dispatchEvent(new CustomEvent('cleanup'));
    state = { 
        operation: null, 
        element: null, 
        handle: null, 
        lastMousePos: state.lastMousePos,
        leftClickProcessed: false,
        rightClickProcessed: false
    };
}

// === PUBLIC API ===
window.EventsHandler = {
    start: (operation, element, handle = null) => {
        state.operation = operation;
        state.element = element;
        state.handle = handle;
    }
};


// =========== OLD ===========
/*
// === GLOBAL STATE MANAGEMENT ===
// Central state object tracks all active operations and their associated elements
let state = {
    // Operation flags - only one primary operation can be active at a time
    isResizing: false, isMoving: false, isNesting: false, handle: '', 
    
    // Element references - track which DOM elements are involved in current operations
    resizingElement: null, movingElement: null, nestingElement: null,
    
    // Position tracking - store initial positions for delta calculations
    moveStartPosition: null, resizeStartPosition: null,
    lastMousePosition: { x: 0, y: 0 },
    
    // Timing controls - prevent rapid operation switching
    lastResizeTime: 0, lastMoveTime: 0, lastNestTime: 0
};

// === MAIN CONTROL LOOP ===
// 10ms interval polls for mouse data and coordinates all component interactions
// Control flow chooses whether a select, resize, move, or no operation is performed 
// based on Main App\Components\Developer Level\Registers\Handler Data.json (updated by Inputs Handler)
setInterval(() => {
    // Exit early if no mouse data available from Inputs Handler
    if (!window.handlerData) return;
    
    // Extract mouse context and input data from shared handler registry
    const {context, inputs} = window.handlerData['shared handler data'][0];
    
    // === MOUSE STATE DETECTION ===
    // Determine current mouse interaction state for operation control
    const hasMouseDown = context['on last mouse down'].time > context['on last mouse up'].time;
    const mouseJustPressed = Date.now() - context['on last mouse down'].time < 200; // Recent mouse down
    const rightClickJustHappened = context['on last right click'] ? Date.now() - context['on last right click'].time < 100 : false; // Recent right click
    
    // === LIVE MOUSE DATA PREPARATION ===
    // Calculate frame-to-frame deltas for smooth real-time visual updates during drag operations
    const liveMouse = {
        // Frame deltas for smooth animation
        deltaX: context['now'].x - (state.lastMousePosition.x || context['now'].x),
        deltaY: context['now'].y - (state.lastMousePosition.y || context['now'].y),
        
        // Current mouse state
        button: context['now'].button,
        element: context['now'].element,
        x: context['now'].x,
        y: context['now'].y,
        
        // Total movement since mouse down (for operation completion)
        totalDeltaX: context['now'].x - context['on last mouse down'].x,
        totalDeltaY: context['now'].y - context['on last mouse down'].y,
        
        // Interaction state flags
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: hasMouseDown,
        isMouseDown: hasMouseDown,
        mouseJustPressed: mouseJustPressed
    };
    
    // === COMPLETION MOUSE DATA ===
    // Mouse data specifically for detecting when operations should complete (on mouse up)
    const completionMouse = {
        // Total movement from start to end of drag operation
        deltaX: context['on last mouse up'].x - context['on last mouse down'].x,
        deltaY: context['on last mouse up'].y - context['on last mouse down'].y,
        
        // Final mouse state
        button: context['on last mouse up'].button,
        element: context['now'].element,
        x: context['now'].x,
        y: context['now'].y,
        
        // Timing for operation completion detection
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: context['on last mouse down'].time > context['on last mouse up'].time
    };

    handleOperations(liveMouse, completionMouse, inputs);
    
    // Update last position for next frame
    state.lastMousePosition = { x: context['now'].x, y: context['now'].y };
}, 10);

function handleOperations(liveMouse, completionMouse, inputs) {
    // ==== 2 ====
    // === LIVE UPDATES DURING DRAG ===
    // Send real-time mouse data to behavior files for smooth visual feedback
    // Equal priority updates.
    
    // Move operation: Update component position in real-time during drag
    if (state.isMoving && liveMouse.isDragging) {
        state.movingElement.dispatchEvent(new CustomEvent('liveMove', {detail: liveMouse}));
    }

    // Resize operation: Update component dimensions in real-time during drag
    if (state.isResizing && liveMouse.isDragging) {
        state.resizingElement.dispatchEvent(new CustomEvent('liveResize', {detail: {handle: state.handle, liveMouse}}));
    }
    
    // Nesting operation: Show visual feedback for potential drop targets during drag
    if (state.isNesting && liveMouse.isDragging) {
        state.nestingElement.dispatchEvent(new CustomEvent('liveNesting', {detail: {liveMouse, inputs}}));
    }
    
    // ==== 3 ====
    // === OPERATION COMPLETION DETECTION ===
    // When mouse is released, check if any operations need to be completed
    // Priority order ensures resize/nesting operations complete before move cleanup
    const completionChecks = [
        // Resizing operation - Highest Priority: Apply final size changes
        {condition: state.isResizing, action: () => state.resizingElement.dispatchEvent(new CustomEvent('resizeElement', {detail: {handle: state.handle, deltaX: completionMouse.deltaX, deltaY: completionMouse.deltaY}})), reset: 'resize'},
        
        // Nesting operation - Medium Priority: Complete drop/nesting behavior  
        {condition: state.isNesting, action: () => state.nestingElement.dispatchEvent(new CustomEvent('completeNesting', {detail: {completionMouse, inputs}})), reset: 'nesting'},
        
        // Move operation - Lowest Priority: Clean up visual indicators only
        {condition: state.isMoving && !state.isResizing && !state.isNesting, action: () => {
            state.movingElement.dispatchEvent(new CustomEvent('cleanupMoveVisuals'));
        }, reset: 'move'}
    ];

    // ==== 3.1 ====
    // Execute completion when mouse is released (not dragging) and release was recent
    if (!completionMouse.isDragging && completionMouse.timeDiff < 20) {
        const activeOperation = completionChecks.find(op => op.condition);
        if (activeOperation) {
            activeOperation.action();
            resetState(activeOperation.reset);
            return; // Exit early after completing operation
        }
    }

    // ==== 1 ====
    // === ELEMENT INTERACTION ROUTING ===
    // Route mouse interactions to appropriate behavior files based on element type
    // Each element type has specialized behavior handlers for mouse interactions
    
    if (liveMouse.element?.classList?.contains('base-user-component')) {
        // User component interaction: Handle selection, drag initiation, general component behavior
        liveMouse.element.dispatchEvent(new CustomEvent('handleComponentInteraction', {detail: {liveMouse, inputs, state}}));
        
    } else if (liveMouse.element?.classList?.contains('resize-handle') && liveMouse.element.closest('.base-user-component')) {
        // Resize handle interaction: Handle component resizing via corner/edge handles
        liveMouse.element.closest('.base-user-component').dispatchEvent(new CustomEvent('handleResizeHandleInteraction', {detail: {handle: liveMouse.element, liveMouse, inputs, state}}));
        
    } else if (liveMouse.element?.id === 'mainCanvas') {
        // Canvas interaction: Handle clicks on empty canvas area (deselection, canvas operations)
        document.dispatchEvent(new CustomEvent('handleCanvasInteraction', {detail: {inputs, timeDiff: completionMouse.timeDiff, state}}));
        
    } else {
        // Default/fallback interaction: Handle mouse over non-interactive elements
        document.dispatchEvent(new CustomEvent('handleMouseOff', {detail: {inputs, state}}));
    }
}

// === STATE RESET FUNCTION ===
// Clean up operation state and dispatch cleanup events to behavior files
function resetState(type) {
    // Define state reset configurations for each operation type
    const stateResets = {
        resize: {
            isResizing: false, resizingElement: null, handle: '', 
            resizeStartPosition: null, lastResizeTime: Date.now()
        },
        move: {
            isMoving: false, movingElement: null, 
            moveStartPosition: null, lastMoveTime: Date.now()
        },
        nesting: {
            isNesting: false, nestingElement: null, lastNestTime: Date.now()
        }
    };
    
    // === CLEANUP EVENT DISPATCHING ===
    // Send cleanup events to behavior files to remove visual indicators
    
    if (type === 'move' && state.movingElement) {
        // Remove move visual indicators (drag shadows, position guides)
        state.movingElement.dispatchEvent(new CustomEvent('cleanupMoveVisuals'));
    }
    
    if (type === 'nesting' && state.nestingElement) {
        // Remove nesting visual indicators (drop zone highlights, nesting previews)
        state.nestingElement.dispatchEvent(new CustomEvent('cleanupNestingVisuals'));
        document.dispatchEvent(new CustomEvent('clearNestingHighlights'));
    }
    
    // Apply state reset and log completion
    Object.assign(state, stateResets[type]);
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} operation ended`);
}

/////// Here down belongs in behavior files using dispatch operations to communicate

// === GLOBAL API FOR BEHAVIOR FILES ===
// Public interface that allows behavior files to update Events Handler state
// Behavior files call these functions to initiate operations (move, resize, nesting)
window.EventsHandler = {
    // Initiate move operation for a component
    startMove: (element) => {
        state.movingElement = element; 
        state.isMoving = true; 
        state.moveStartPosition = null;
    },
    
    // Initiate resize operation for a component with specific handle
    startResize: (element, handle) => {
        state.resizingElement = element; 
        state.isResizing = true; 
        state.handle = handle; 
        state.resizeStartPosition = null;
    },
    
    // Initiate nesting operation for drag-and-drop into containers
    startNesting: (element) => {
        state.nestingElement = element; 
        state.isNesting = true;
    },
    
    // Update which component is currently selected
    updateSelectedComponent: (element) => {
        state.selectedElement = element;
    }
}; 
*/