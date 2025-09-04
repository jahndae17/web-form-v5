// Events Handler.js - Handles event delegation and control flow
let state = {
    isResizing: false, isMoving: false, isNesting: false, handle: '', 
    resizingElement: null, movingElement: null, nestingElement: null,
    lastResizeTime: 0, lastMoveTime: 0, lastNestTime: 0, functionsLoaded: false
};
let resizeElement, addResizeHandles, removeResizeHandles;

// Load resize functions once at startup
loadBehavior().then(() => state.functionsLoaded = true);

function loadBehavior() {
    return fetch('../Components/User Level/Components/Base User Component/Base User Component Resize Behavior.js')
        .then(response => response.text())
        .then(script => {
            eval(script);
            window.resizeElement = resizeElement;
            window.addResizeHandles = addResizeHandles;
            window.removeResizeHandles = removeResizeHandles;
            console.log('Resize functions loaded');
        })
        .catch(error => console.error('Error loading resize behavior:', error));
}

// Control flow to choose whether a select, resize, move, or no operation is being performed based on Main App\Components\Developer Level\Registers\Handler Data.json (updated by other handlers)
setInterval(() => {
    if (!window.handlerData || !state.functionsLoaded) return;
    
    const {context, inputs} = window.handlerData['shared handler data'][0];
    const mouse = {
        deltaX: context['on last mouse up'].x - context['on last mouse down'].x,
        deltaY: context['on last mouse up'].y - context['on last mouse down'].y,
        timeDiff: Date.now() - context['on last mouse up'].time,
        isDragging: context['on last mouse down'].time > context['on last mouse up'].time,
        element: context['now'].element,
        x: context['now'].x,
        y: context['now'].y
    };

    handleOperations(mouse, inputs);
}, 100);

function handleOperations(mouse, inputs) {
    // Complete nesting operations (highest priority)
    if (state.isNesting && !mouse.isDragging && mouse.timeDiff < 200) {
        handleNestingCompletion(state.nestingElement, mouse, inputs);
        resetState('nesting');
    }
    
    // Complete resize/move operations
    if (state.isResizing && !mouse.isDragging && mouse.timeDiff < 200) {
        window.resizeElement(state.resizingElement, state.handle, mouse.deltaX, mouse.deltaY);
        resetState('resize');
    }
    
    if (state.isMoving && !mouse.isDragging && mouse.timeDiff < 200 && !state.isResizing && !state.isNesting) {
        state.movingElement.dispatchEvent(new CustomEvent('dragMove', {detail: mouse}));
        resetState('move');
    }

    // Handle current element interactions
    if (mouse.element?.classList.contains('base-user-component')) {
        handleComponent(mouse.element, mouse, inputs);
    } else if (mouse.element?.classList.contains('resize-handle')) {
        handleResizeHandle(mouse.element, mouse, inputs);
    } else if (mouse.element?.id === 'mainCanvas') {
        handleDeselect(inputs, mouse.timeDiff);
    } else {
        handleMouseOff(inputs);
    }
}

function resetState(type) {
    if (type === 'resize') {
        Object.assign(state, {isResizing: false, resizingElement: null, handle: '', lastResizeTime: Date.now()});
        console.log('Resize operation ended');
    } else if (type === 'move') {
        Object.assign(state, {isMoving: false, movingElement: null, lastMoveTime: Date.now()});
        console.log('Move operation ended');
    } else if (type === 'nesting') {
        Object.assign(state, {isNesting: false, nestingElement: null, lastNestTime: Date.now()});
        console.log('Nesting operation ended');
    }
}

function handleComponent(element, mouse, inputs) {
    // Handle selection
    if (!inputs['selectedElementList'][element.id] && Math.abs(mouse.deltaX) + Math.abs(mouse.deltaY) < 16 && mouse.timeDiff < 99) {
        console.log("Select operation");
        deselectAll(inputs);
        inputs['selectedElementList'][element.id] = element;
        element.dispatchEvent(new CustomEvent('componentSelected'));
        return;
    }

    // Only allow resize/move operations on selected elements
    if (!inputs['selectedElementList'][element.id]) {
        return; // Element must be selected for resize/move operations
    }

    // Handle resize handles and operations
    const rect = element.getBoundingClientRect();
    const nearLeft = mouse.x < rect.left + 20;
    const nearRight = mouse.x > rect.right - 20;
    const nearTop = mouse.y < rect.top + 20;
    const nearBottom = mouse.y > rect.bottom - 20;
    const isNearEdge = nearLeft || nearRight || nearTop || nearBottom;

    if (isNearEdge) {
        window.addResizeHandles(element);
        if (mouse.isDragging && !state.isResizing && !state.isNesting) startResize(element, nearLeft, nearRight, nearTop, nearBottom, inputs);
    } else {
        window.removeResizeHandles(element);
        // Check for nesting first (higher priority than move)
        if (mouse.isDragging && !state.isResizing && !state.isMoving && !state.isNesting && element.classList.contains('isNestable')) {
            startNesting(element, inputs);
        } else if (mouse.isDragging && !state.isResizing && !state.isMoving && !state.isNesting) {
            startMove(element, inputs);
        }
    }
}

function handleResizeHandle(handle, mouse, inputs) {
    const parentComponent = handle.closest('.base-user-component');
    if (!parentComponent) return;

    // Only allow resize/move operations on selected elements
    if (!inputs['selectedElementList'][parentComponent.id]) {
        return; // Element must be selected for resize/move operations
    }

    const rect = parentComponent.getBoundingClientRect();
    const nearLeft = mouse.x < rect.left + 20;
    const nearRight = mouse.x > rect.right - 20;
    const nearTop = mouse.y < rect.top + 20;
    const nearBottom = mouse.y > rect.bottom - 20;

    if (mouse.isDragging && !state.isResizing) {
        if (nearLeft || nearRight || nearTop || nearBottom) {
            startResize(parentComponent, nearLeft, nearRight, nearTop, nearBottom, inputs);
        } else {
            startMove(parentComponent, inputs);
        }
    }
}

function handleDeselect(inputs, timeDiff) {
    const shouldBlockDeselect = Date.now() - state.lastResizeTime < 100 || Date.now() - state.lastMoveTime < 100 || Date.now() - state.lastNestTime < 100;
    if (timeDiff < 99 && !shouldBlockDeselect) {
        deselectAll(inputs);
    }
}

function handleMouseOff(inputs) {
    if (!state.isResizing && !state.isNesting) {
        for (const key in inputs['selectedElementList']) {
            const selectedElement = inputs['selectedElementList'][key];
            if (selectedElement.classList.contains('base-user-component')) {
                window.removeResizeHandles(selectedElement);
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

function startResize(element, nearLeft, nearRight, nearTop, nearBottom, inputs) {
    // Double-check element is selected before allowing resize
    if (!inputs['selectedElementList'][element.id]) {
        console.log('Resize blocked: Element not selected');
        return;
    }

    state.resizingElement = element;
    state.isResizing = true;
    
    if (element.classList.contains('ResizableXAxis') && (nearRight || nearLeft)) {
        state.handle = nearRight ? 'e' : 'w';
    } else if (element.classList.contains('ResizableYAxis') && (nearTop || nearBottom)) {
        state.handle = nearBottom ? 's' : 'n';
    } else if (element.classList.contains('ResizableXorYAxis')) {
        if (nearLeft && nearTop) state.handle = 'nw';
        else if (nearLeft && nearBottom) state.handle = 'sw';
        else if (nearRight && nearTop) state.handle = 'ne';
        else if (nearRight && nearBottom) state.handle = 'se';
        else if (nearLeft) state.handle = 'w';
        else if (nearRight) state.handle = 'e';
        else if (nearTop) state.handle = 'n';
        else if (nearBottom) state.handle = 's';
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
    // Calculate final position
    const currentLeft = parseInt(nestingElement.style.left || 0);
    const currentTop = parseInt(nestingElement.style.top || 0);
    const finalX = currentLeft + mouse.deltaX;
    const finalY = currentTop + mouse.deltaY;
    
    // Find element at the center of the component's final position
    const componentRect = nestingElement.getBoundingClientRect();
    const centerX = componentRect.left + componentRect.width / 2 + mouse.deltaX;
    const centerY = componentRect.top + componentRect.height / 2 + mouse.deltaY;
    
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
        performNesting(nestingElement, targetElement, finalX, finalY);
    } else {
        // No valid nesting target, fallback to regular move
        console.log('No valid nesting target, performing regular move');
        nestingElement.dispatchEvent(new CustomEvent('dragMove', {detail: mouse}));
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