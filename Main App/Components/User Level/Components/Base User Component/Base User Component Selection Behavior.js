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

        // NEW: Event listeners for operation start events from Events Handler
        component.addEventListener('startResizeOperation', (e) => {
            const {mouse, edges} = e.detail;
            startResize(component, edges);
        });

        component.addEventListener('startMoveOperation', (e) => {
            const mouse = e.detail;
            console.log('startMoveOperation received for:', component.id, 'classes:', component.className);
            startMove(component, mouse);
        });

        component.addEventListener('startNestingOperation', (e) => {
            const mouse = e.detail;
            startNesting(component, mouse);
        });
    });

    function handleComponentSelection(element, mouse) {
        // Get inputs from handler data directly since it's not passed in detail anymore
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs) return;

        // Only allow selection on actual mouse down, not hover or drag
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
        }
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

    function startMove(element, mouse) {
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs?.['selectedElementList']?.[element.id]) {
            console.log('Move blocked: Element not selected');
            return;
        }

        // Calculate and store the initial drag offset when the move operation starts
        window.OperationsUtility.storeDragOffsets(element, mouse);
        console.log('Drag offsets stored for:', element.id, 'dragOffset:', element.dataset.dragOffset, 'parentOffset:', element.dataset.parentOffset);

        if (window.EventsHandler) {
            window.EventsHandler.start('move', element); // ✅ Updated API call
        }
    }

    function startNesting(element, mouse) {
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        if (!inputs?.['selectedElementList']?.[element.id]) {
            console.log('Nesting blocked: Element not selected');
            return;
        }
        
        if (!element.classList.contains('isNestable')) {
            console.log('Nesting blocked: Element not nestable');
            return;
        }

        // Calculate and store the initial drag offset when the nesting operation starts
        window.OperationsUtility.storeDragOffsets(element, mouse);

        if (window.EventsHandler) {
            window.EventsHandler.start('nesting', element); // ✅ Updated API call
        }
    }

    function clearAllSelections() {
        const allComponents = document.querySelectorAll('.base-user-component, .gallery-child');
        allComponents.forEach(comp => {
            comp.style.border = '';
            comp.style.backgroundColor = '';
            comp.style.boxShadow = '';
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
