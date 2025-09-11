(function() {
    // Base User Component Move Behavior.js - Reactive move handling with live updates
    
    const components = document.querySelectorAll('.base-user-component:not(.gallery-child)');
    if (!components.length) {
        console.log('No components found for move behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.moveInitialized) return;
        component.dataset.moveInitialized = 'true';

        console.log('Move behavior attached to:', component.id);

        // Live move updates during drag
        component.addEventListener('liveMove', (e) => {
            const liveMouse = e.detail;
            updateLiveMove(component, liveMouse);
        });

        // Visual cleanup
        component.addEventListener('resetOperationState', () => {
            cleanup(component);
        });
    });

    function updateLiveMove(element, liveMouse) {
        // Skip gallery children - they have their own move behavior
        if (element.classList.contains('gallery-child')) {
            return;
        }
        
        // The drag offset should already be set by startMoveOperation
        // If not set, something went wrong - don't calculate it here
        if (!element.dataset.dragOffset) {
            console.warn('Drag offset not set for move operation:', element.id);
            return;
        }
        
        // Calculate component position using centralized utility
        const position = window.OperationsUtility.calculateDragPosition(liveMouse, element);
        if (position) {
            window.OperationsUtility.updateElementPosition(element, position, true);
        }
        
        // Apply visual feedback for move operation
        window.OperationsUtility.applyOperationVisuals(element, 'move');
    }

    function cleanup(element) {
        // Skip gallery children - they have their own cleanup behavior
        if (element.classList.contains('gallery-child')) {
            return;
        }
        
        // Clear operation visuals and drag offsets using centralized utility
        window.OperationsUtility.clearOperationVisuals(element, true);
        window.OperationsUtility.clearDragOffsets(element);
        
        console.log('Move visuals cleaned up for:', element.id);
    }
})();
