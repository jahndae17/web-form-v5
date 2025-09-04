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
    
    // Calculate frame-to-frame delta for smooth live updates
    const frameDeltaX = context['now'].x - (state.lastMousePosition.x || context['now'].x);
    const frameDeltaY = context['now'].y - (state.lastMousePosition.y || context['now'].y);
    
    // Live mouse - for real-time visual updates during drag
    const liveMouse = {
        deltaX: frameDeltaX,  // Frame-to-frame movement
        deltaY: frameDeltaY,  // Frame-to-frame movement
        totalDeltaX: context['now'].x - context['on last mouse down'].x,  // Total movement since mouse down
        totalDeltaY: context['now'].y - context['on last mouse down'].y,  // Total movement since mouse down
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: context['on last mouse down'].time > context['on last mouse up'].time,
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
    // Live updates during drag (highest priority for visual feedback)
    if (state.isMoving && liveMouse.isDragging) {
        updateLiveMove(state.movingElement, liveMouse);
    }
    
    if (state.isResizing && liveMouse.isDragging) {
        updateLiveResize(state.resizingElement, state.handle, liveMouse);
    }
    
    if (state.isNesting && liveMouse.isDragging) {
        updateLiveNesting(state.nestingElement, liveMouse, inputs);
    }
    
    // Consolidated completion check
    const completionChecks = [
        // Resizing operation // Highest Priority
        {condition: state.isResizing, action: () => state.resizingElement.dispatchEvent(new CustomEvent('resizeElement', {detail: {handle: state.handle, deltaX: completionMouse.deltaX, deltaY: completionMouse.deltaY}})), reset: 'resize'},
        // Nesting operation - use live positioning for completion
        {condition: state.isNesting, action: () => handleNestingCompletion(state.nestingElement, completionMouse, inputs), reset: 'nesting'},
        // Move operation // Lowest Priority - don't dispatch event since we've been updating live
        {condition: state.isMoving && !state.isResizing && !state.isNesting, action: () => {
            // Movement has already been applied live, just dispatch completion event
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

    // Handle current element interactions (use liveMouse for current position)
    const elementHandlers = {
        'base-user-component': () => handleComponent(liveMouse.element, liveMouse, inputs),
        'resize-handle': () => handleResizeHandle(liveMouse.element, liveMouse, inputs),
        'mainCanvas': () => handleDeselect(inputs, completionMouse.timeDiff)
    };

    const handlerKey = liveMouse.element?.classList?.contains('base-user-component') ? 'base-user-component' :
                      liveMouse.element?.classList?.contains('resize-handle') ? 'resize-handle' :
                      liveMouse.element?.id === 'mainCanvas' ? 'mainCanvas' : null;

    handlerKey ? elementHandlers[handlerKey]() : handleMouseOff(inputs);
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
    
    // Restore visual state for operations
    if (type === 'move' && state.movingElement) {
        state.movingElement.style.transform = '';
        state.movingElement.style.boxShadow = '';
    }
    
    if (type === 'nesting' && state.nestingElement) {
        // Restore nesting element visual state
        state.nestingElement.style.transform = '';
        state.nestingElement.style.boxShadow = '';
        state.nestingElement.style.border = '';
        state.nestingElement.style.opacity = '';
        // Clear any nesting target highlights
        clearNestingHighlights();
    }
    
    Object.assign(state, stateResets[type]);
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} operation ended`);
}

// Live update functions for real-time visual feedback
function updateLiveMove(element, liveMouse) {
    // Use frame delta for smooth incremental movement
    const currentLeft = parseInt(element.style.left || 0);
    const currentTop = parseInt(element.style.top || 0);
    
    const newLeft = currentLeft + liveMouse.deltaX;
    const newTop = currentTop + liveMouse.deltaY;
    
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    element.style.transform = 'scale(1.02)';
    element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    
    // Debug logging (optional)
    if (Math.abs(liveMouse.deltaX) > 0 || Math.abs(liveMouse.deltaY) > 0) {
        console.log(`Live move: ${element.id} by (${liveMouse.deltaX}, ${liveMouse.deltaY}) to (${newLeft}, ${newTop})`);
    }
}

function updateLiveNesting(element, liveMouse, inputs) {
    // Use frame delta for smooth incremental movement (same as move)
    const currentLeft = parseInt(element.style.left || 0);
    const currentTop = parseInt(element.style.top || 0);
    
    const newLeft = currentLeft + liveMouse.deltaX;
    const newTop = currentTop + liveMouse.deltaY;
    
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    
    // Enhanced visual feedback for nesting operation
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 12px 24px rgba(0, 150, 255, 0.4)';
    element.style.border = '2px dashed #0096ff';
    element.style.opacity = '0.8';
    
    // Live nesting target detection
    const elementRect = element.getBoundingClientRect();
    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;
    
    // Temporarily hide element to detect target underneath
    element.style.visibility = 'hidden';
    const targetElement = document.elementFromPoint(centerX, centerY);
    element.style.visibility = 'visible';
    
    // Highlight valid nesting targets
    clearNestingHighlights();
    if (targetElement && 
        targetElement.classList.contains('acceptsChildren') && 
        targetElement !== element.parentElement &&
        targetElement !== element) {
        
        targetElement.style.outline = '3px solid #0096ff';
        targetElement.style.backgroundColor = 'rgba(0, 150, 255, 0.1)';
        targetElement.setAttribute('data-nesting-target', 'true');
        
        console.log('Valid nesting target highlighted:', targetElement.id || targetElement.className);
    }
    
    // Debug logging (optional)
    if (Math.abs(liveMouse.deltaX) > 0 || Math.abs(liveMouse.deltaY) > 0) {
        console.log(`Live nesting: ${element.id} by (${liveMouse.deltaX}, ${liveMouse.deltaY}) to (${newLeft}, ${newTop})`);
    }
}

function clearNestingHighlights() {
    // Remove all existing nesting target highlights
    document.querySelectorAll('[data-nesting-target="true"]').forEach(target => {
        target.style.outline = '';
        target.style.backgroundColor = '';
        target.removeAttribute('data-nesting-target');
    });
}

function updateLiveResize(element, handle, liveMouse) {
    if (!state.resizeStartPosition) {
        const rect = element.getBoundingClientRect();
        state.resizeStartPosition = {
            width: rect.width,
            height: rect.height,
            left: parseInt(element.style.left || 0),
            top: parseInt(element.style.top || 0)
        };
    }
    
    // Apply live resize transformation based on handle
    applyLiveResize(element, handle, liveMouse.deltaX, liveMouse.deltaY);
}

function applyLiveResize(element, handle, deltaX, deltaY) {
    const start = state.resizeStartPosition;
    
    const resizeOperations = {
        'nw': () => {
            element.style.width = `${start.width - deltaX}px`;
            element.style.height = `${start.height - deltaY}px`;
            element.style.left = `${start.left + deltaX}px`;
            element.style.top = `${start.top + deltaY}px`;
        },
        'ne': () => {
            element.style.width = `${start.width + deltaX}px`;
            element.style.height = `${start.height - deltaY}px`;
            element.style.top = `${start.top + deltaY}px`;
        },
        'sw': () => {
            element.style.width = `${start.width - deltaX}px`;
            element.style.height = `${start.height + deltaY}px`;
            element.style.left = `${start.left + deltaX}px`;
        },
        'se': () => {
            element.style.width = `${start.width + deltaX}px`;
            element.style.height = `${start.height + deltaY}px`;
        },
        'n': () => {
            element.style.height = `${start.height - deltaY}px`;
            element.style.top = `${start.top + deltaY}px`;
        },
        's': () => {
            element.style.height = `${start.height + deltaY}px`;
        },
        'e': () => {
            element.style.width = `${start.width + deltaX}px`;
        },
        'w': () => {
            element.style.width = `${start.width - deltaX}px`;
            element.style.left = `${start.left + deltaX}px`;
        }
    };
    
    resizeOperations[handle]?.();
}

function handleComponent(element, mouse, inputs) {
    // Handle selection
    if (!inputs['selectedElementList'][element.id] && Math.abs(mouse.deltaX) + Math.abs(mouse.deltaY) < 16 && mouse.timeDiff < 9) {
        console.log("Select operation");
        deselectAll(inputs);
        inputs['selectedElementList'][element.id] = element;
        element.dispatchEvent(new CustomEvent('componentSelected'));
        return;
    }

    // Only allow operations on selected elements
    if (!inputs['selectedElementList'][element.id]) return;

    // Edge detection helper
    const edges = getEdgeInfo(element, mouse);
    
    // Handle resize handles
    element.dispatchEvent(new CustomEvent(edges.isNearEdge ? 'addResizeHandles' : 'removeResizeHandles'));
    
    // Handle drag operations
    if (mouse.isDragging && !state.isResizing && !state.isNesting) {
        if (edges.isNearEdge) {
            startResize(element, edges, inputs);
        } else if (element.classList.contains('isNestable') && !state.isMoving) {
            startNesting(element, inputs);
        } else if (!state.isMoving) {
            startMove(element, inputs);
        }
    }
}

// Helper function for edge detection
function getEdgeInfo(element, mouse) {
    const rect = element.getBoundingClientRect();
    const threshold = 10;
    
    const nearLeft = mouse.x < rect.left + threshold;
    const nearRight = mouse.x > rect.right - threshold;
    const nearTop = mouse.y < rect.top + threshold;
    const nearBottom = mouse.y > rect.bottom - threshold;
    
    return {
        nearLeft, nearRight, nearTop, nearBottom,
        isNearEdge: nearLeft || nearRight || nearTop || nearBottom
    };
}

function handleResizeHandle(handle, mouse, inputs) {
    const parentComponent = handle.closest('.base-user-component');
    if (!parentComponent) return;

    // Only allow resize/move operations on selected elements
    if (!inputs['selectedElementList'][parentComponent.id]) {
        return; // Element must be selected for resize/move operations
    }

    if (mouse.isDragging && !state.isResizing) {
        // Use getEdgeInfo helper function for consistency
        const edges = getEdgeInfo(parentComponent, mouse);
        
        if (edges.isNearEdge) {
            startResize(parentComponent, edges, inputs);
        } else {
            startMove(parentComponent, inputs);
        }
    }
}

function handleDeselect(inputs, timeDiff) {
    const shouldBlockDeselect = Date.now() - state.lastResizeTime < 10 || Date.now() - state.lastMoveTime < 100 || Date.now() - state.lastNestTime < 100;
    if (timeDiff < 9 && !shouldBlockDeselect) {
        deselectAll(inputs);
    }
}

function handleMouseOff(inputs) {
    if (!state.isResizing && !state.isNesting) {
        for (const key in inputs['selectedElementList']) {
            const selectedElement = inputs['selectedElementList'][key];
            if (selectedElement.classList.contains('base-user-component')) {
                selectedElement.dispatchEvent(new CustomEvent('removeResizeHandles'));
            }
        }
    }
}

function deselectAll(inputs) {
    for (const key in inputs['selectedElementList']) {
        inputs['selectedElementList'][key].dispatchEvent(new CustomEvent('componentDeselected'));
    }
    inputs['selectedElementList'] = {};
}

// Simplified startResize function
function startResize(element, edges, inputs) {
    if (!inputs['selectedElementList'][element.id]) {
        console.log('Resize blocked: Element not selected');
        return;
    }

    state.resizingElement = element;
    state.isResizing = true;
    state.resizeStartPosition = null; // Reset for live updates
    
    // Simplified handle determination
    const {nearLeft, nearRight, nearTop, nearBottom} = edges;
    
    if (element.classList.contains('ResizableXorYAxis')) {
        state.handle = (nearLeft && nearTop) ? 'nw' :
                      (nearLeft && nearBottom) ? 'sw' :
                      (nearRight && nearTop) ? 'ne' :
                      (nearRight && nearBottom) ? 'se' :
                      nearLeft ? 'w' : nearRight ? 'e' :
                      nearTop ? 'n' : nearBottom ? 's' : null;
    } else if (element.classList.contains('ResizableXAxis')) {
        state.handle = nearRight ? 'e' : nearLeft ? 'w' : null;
    } else if (element.classList.contains('ResizableYAxis')) {
        state.handle = nearBottom ? 's' : nearTop ? 'n' : null;
    }
    
    console.log('Resize started with handle:', state.handle);
}

function startMove(element, inputs) {
    // Double-check element is selected before allowing move
    if (!inputs['selectedElementList'][element.id]) {
        console.log('Move blocked: Element not selected');
        return;
    }

    state.movingElement = element;
    state.isMoving = true;
    state.moveStartPosition = null; // Reset for live updates
    console.log('Move operation started');
}

function startNesting(element, inputs) {
    // Double-check element is selected and nestable before allowing nesting
    if (!inputs['selectedElementList'][element.id]) {
        console.log('Nesting blocked: Element not selected');
        return;
    }
    
    if (!element.classList.contains('isNestable')) {
        console.log('Nesting blocked: Element not nestable');
        return;
    }

    state.nestingElement = element;
    state.isNesting = true;
    console.log('Nesting operation started');
}

function handleNestingCompletion(nestingElement, mouse, inputs) {
    // Use current live position instead of calculating from deltas
    const currentLeft = parseInt(nestingElement.style.left || 0);
    const currentTop = parseInt(nestingElement.style.top || 0);
    
    // Find element at the center of the component's current position
    const componentRect = nestingElement.getBoundingClientRect();
    const centerX = componentRect.left + componentRect.width / 2;
    const centerY = componentRect.top + componentRect.height / 2;
    
    // Temporarily hide component to get element underneath
    nestingElement.style.visibility = 'hidden';
    const targetElement = document.elementFromPoint(centerX, centerY);
    nestingElement.style.visibility = 'visible';
    
    // Check if target accepts children and is different from current parent
    if (targetElement && 
        targetElement.classList.contains('acceptsChildren') && 
        targetElement !== nestingElement.parentElement &&
        targetElement !== nestingElement) {
        
        console.log('Nesting component into target:', targetElement);
        performNesting(nestingElement, targetElement, currentLeft, currentTop);
    } else {
        // No valid nesting target, dispatch completion event
        console.log('No valid nesting target, nesting operation completed at current position');
        nestingElement.dispatchEvent(new CustomEvent('nestingMoveComplete', {
            detail: { 
                finalX: currentLeft, 
                finalY: currentTop,
                completionMouse: mouse
            }
        }));
    }
}

function performNesting(nestableComponent, targetContainer, absoluteX, absoluteY) {
    // Calculate relative position within new parent
    const containerRect = targetContainer.getBoundingClientRect();
    const relativeX = absoluteX - containerRect.left;
    const relativeY = absoluteY - containerRect.top;
    
    // Ensure target container has relative positioning for absolute children
    if (getComputedStyle(targetContainer).position === 'static') {
        targetContainer.style.position = 'relative';
    }
    
    // Move component to new parent
    targetContainer.appendChild(nestableComponent);
    
    // Update position to be relative to new parent
    nestableComponent.style.left = relativeX + 'px';
    nestableComponent.style.top = relativeY + 'px';
    
    // Dispatch nesting events
    nestableComponent.dispatchEvent(new CustomEvent('componentNested', {
        detail: { 
            newParent: targetContainer,
            relativeX: relativeX,
            relativeY: relativeY
        }
    }));
    
    targetContainer.dispatchEvent(new CustomEvent('childComponentAdded', {
        detail: { 
            child: nestableComponent,
            relativeX: relativeX,
            relativeY: relativeY
        }
    }));
    
    console.log('Component successfully nested');
} // Check every 100ms