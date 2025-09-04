(function() {
    // Base User Component Move Behavior.js - Reactive move handling with live updates
    
    const components = document.querySelectorAll('.base-user-component');
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
        component.addEventListener('cleanupMoveVisuals', () => {
            cleanupMoveVisuals(component);
        });
    });

    function updateLiveMove(element, liveMouse) {
        // Get the offset from mouse to component ONLY on first frame of drag
        if (!element.dataset.dragOffset && liveMouse.isDragging) {
            const rect = element.getBoundingClientRect();
            element.dataset.dragOffset = JSON.stringify({
                x: liveMouse.x - rect.left,
                y: liveMouse.y - rect.top
            });
            console.log('Drag offset set for:', element.id);
        }
        
        // Calculate component position based on current mouse and original offset
        if (element.dataset.dragOffset) {
            const dragOffset = JSON.parse(element.dataset.dragOffset);
            
            // Calculate desired component position: nowMouseX - dragOffsetX
            const desiredLeft = liveMouse.x - dragOffset.x;
            const desiredTop = liveMouse.y - dragOffset.y;
            
            // Apply snapping to the component position
            let finalLeft = desiredLeft;
            let finalTop = desiredTop;
            
            if (typeof window.applySnapping === 'function') {
                const snapped = window.applySnapping(desiredLeft, desiredTop);
                finalLeft = snapped.x;
                finalTop = snapped.y;
            }
            
            element.style.left = finalLeft + 'px';
            element.style.top = finalTop + 'px';
        }
        
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    }

    function cleanupMoveVisuals(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        
        // Clear drag offset when move completes
        delete element.dataset.dragOffset;
        
        // Preserve selection visuals after move cleanup
        if (element.classList.contains('selected')) {
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        }
        
        console.log('Move visuals cleaned up for:', element.id);
    }
})();
