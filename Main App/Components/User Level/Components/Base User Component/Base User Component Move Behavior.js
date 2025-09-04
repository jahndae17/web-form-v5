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
        // Use frame delta for smooth incremental movement
        const currentLeft = parseInt(element.style.left || 0);
        const currentTop = parseInt(element.style.top || 0);
        
        const newLeft = currentLeft + liveMouse.deltaX;
        const newTop = currentTop + liveMouse.deltaY;
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
    }

    function cleanupMoveVisuals(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        
        // Preserve selection visuals after move cleanup
        if (element.classList.contains('selected')) {
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        }
        
        console.log('Move visuals cleaned up for:', element.id);
    }
})();
