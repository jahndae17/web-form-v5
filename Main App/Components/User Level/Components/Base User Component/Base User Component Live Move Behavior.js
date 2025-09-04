(function() {
    // Base User Component Live Move Behavior.js - Reactive live move handling
    
    const components = document.querySelectorAll('.base-user-component');
    if (!components.length) {
        console.log('No components found for live move behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.liveMoveInitialized) return;
        component.dataset.liveMoveInitialized = 'true';

        console.log('Live move behavior attached to:', component.id);

        // Live move updates during drag
        component.addEventListener('liveMove', (e) => {
            const liveMouse = e.detail;
            updateLiveMove(component, liveMouse);
        });

        // Move completion
        component.addEventListener('dragMoveComplete', (e) => {
            const completionMouse = e.detail;
            console.log('Move completed for:', component.id);
            // Movement already applied live, just log completion
        });

        // Visual cleanup
        component.addEventListener('cleanupMoveVisuals', () => {
            cleanupMoveVisuals(component);
        });
    });

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

    function cleanupMoveVisuals(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        console.log('Move visuals cleaned up for:', element.id);
    }
})();
