// Events Handler.js - Handles event delegation and control flow
let isResizing = false;
let handle = '';
let resizeFunctionsLoaded = false;
let resizeElement, addResizeHandles, removeResizeHandles;
let resizingElement = null; // Track which element is being resized
let lastResizeTime = 0; // Track when resize ended to block deselect
let lastMoveTime = 0; // Track when move ended to block deselect
let isMoving = false;
let movingElement = null;

// Load resize functions once at startup
fetch('../Components/User Level/Components/Base User Component/Base User Component Resize Behavior.js')
    .then(response => response.text())
    .then(script => {
        eval(script);
        resizeFunctionsLoaded = true;        
        // Explicitly assign the functions to the global variables
        window.resizeElement = resizeElement;
        window.addResizeHandles = addResizeHandles;
        window.removeResizeHandles = removeResizeHandles;
        resizeFunctionsLoaded = true;
        console.log('Resize functions loaded');
    })
    .catch(error => console.error('Error loading resize behavior:', error));

// Control flow to choose whether a select, resize, move, or no operation is being performed based on Main App\Components\Developer Level\Registers\Handler Data.json (updated by other handlers)
setInterval(() => {
    if (window.handlerData && resizeFunctionsLoaded) {
        const context = window.handlerData['shared handler data'][0]['context'];
        const inputs = window.handlerData['shared handler data'][0]['inputs'];
        const deltaX = context['on last mouse up'].x - context['on last mouse down'].x;
        const deltaY = context['on last mouse up'].y - context['on last mouse down'].y;
        const timeDiff = Date.now() - context['on last mouse up'].time;
        
        // Check if user is currently dragging
        const isDragging = context['on last mouse down'].time > context['on last mouse up'].time;
        
        // Handle ongoing resize operation (even if not hovering over element)
        if (isResizing && !isDragging && timeDiff < 200) { // Just stopped dragging
            console.log('Resize operation completed on mouseup');
            window.resizeElement(resizingElement, handle, deltaX, deltaY);
            isResizing = false;
            resizingElement = null;
            handle = '';
            lastResizeTime = Date.now(); // Record when resize ended
            console.log('Resize operation ended');
        }
        
        // Handle ongoing move operation (only if not resizing)
        if (isMoving && !isDragging && timeDiff < 200 && !isResizing) { // Just stopped dragging and not resizing
            console.log('Move operation completed on mouseup');
            movingElement.dispatchEvent(new CustomEvent('dragMove', {
                detail: { deltaX: context['on last mouse up'].x - context['on last mouse down'].x, deltaY: context['on last mouse up'].y - context['on last mouse down'].y }
            }));
            isMoving = false;
            movingElement = null;
            lastMoveTime = Date.now(); // Record when move ended
            console.log('Move operation ended');
        }
        
        // Check if we should block deselect due to recent resize
        const timeSinceResize = Date.now() - lastResizeTime;
        const shouldBlockDeselect = timeSinceResize < 100 || Date.now() - lastMoveTime < 100; // Block for 100ms after resize

        if (context['now'].element && context['now'].element.classList.contains('base-user-component') && !inputs['selectedElementList'][context['now'].element.id]) {  // Ensure it's unselected
            if (Math.abs(deltaX) + Math.abs(deltaY) < 16 && timeDiff < 99) {  // Add time check
            console.log("Select operation");
            // Update selectedElementList
            // Deselect previous
            for (const key in inputs['selectedElementList']) {
                const prevElement = inputs['selectedElementList'][key];
                if (prevElement !== context['now'].element) {
                prevElement.dispatchEvent(new CustomEvent('componentDeselected'));
                }
            }
            inputs['selectedElementList'] = {}; // Clear previous
            inputs['selectedElementList'][context['now'].element.id] = context['now'].element;
            context['now'].element.dispatchEvent(new CustomEvent('componentSelected'));
            }
        } else if (context['now'].element && context['now'].element.id === 'mainCanvas' && timeDiff < 99 && !shouldBlockDeselect) {
            // Deselect all currently selected objects (only if not blocking due to recent resize)
            for (const key in inputs['selectedElementList']) {
            const selectedElement = inputs['selectedElementList'][key];
            selectedElement.dispatchEvent(new CustomEvent('componentDeselected'));
            }
            inputs['selectedElementList'] = {};
        } else if (!context['now'].element || (!context['now'].element.classList.contains('base-user-component') && !context['now'].element.classList.contains('resize-handle'))) {
            // Remove resize handles from all components when mouse is not over any component or handle
            if (!isResizing) { // Only remove handles if not currently resizing
                for (const key in inputs['selectedElementList']) {
                    const selectedElement = inputs['selectedElementList'][key];
                    if (selectedElement.classList.contains('base-user-component')) {
                        window.removeResizeHandles(selectedElement);
                    }
                }
            }
        } else if (context['now'].element && context['now'].element.classList.contains('resize-handle')) {
            // Mouse is over a resize handle - treat as if it's over the parent component
            const parentComponent = context['now'].element.closest('.base-user-component');
            if (parentComponent) {
                const rect = parentComponent.getBoundingClientRect();
                const mouseX = context['now'].x;
                const mouseY = context['now'].y;
                const nearLeft = mouseX < rect.left + 20;
                const nearRight = mouseX > rect.right - 20;
                const nearTop = mouseY < rect.top + 20;
                const nearBottom = mouseY > rect.bottom - 20;
                const isHovering = nearLeft || nearRight || nearTop || nearBottom;

                // Keep handles since we're over them
                const isNearEdge = nearLeft || nearRight || nearTop || nearBottom;
                
                // Start resize operation if dragging and near edge
                if (isDragging && isNearEdge && !isResizing) {
                    resizingElement = parentComponent;
                    if (parentComponent.classList.contains('ResizableXAxis') && (nearRight || nearLeft)) {
                        handle = nearRight ? 'e' : 'w';
                        isResizing = true;
                    } else if (parentComponent.classList.contains('ResizableYAxis') && (nearTop || nearBottom)) {
                        handle = nearBottom ? 's' : 'n';
                        isResizing = true;
                    } else if (parentComponent.classList.contains('ResizableXorYAxis')) {
                        isResizing = true;
                        if (nearLeft && nearTop) handle = 'nw';
                        else if (nearLeft && nearBottom) handle = 'sw';
                        else if (nearRight && nearTop) handle = 'ne';
                        else if (nearRight && nearBottom) handle = 'se';
                        else if (nearLeft) handle = 'w';
                        else if (nearRight) handle = 'e';
                        else if (nearTop) handle = 'n';
                        else if (nearBottom) handle = 's';
                        console.log('Resize started with handle:', handle);
                    }
                }
            }
            // Start move operation for resize handles if dragging but NOT starting resize (move is lower priority)
            else if (isDragging && !isResizing && !isMoving) {
                movingElement = parentComponent;
                isMoving = true;
                console.log('Move operation started from handle');
            }
        } else if (context['now'].element && context['now'].element.classList.contains('base-user-component')) {
            const rect = context['now'].element.getBoundingClientRect();
            const mouseX = context['now'].x;
            const mouseY = context['now'].y;
            const nearLeft = mouseX < rect.left + 20;
            const nearRight = mouseX > rect.right - 20;
            const nearTop = mouseY < rect.top + 20;
            const nearBottom = mouseY > rect.bottom - 20;
            const isHovering = nearLeft || nearRight || nearTop || nearBottom;

            if (isHovering) {
                window.addResizeHandles(context['now'].element);
            } else {
                window.removeResizeHandles(context['now'].element);
            }
            
            const isNearEdge = nearLeft || nearRight || nearTop || nearBottom;
            
            // Start resize operation if dragging and near edge (resize has priority)
            if (isDragging && isNearEdge && !isResizing) {
                resizingElement = context['now'].element;
                if (context['now'].element.classList.contains('ResizableXAxis') && (nearRight || nearLeft)) {
                    handle = nearRight ? 'e' : 'w';
                    isResizing = true;
                    console.log('Resize started with handle:', handle);
                } else if (context['now'].element.classList.contains('ResizableYAxis') && (nearTop || nearBottom)) {
                    handle = nearBottom ? 's' : 'n';
                    isResizing = true;
                    console.log('Resize started with handle:', handle);
                } else if (context['now'].element.classList.contains('ResizableXorYAxis')) {
                    isResizing = true;
                    if (nearLeft && nearTop) handle = 'nw';
                    else if (nearLeft && nearBottom) handle = 'sw';
                    else if (nearRight && nearTop) handle = 'ne';
                    else if (nearRight && nearBottom) handle = 'se';
                    else if (nearLeft) handle = 'w';
                    else if (nearRight) handle = 'e';
                    else if (nearTop) handle = 'n';
                    else if (nearBottom) handle = 's';
                    console.log('Resize started with handle:', handle);
                }
            }
            // Start move operation if dragging but NOT near edge and NOT resizing (move is lower priority)
            else if (isDragging && !isNearEdge && !isResizing && !isMoving) {
                movingElement = context['now'].element;
                isMoving = true;
                console.log('Move operation started');
            }
        }
    }
}, 100); // Check every 100ms