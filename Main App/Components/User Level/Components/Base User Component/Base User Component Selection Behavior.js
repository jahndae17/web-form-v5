(function() {
    // Base User Component Selection Behavior.js - Enhanced reactive component interaction
    
    const components = document.querySelectorAll('.base-user-component');
    if (!components.length) {
        console.log('No components found for selection behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.selectionInitialized) return;
        component.dataset.selectionInitialized = 'true';

        console.log('Selection behavior attached to:', component.id);

        // Component interaction handling
        component.addEventListener('handleComponentInteraction', (e) => {
            const {liveMouse, inputs, state} = e.detail;
            handleComponentSelection(component, liveMouse, inputs, state);
        });
    });

    function handleComponentSelection(element, liveMouse, inputs, state) {
        // Only allow selection on actual mouse down, not hover
        if (!inputs['selectedElementList'][element.id] && 
            liveMouse.mouseJustPressed &&  // ✅ Must be recent mouse down
            Math.abs(liveMouse.totalDeltaX) + Math.abs(liveMouse.totalDeltaY) < 16 && 
            liveMouse.timeDiff < 99) {
            
            console.log("Select operation - triggered by mouse down");
            clearAllSelections();
            inputs['selectedElementList'][element.id] = element;
            
            // Apply selection visual
            element.style.border = '2px solid #007ACC';
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
            element.classList.add('selected');
            
            // Update Events Handler state via API
            if (window.EventsHandler) {
                window.EventsHandler.updateSelectedComponent(element);
            }
            
            element.dispatchEvent(new CustomEvent('componentSelected'));
            console.log('Component selected:', element.id);
            return;
        }

        // Only allow operations on selected elements during drag
        if (!inputs['selectedElementList'][element.id]) return;

        // Handle drag operations for selected components
        if (liveMouse.isDragging && !state.isResizing && !state.isNesting) {
            // Edge detection helper for resize handles
            const edges = getEdgeInfo(element, liveMouse);
            
            // Handle resize handles
            element.dispatchEvent(new CustomEvent(edges.isNearEdge ? 'addResizeHandles' : 'removeResizeHandles'));
            
            // Start appropriate operation
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
    function getEdgeInfo(element, liveMouse) {
        const rect = element.getBoundingClientRect();
        const threshold = 10;
        
        const nearLeft = liveMouse.x < rect.left + threshold;
        const nearRight = liveMouse.x > rect.right - threshold;
        const nearTop = liveMouse.y < rect.top + threshold;
        const nearBottom = liveMouse.y > rect.bottom - threshold;
        
        return {
            nearLeft, nearRight, nearTop, nearBottom,
            isNearEdge: nearLeft || nearRight || nearTop || nearBottom
        };
    }

    // Start operation functions
    function startResize(element, edges, inputs) {
        if (!inputs['selectedElementList'][element.id]) {
            console.log('Resize blocked: Element not selected');
            return;
        }

        // Simplified handle determination
        const {nearLeft, nearRight, nearTop, nearBottom} = edges;
        let handle = null;
        
        if (element.classList.contains('ResizableXorYAxis')) {
            handle = (nearLeft && nearTop) ? 'nw' :
                     (nearLeft && nearBottom) ? 'sw' :
                     (nearRight && nearTop) ? 'ne' :
                     (nearRight && nearBottom) ? 'se' :
                     nearLeft ? 'w' : nearRight ? 'e' :
                     nearTop ? 'n' : nearBottom ? 's' : null;
        } else if (element.classList.contains('ResizableXAxis')) {
            handle = nearRight ? 'e' : nearLeft ? 'w' : null;
        } else if (element.classList.contains('ResizableYAxis')) {
            handle = nearBottom ? 's' : nearTop ? 'n' : null;
        }
        
        if (handle && window.EventsHandler) {
            window.EventsHandler.startResize(element, handle);
        }
    }

    function startMove(element, inputs) {
        if (!inputs['selectedElementList'][element.id]) {
            console.log('Move blocked: Element not selected');
            return;
        }

        if (window.EventsHandler) {
            window.EventsHandler.startMove(element);
        }
    }

    function startNesting(element, inputs) {
        if (!inputs['selectedElementList'][element.id]) {
            console.log('Nesting blocked: Element not selected');
            return;
        }
        
        if (!element.classList.contains('isNestable')) {
            console.log('Nesting blocked: Element not nestable');
            return;
        }

        if (window.EventsHandler) {
            window.EventsHandler.startNesting(element);
        }
    }

    function clearAllSelections() {
        const allComponents = document.querySelectorAll('.base-user-component');
        allComponents.forEach(comp => {
            comp.style.border = '';
            comp.style.backgroundColor = '';
            comp.classList.remove('selected');
        });
    }

    // Global helper for other behaviors to access
    window.clearAllSelections = clearAllSelections;
})();
