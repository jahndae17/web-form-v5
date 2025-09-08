// Gallery Component Nesting Behavior
// Simple conversion of components dropped into galleries to gallery children

(function() {
    const galleries = document.querySelectorAll('.gallery-component');
    if (!galleries.length) return;

    galleries.forEach(gallery => {
        if (gallery.dataset.galleryNestingInitialized) return;
        gallery.dataset.galleryNestingInitialized = 'true';

        // Listen for components being nested into this gallery
        gallery.addEventListener('completeNesting', (e) => {
            const {completionMouse} = e.detail;
            convertToGalleryChild(gallery, completionMouse);
        });
    });

    function convertToGalleryChild(gallery, mouse) {
        // Find the dragged component
        const draggedComponent = document.querySelector('.base-user-component[style*="scale(1.02)"]');
        if (!draggedComponent || draggedComponent.classList.contains('gallery-child')) return;

        // Check if dropped into gallery
        const galleryRect = gallery.getBoundingClientRect();
        const isInGallery = mouse.x >= galleryRect.left && mouse.x <= galleryRect.right && 
                           mouse.y >= galleryRect.top && mouse.y <= galleryRect.bottom;
        
        if (!isInGallery) return;

        // Convert to gallery child (similar to createChildItem)
        draggedComponent.classList.add('gallery-child');
        draggedComponent.classList.remove('ResizableXorYAxis');
        draggedComponent.classList.add('ResizableY');
        draggedComponent.setAttribute('data-component', 'gallery-child');

        // Set child dimensions - width controlled by gallery, height resizable
        const galleryWidth = parseInt(gallery.style.width) || 300;
        draggedComponent.style.width = (galleryWidth - 20) + 'px'; // 10px padding on each side
        draggedComponent.style.position = 'relative';
        draggedComponent.style.marginBottom = '8px'; // Gap between children

        // Move to gallery
        gallery.appendChild(draggedComponent);

        // Update gallery height
        if (window.GalleryComponentFactory) {
            window.GalleryComponentFactory.updateGalleryHeight(gallery);
            window.GalleryComponentFactory.updateChildWidths(gallery);
        }

        console.log('Component converted to gallery child:', draggedComponent.id);
    }
})();