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

        // NEW: Updated event listener to match simplified Events Handler
        component.addEventListener('handleComponentSelect', (e) => {
            const mouse = e.detail; // Simplified - mouse object directly
            handleComponentSelection(component, mouse);
        });
    });

    function handleComponentSelection(element, mouse) {
        // Get inputs from handler data directly since it's not passed in detail anymore
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs) return;

        // Get current state from Events Handler
        const state = window.EventsHandler?.getState?.() || {};

        // Only allow selection on actual mouse down, not hover
        if (!inputs['selectedElementList']?.[element.id] && 
            !mouse.isDragging &&  // ✅ Must not be dragging (simplified from mouseJustPressed)
            Math.abs(mouse.totalDeltaX) + Math.abs(mouse.totalDeltaY) < 16) {
            
            clearAllSelections();
            
            // Initialize selectedElementList if it doesn't exist
            if (!inputs['selectedElementList']) {
                inputs['selectedElementList'] = {};
            }
            
            inputs['selectedElementList'][element.id] = element;
            
            // Apply selection visual
            element.style.border = '2px solid #007ACC';
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
            element.classList.add('selected');
            
            console.log('Component selected:', element.id);
            return;
        }

        // Only allow operations on selected elements during drag
        if (!inputs['selectedElementList']?.[element.id]) return;

        // Handle drag operations for selected components
        if (mouse.isDragging && !state.operation) {
            // Edge detection helper for resize handles
            const edges = getEdgeInfo(element, mouse);

            // Handle resize handles
            element.dispatchEvent(new CustomEvent(edges.isNearEdge ? 'showResizeHandles' : 'hideResizeHandles'));
            
            // Start appropriate operation
            if (edges.isNearEdge) {
                startResize(element, edges);
            } else if (element.classList.contains('isNestable') && !state.operation) {
                startNesting(element);
            } else if (!state.operation) {
                startMove(element);
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

    // Start operation functions
    function startResize(element, edges) {
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs?.['selectedElementList']?.[element.id]) {
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
            window.EventsHandler.start('resize', element, handle); // ✅ Updated API call
        }
    }

    function startMove(element) {
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs?.['selectedElementList']?.[element.id]) {
            console.log('Move blocked: Element not selected');
            return;
        }

        if (window.EventsHandler) {
            window.EventsHandler.start('move', element); // ✅ Updated API call
        }
    }

    function startNesting(element) {
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs?.['selectedElementList']?.[element.id]) {
            console.log('Nesting blocked: Element not selected');
            return;
        }
        
        if (!element.classList.contains('isNestable')) {
            console.log('Nesting blocked: Element not nestable');
            return;
        }

        if (window.EventsHandler) {
            window.EventsHandler.start('nesting', element); // ✅ Updated API call
        }
    }

    function clearAllSelections() {
        const allComponents = document.querySelectorAll('.base-user-component');
        allComponents.forEach(comp => {
            comp.style.border = '';
            comp.style.backgroundColor = '';
            comp.classList.remove('selected');
        });
        
        // Clear from inputs
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (inputs) {
            inputs['selectedElementList'] = {};
        }
    }

    // Global helper for other behaviors to access
    window.clearAllSelections = clearAllSelections;

    // Add global canvas click handler for deselection
    document.addEventListener('handleDeselect', (e) => {
        handleCanvasDeselection(e.detail);
    });

    // Add global mouse off handler for removing resize handles  
    document.addEventListener('handleElementLeave', (e) => {
        handleMouseOff(e.detail);
    });

    function handleCanvasDeselection(mouse) {
        // Use the more specific isDraggingForDeselect property for deselection logic
        if (!mouse.isDraggingForDeselect) {
            clearAllSelections();
        }
    }

    function handleMouseOff(mouse) {
        const state = window.EventsHandler?.getState?.() || {};
        
        // Remove resize handles when mouse moves off components (but not during operations)
        if (!state.operation) {
            const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
            if (inputs?.['selectedElementList']) {
                for (const key in inputs['selectedElementList']) {
                    const selectedElement = inputs['selectedElementList'][key];
                    if (selectedElement?.classList?.contains('base-user-component')) {
                        selectedElement.dispatchEvent(new CustomEvent('hideResizeHandles'));
                    }
                }
            }
        }
    }
})();
