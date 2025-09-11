// Events Handler.js - Handles event delegation and control flow
// =========== NEW ===========

// === UTILITY FUNCTIONS ===
function createMouseState(context, state) {
    const mouse = {
        x: context['now'].x,
        y: context['now'].y,
        deltaX: context['now'].x - (state.lastMousePos.x || context['now'].x),
        deltaY: context['now'].y - (state.lastMousePos.y || context['now'].y),
        totalDeltaX: context['now'].x - context['on last mouse down'].x,
        totalDeltaY: context['now'].y - context['on last mouse down'].y,
        element: context['now'].element,
        rightClickJustHappened: isRecentClick(context, 2) && !state.rightClickProcessed,
        leftClickJustHappened: isRecentClick(context, 1) && !state.leftClickProcessed,
    };
    
    // Different drag detection for different purposes
    const isMouseDown = context['on last mouse down'].time > context['on last mouse up'].time;
    const hasMovement = Math.abs(mouse.totalDeltaX) > 3 || Math.abs(mouse.totalDeltaY) > 3;
    
    // For active operations (resize/move), consider dragging as soon as mouse is down
    mouse.isDragging = isMouseDown;
    
    // For deselection purposes, use stricter movement-based detection
    mouse.isDraggingForDeselect = isMouseDown && hasMovement;
    
    mouse.justReleased = !isMouseDown && (Date.now() - context['on last mouse up'].time < 100);
    return mouse;
}

function isRecentClick(context, button) {
    return context['on last mouse down'].button === button && 
           Date.now() - context['on last mouse down'].time < 100;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function createEventName(prefix, operation) {
    return `${prefix}${capitalize(operation)}`;
}

// === RESIZE EVENT ROUTING ===
const resizeRouting = {
    'gallery-child': 'startGalleryResize',
    'gallery-component': 'startResize', 
    'base-user-component': 'startResize'
};

// === ROUTING TABLE ===
const interactionRoutes = [
    {
        condition: (el, context, mouse) => el.classList?.contains('resize-handle'),
        action: (mouse, el) => {
            const component = el.closest('.base-user-component');
            if (!component) return;
            
            const eventName = Object.entries(resizeRouting)
                .find(([cls]) => component.classList.contains(cls))?.[1] 
                || 'startResize';
            
            component.dispatchEvent(new CustomEvent(eventName, {
                detail: {mouse, handle: el}
            }));
        }
    },
    {
        condition: (el, context, mouse) => {
            return el.classList?.contains('base-user-component') &&
            context['on last mouse down'].button === 0;
        },
        action: (mouse, el) => el.dispatchEvent(new CustomEvent('handleComponentSelect', {detail: mouse}))
    },
    {
        condition: (el, context, mouse) => {
            const isCanvas = el.id === 'mainCanvas';
            const recentClick = isRecentClick(context, 0);
            return isCanvas && recentClick && !state.leftClickProcessed;
        },
        action: (mouse, el) => {
            document.dispatchEvent(new CustomEvent('handleDeselect', {detail: mouse}));
            state.leftClickProcessed = true; // Mark as processed to prevent multiple triggers
        }
    }
];

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
    const mouse = createMouseState(context, state);
    
    // Handle right-click target selection
    if (mouse.rightClickJustHappened && mouse.element?.classList?.contains('base-user-component')) {
        window.rightClickTarget = mouse.element;
        state.rightClickProcessed = true;
        console.log('Right-click target stored:', window.rightClickTarget.id);
    }
    
    // Reset flags on release
    if (mouse.justReleased) {
        state.rightClickProcessed = false;
        state.leftClickProcessed = false;
    }
    
    // Handle active operations
    if (mouse.isDragging && state.operation && state.element) {
        const eventName = createEventName('live', state.operation);
        const detail = state.operation === 'resize' ? {mouse, handle: state.handle} : mouse;
        state.element.dispatchEvent(new CustomEvent(eventName, {detail}));
    }
    
    // Complete operations
    if (mouse.justReleased && state.operation && state.element) {
        const eventName = createEventName('complete', state.operation);
        state.element.dispatchEvent(new CustomEvent(eventName, {detail: mouse}));
        resetState();
    }
    
    // Route new interactions using table
    if (!state.operation && mouse.element) {
        const route = interactionRoutes.find(r => r.condition(mouse.element, context, mouse));
        route?.action(mouse, mouse.element) || 
            document.dispatchEvent(new CustomEvent('handleElementLeave', {detail: mouse}));
    }
    
    state.lastMousePos = { x: mouse.x, y: mouse.y };
}, 10);

// === STATE MANAGEMENT ===
function resetState() {
    state.element?.dispatchEvent(new CustomEvent('resetOperationState'));
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
    },
    getState: () => ({ ...state }) // Return a copy of the state
};