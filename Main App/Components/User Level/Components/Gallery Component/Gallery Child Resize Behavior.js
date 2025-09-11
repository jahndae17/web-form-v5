// Gallery Child Resize Behavior
// Custom resize behavior for gallery children (ResizableY only)

(function() {
    const galleryChildren = document.querySelectorAll('.gallery-child:not([data-resize-behavior-initialized])');
    if (!galleryChildren.length) return;

    galleryChildren.forEach(child => {
        if (child.dataset.resizeBehaviorInitialized) return;
        child.dataset.resizeBehaviorInitialized = 'true';
        
        console.log('Gallery child resize behavior attached to:', child.id);
        
        let addHandlesTimeout = null;
        let removeHandlesTimeout = null;
        
        // NEW: Handle gallery-specific resize initiation from Events Handler
        child.addEventListener('startGalleryResize', (e) => {
            const {mouse, handle} = e.detail;
            
            // Only allow vertical resize for gallery children
            if (handle.dataset.handle === 'n' || handle.dataset.handle === 's') {
                console.log('Starting gallery child resize operation:', child.id, handle.dataset.handle);
                window.EventsHandler.start('resize', child, handle.dataset.handle);
            }
        });
        
        // Handle live resize updates
        child.addEventListener('liveResize', (e) => {
            const {mouse, handle} = e.detail;
            performChildResize(child, mouse, handle);
        });
        
        // Handle resize completion
        child.addEventListener('completeResize', (e) => {
            console.log('Gallery child resize completed:', child.id);
            const gallery = child.closest('.gallery-component');
            if (gallery && window.GalleryComponentFactory) {
                window.GalleryComponentFactory.updateGalleryHeight(gallery);
            }
        });
        
        child.addEventListener('showResizeHandles', () => {
            if (removeHandlesTimeout) {
                clearTimeout(removeHandlesTimeout);
                removeHandlesTimeout = null;
            }
            if (!addHandlesTimeout) {
                addHandlesTimeout = setTimeout(() => {
                    addChildResizeHandles(child);
                    addHandlesTimeout = null;
                }, 10);
            }
        });
        
        child.addEventListener('hideResizeHandles', () => {
            if (addHandlesTimeout) {
                clearTimeout(addHandlesTimeout);
                addHandlesTimeout = null;
            }
            if (!removeHandlesTimeout) {
                removeHandlesTimeout = setTimeout(() => {
                    removeChildResizeHandles(child);
                    removeHandlesTimeout = null;
                }, 10);
            }
        });
    });

    function performChildResize(child, mouse, handle) {
        const rect = child.getBoundingClientRect();
        let newHeight = parseInt(child.style.height) || rect.height;
        
        if (handle === 's') {
            // South handle - increase height with mouse movement down
            newHeight += mouse.deltaY;
        } else if (handle === 'n') {
            // North handle - increase height with mouse movement up, adjust position
            const oldHeight = newHeight;
            newHeight -= mouse.deltaY;
            
            // Adjust position to keep the bottom edge in place
            const currentTop = parseInt(child.style.top) || 0;
            child.style.top = (currentTop + (oldHeight - newHeight)) + 'px';
        }
        
        // Apply minimum height constraint
        newHeight = Math.max(newHeight, 20);
        child.style.height = newHeight + 'px';
        
        console.log(`Gallery child resized to height: ${newHeight}px`);
    }

    function addChildResizeHandles(child) {
        const existingHandles = child.querySelectorAll('.resize-handle');
        if (existingHandles.length > 0) return;
        
        // Only vertical resize handles for gallery children (ResizableY)
        ['n', 's'].forEach(handle => {
            const div = document.createElement('div');
            div.className = `resize-handle ${handle}`;
            div.style.cssText = `position:absolute;opacity:0;cursor:ns-resize;pointer-events:auto;height:10px;width:100%;left:0;`;
            div.style.cssText += handle === 'n' ? 'top:-5px;' : 'bottom:-5px;';
            div.dataset.handle = handle;
            child.appendChild(div);
        });
        
        console.log('Gallery child resize handles (n, s) added to:', child.id);
    }

    function removeChildResizeHandles(child) {
        const handles = child.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
        if (handles.length > 0) {
            console.log('Gallery child resize handles removed from:', child.id);
        }
    }
})();