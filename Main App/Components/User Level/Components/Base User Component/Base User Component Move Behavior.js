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
        
        // Calculate component position based on current mouse and original offset
        if (element.dataset.dragOffset && element.dataset.parentOffset) {
            const dragOffset = JSON.parse(element.dataset.dragOffset);
            const parentOffset = JSON.parse(element.dataset.parentOffset);
            
            // Calculate desired component position in absolute coordinates
            const absoluteLeft = liveMouse.x - dragOffset.x;
            const absoluteTop = liveMouse.y - dragOffset.y;
            
            // Convert to relative coordinates by subtracting parent offset
            const desiredLeft = absoluteLeft - parentOffset.x;
            const desiredTop = absoluteTop - parentOffset.y;
            
            // Apply snapping to the component position
            let finalLeft = desiredLeft;
            let finalTop = desiredTop;
            
            if (typeof window.applySnapping === 'function') {
                const snapped = window.applySnapping(desiredLeft, desiredTop, false);
                finalLeft = snapped.x;
                finalTop = snapped.y;
            }
            
            element.style.left = finalLeft + 'px';
            element.style.top = finalTop + 'px';
        }
        
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    }

    function cleanup(element) {
        // Skip gallery children - they have their own cleanup behavior
        if (element.classList.contains('gallery-child')) {
            return;
        }
        
        element.style.transform = '';
        element.style.boxShadow = '';
        
        // Clear drag offset when move completes
        delete element.dataset.dragOffset;
        delete element.dataset.parentOffset;
        
        // Preserve selection visuals after move cleanup
        if (element.classList.contains('selected')) {
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        }
        
        console.log('Move visuals cleaned up for:', element.id);
    }
})();
