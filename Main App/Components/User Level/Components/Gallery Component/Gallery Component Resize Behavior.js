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
        
        // Handle resize initiation from Events Handler
        gallery.addEventListener('startResizeOperation', (e) => {
            const {mouse, edges} = e.detail;
            
            // Determine which handle should be active based on edges
            let activeHandle = null;
            if (edges.nearRight) activeHandle = 'e';
            else if (edges.nearLeft) activeHandle = 'w';
            
            // Only allow horizontal resize for galleries
            if (activeHandle) {
                console.log('Starting gallery resize operation:', gallery.id, activeHandle);
                window.EventsHandler.start('resize', gallery, activeHandle);
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
        
        gallery.addEventListener('showResizeHandles', () => {
            if (removeHandlesTimeout) {
                clearTimeout(removeHandlesTimeout);
                removeHandlesTimeout = null;
            }
            
            // Check if handles already exist before trying to add them
            const existingHandles = gallery.querySelectorAll('.resize-handle');
            if (existingHandles.length > 0) {
                return; // Handles already exist, no need to add
            }
            
            if (!addHandlesTimeout) {
                addHandlesTimeout = setTimeout(() => {
                    addGalleryResizeHandles(gallery);
                    addHandlesTimeout = null;
                }, 10);
            }
        });
        
        gallery.addEventListener('hideResizeHandles', () => {
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
        // Double-check that handles don't already exist
        const existingHandles = gallery.querySelectorAll('.resize-handle');
        if (existingHandles.length > 0) {
            console.log('Resize handles already exist for:', gallery.id);
            return;
        }
        
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