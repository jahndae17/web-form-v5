// Events Handler.js - Handles event delegation and control flow
let state = {
    isResizing: false, isMoving: false, isNesting: false, handle: '', 
    resizingElement: null, movingElement: null, nestingElement: null,
    moveStartPosition: null, resizeStartPosition: null,
    lastMousePosition: { x: 0, y: 0 },
    lastResizeTime: 0, lastMoveTime: 0, lastNestTime: 0
};

// Control flow to choose whether a select, resize, move, or no operation is being performed based on Main App\Components\Developer Level\Registers\Handler Data.json (updated by other handlers)
setInterval(() => {
    if (!window.handlerData) return;
    
    const {context, inputs} = window.handlerData['shared handler data'][0];
    
    // Add mouse down detection
    const hasMouseDown = context['on last mouse down'].time > context['on last mouse up'].time;
    const mouseJustPressed = Date.now() - context['on last mouse down'].time < 200; // Recent mouse down
    
    // Calculate frame-to-frame delta for smooth live updates
    const frameDeltaX = context['now'].x - (state.lastMousePosition.x || context['now'].x);
    const frameDeltaY = context['now'].y - (state.lastMousePosition.y || context['now'].y);
    
    const liveMouse = {
        deltaX: frameDeltaX,
        deltaY: frameDeltaY,
        totalDeltaX: context['now'].x - context['on last mouse down'].x,
        totalDeltaY: context['now'].y - context['on last mouse down'].y,
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: hasMouseDown,
        isMouseDown: hasMouseDown,           // ✅ Add this
        mouseJustPressed: mouseJustPressed,  // ✅ Add this
        element: context['now'].element,
        x: context['now'].x,
        y: context['now'].y
    };
    
    // Completion mouse - for operation completion detection
    const completionMouse = {
        deltaX: context['on last mouse up'].x - context['on last mouse down'].x,
        deltaY: context['on last mouse up'].y - context['on last mouse down'].y,
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: context['on last mouse down'].time > context['on last mouse up'].time,
        element: context['now'].element,
        x: context['now'].x,
        y: context['now'].y
    };

    handleOperations(liveMouse, completionMouse, inputs);
    
    // Update last position for next frame
    state.lastMousePosition = { x: context['now'].x, y: context['now'].y };
}, 10);

function handleOperations(liveMouse, completionMouse, inputs) {
    // Live updates during drag - dispatch to behavior files
    if (state.isMoving && liveMouse.isDragging) {
        state.movingElement.dispatchEvent(new CustomEvent('liveMove', {detail: liveMouse}));
    }
    
    if (state.isResizing && liveMouse.isDragging) {
        state.resizingElement.dispatchEvent(new CustomEvent('liveResize', {detail: {handle: state.handle, liveMouse}}));
    }
    
    if (state.isNesting && liveMouse.isDragging) {
        state.nestingElement.dispatchEvent(new CustomEvent('liveNesting', {detail: {liveMouse, inputs}}));
    }
    
    // Consolidated completion check
    const completionChecks = [
        // Resizing operation // Highest Priority
        {condition: state.isResizing, action: () => state.resizingElement.dispatchEvent(new CustomEvent('resizeElement', {detail: {handle: state.handle, deltaX: completionMouse.deltaX, deltaY: completionMouse.deltaY}})), reset: 'resize'},
        // Nesting operation - dispatch completion to behavior
        {condition: state.isNesting, action: () => state.nestingElement.dispatchEvent(new CustomEvent('completeNesting', {detail: {completionMouse, inputs}})), reset: 'nesting'},
        // Move operation // Lowest Priority - dispatch completion to behavior
        {condition: state.isMoving && !state.isResizing && !state.isNesting, action: () => {
            state.movingElement.dispatchEvent(new CustomEvent('dragMoveComplete', {detail: completionMouse}));
        }, reset: 'move'}
    ];

    // Execute first matching completion
    if (!completionMouse.isDragging && completionMouse.timeDiff < 20) {
        const activeOperation = completionChecks.find(op => op.condition);
        if (activeOperation) {
            activeOperation.action();
            resetState(activeOperation.reset);
            return;
        }
    }

    // Handle current element interactions - dispatch to behavior files
    if (liveMouse.element?.classList?.contains('base-user-component')) {
        liveMouse.element.dispatchEvent(new CustomEvent('handleComponentInteraction', {detail: {liveMouse, inputs, state}}));
    } else if (liveMouse.element?.classList?.contains('resize-handle')) {
        const parentComponent = liveMouse.element.closest('.base-user-component');
        if (parentComponent) {
            parentComponent.dispatchEvent(new CustomEvent('handleResizeHandleInteraction', {detail: {handle: liveMouse.element, liveMouse, inputs, state}}));
        }
    } else if (liveMouse.element?.id === 'mainCanvas') {
        document.dispatchEvent(new CustomEvent('handleCanvasInteraction', {detail: {inputs, timeDiff: completionMouse.timeDiff, state}}));
    } else {
        document.dispatchEvent(new CustomEvent('handleMouseOff', {detail: {inputs, state}}));
    }
}

function resetState(type) {
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
    
    // Dispatch cleanup events to behavior files
    if (type === 'move' && state.movingElement) {
        state.movingElement.dispatchEvent(new CustomEvent('cleanupMoveVisuals'));
    }
    
    if (type === 'nesting' && state.nestingElement) {
        state.nestingElement.dispatchEvent(new CustomEvent('cleanupNestingVisuals'));
        document.dispatchEvent(new CustomEvent('clearNestingHighlights'));
    }
    
    Object.assign(state, stateResets[type]);
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} operation ended`);
}

/////// Here down belongs in behavior files using dispatch operations to communicate

// Functions for behavior files to update Events Handler state
window.EventsHandler = {
    startMove: (element) => {
        state.movingElement = element;
        state.isMoving = true;
        state.moveStartPosition = null;
        console.log('Move operation started');
    },
    
    startResize: (element, handle) => {
        state.resizingElement = element;
        state.isResizing = true;
        state.handle = handle;
        state.resizeStartPosition = null;
        console.log('Resize started with handle:', handle);
    },
    
    startNesting: (element) => {
        state.nestingElement = element;
        state.isNesting = true;
        console.log('Nesting operation started');
    },
    
    getState: () => ({ ...state }),
    
    updateSelectedComponent: (element) => {
        state.selectedElement = element;
    }
}; 