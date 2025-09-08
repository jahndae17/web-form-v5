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
        
        child.addEventListener('addResizeHandles', () => {
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
        
        child.addEventListener('removeResizeHandles', () => {
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
        
        child.addEventListener('completeResize', () => {
            const gallery = child.closest('.gallery-component');
            if (gallery && window.GalleryComponentFactory) {
                window.GalleryComponentFactory.updateGalleryHeight(gallery);
            }
        });
    });

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