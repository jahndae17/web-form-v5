// Gallery Component Resize Behavior
// Custom resize behavior for gallery components (ResizableX only)
// Prevents conflicts with base user component resize behavior

(function() {
    const galleries = document.querySelectorAll('.gallery-component:not([data-resize-behavior-initialized])');
    if (!galleries.length) return;

    galleries.forEach(gallery => {
        if (gallery.dataset.resizeBehaviorInitialized) return;
        gallery.dataset.resizeBehaviorInitialized = 'true';
        
        console.log('Gallery resize behavior attached to:', gallery.id);
        
        let addHandlesTimeout = null;
        let removeHandlesTimeout = null;
        
        // NEW: Handle resize initiation from Events Handler
        gallery.addEventListener('handleResize', (e) => {
            const {mouse, handle} = e.detail;
            
            // Only allow horizontal resize for galleries
            if (handle.dataset.handle === 'e' || handle.dataset.handle === 'w') {
                console.log('Starting gallery resize operation:', gallery.id, handle.dataset.handle);
                window.EventsHandler.start('resize', gallery, handle.dataset.handle);
            }
        });
        
        // Handle live resize updates
        gallery.addEventListener('liveResize', (e) => {
            const {mouse, handle} = e.detail;
            performGalleryResize(gallery, mouse, handle);
        });
        
        // Handle resize completion
        gallery.addEventListener('completeResize', (e) => {
            console.log('Gallery resize completed:', gallery.id);
            if (window.GalleryComponentFactory) {
                window.GalleryComponentFactory.updateChildWidths(gallery);
            }
        });
        
        gallery.addEventListener('addResizeHandles', () => {
            if (removeHandlesTimeout) {
                clearTimeout(removeHandlesTimeout);
                removeHandlesTimeout = null;
            }
            if (!addHandlesTimeout) {
                addHandlesTimeout = setTimeout(() => {
                    addGalleryResizeHandles(gallery);
                    addHandlesTimeout = null;
                }, 10);
            }
        });
        
        gallery.addEventListener('removeResizeHandles', () => {
            if (addHandlesTimeout) {
                clearTimeout(addHandlesTimeout);
                addHandlesTimeout = null;
            }
            if (!removeHandlesTimeout) {
                removeHandlesTimeout = setTimeout(() => {
                    removeGalleryResizeHandles(gallery);
                    removeHandlesTimeout = null;
                }, 10);
            }
        });
    });

    function performGalleryResize(gallery, mouse, handle) {
        const rect = gallery.getBoundingClientRect();
        let newWidth = parseInt(gallery.style.width) || rect.width;
        
        if (handle === 'e') {
            // East handle - increase width with mouse movement to the right
            newWidth += mouse.deltaX;
        } else if (handle === 'w') {
            // West handle - increase width with mouse movement to the left, adjust position
            const oldWidth = newWidth;
            newWidth -= mouse.deltaX;
            
            // Adjust position to keep the right edge in place
            const currentLeft = parseInt(gallery.style.left) || 0;
            gallery.style.left = (currentLeft + (oldWidth - newWidth)) + 'px';
        }
        
        // Apply minimum width constraint
        newWidth = Math.max(newWidth, 100);
        gallery.style.width = newWidth + 'px';
        
        console.log(`Gallery resized to width: ${newWidth}px`);
    }

    function addGalleryResizeHandles(gallery) {
        const existingHandles = gallery.querySelectorAll('.resize-handle');
        if (existingHandles.length > 0) return;
        
        ['e', 'w'].forEach(handle => {
            const div = document.createElement('div');
            div.className = `resize-handle ${handle}`;
            div.style.cssText = `position:absolute;opacity:0;cursor:ew-resize;pointer-events:auto;width:10px;height:100%;top:0;`;
            div.style.cssText += handle === 'e' ? 'right:-5px;' : 'left:-5px;';
            div.dataset.handle = handle;
            gallery.appendChild(div);
        });
        
        console.log('Gallery resize handles (e, w) added to:', gallery.id);
    }

    function removeGalleryResizeHandles(gallery) {
        const handles = gallery.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
        if (handles.length > 0) {
            console.log('Gallery resize handles removed from:', gallery.id);
        }
    }
})();