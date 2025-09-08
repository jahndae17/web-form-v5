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
        
        gallery.addEventListener('completeResize', () => {
            if (window.GalleryComponentFactory) {
                window.GalleryComponentFactory.updateChildWidths(gallery);
            }
        });
    });

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