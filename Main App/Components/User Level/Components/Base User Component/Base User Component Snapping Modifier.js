(function() {
    'use strict';
    
    // Snapping grid size in pixels
    const SNAP_GRID = 20;
    
    // Create snap guidelines
    function showSnapGuideline(x, y, isVertical) {
        const guideline = document.createElement('div');
        guideline.className = 'snap-guideline';
        guideline.style.position = 'absolute';
        guideline.style.backgroundColor = 'red';
        guideline.style.pointerEvents = 'none';
        guideline.style.zIndex = '10000';
        
        if (isVertical) {
            guideline.style.left = x + 'px';
            guideline.style.top = '0';
            guideline.style.width = '1px';
            guideline.style.height = '100vh';
        } else {
            guideline.style.left = '0';
            guideline.style.top = y + 'px';
            guideline.style.width = '100vw';
            guideline.style.height = '1px';
        }
        
        document.body.appendChild(guideline);
        
        // Remove after 200ms
        setTimeout(() => {
            if (guideline.parentNode) {
                guideline.parentNode.removeChild(guideline);
            }
        }, 200);
    }
    
    // Apply snapping to position
    window.applySnapping = function(x, y, showGuidelines = true) {
        const snappedX = Math.round(x / SNAP_GRID) * SNAP_GRID;
        const snappedY = Math.round(y / SNAP_GRID) * SNAP_GRID;
        
        if (showGuidelines && (snappedX !== x || snappedY !== y)) {
            if (snappedX !== x) showSnapGuideline(snappedX, 0, true);
            if (snappedY !== y) showSnapGuideline(0, snappedY, false);
        }
        
        return { x: snappedX, y: snappedY };
    };
})();