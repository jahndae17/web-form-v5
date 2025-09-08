// Gallery Component Nesting Behavior
// Simple conversion of components dropped into galleries to gallery children

(function() {
    const galleries = document.querySelectorAll('.gallery-component');
    if (!galleries.length) return;

    galleries.forEach(gallery => {
        if (gallery.dataset.galleryNestingInitialized) return;
        gallery.dataset.galleryNestingInitialized = 'true';

        console.log('Gallery nesting behavior attached to:', gallery.id);

        // Listen for components being nested into this gallery
        gallery.addEventListener('childComponentAdded', (e) => {
            const child = e.detail.child;
            convertToGalleryChild(gallery, child);
        });
    });

    function convertToGalleryChild(gallery, component) {
        // Skip if already a gallery child
        if (!component || component.classList.contains('gallery-child')) {
            console.log('Component already a gallery child or null:', component?.id);
            return;
        }

        console.log('Converting component to gallery child:', component.id);

        // Convert to gallery child
        component.classList.add('gallery-child');
        component.classList.remove('ResizableXorYAxis');
        component.classList.add('ResizableY');
        component.setAttribute('data-component', 'gallery-child');

        // Set child dimensions - width controlled by gallery, height resizable
        const galleryWidth = parseInt(gallery.style.width) || 300;
        component.style.width = (galleryWidth - 20) + 'px'; // 10px padding on each side
        component.style.position = 'relative';
        component.style.marginBottom = '8px'; // Gap between children
        component.style.left = '10px'; // Reset left position for gallery layout
        component.style.top = '0px'; // Will be recalculated by updateChildWidths

        // Load gallery child behaviors
        if (window.GalleryComponentFactory) {
            window.GalleryComponentFactory.loadChildBehaviors(component.id);
            
            // Update gallery layout
            setTimeout(() => {
                window.GalleryComponentFactory.updateGalleryHeight(gallery);
                window.GalleryComponentFactory.updateChildWidths(gallery);
            }, 100);
        }

        console.log('Component converted to gallery child:', component.id);
    }
})();