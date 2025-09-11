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
        gallery.addEventListener('galleryChildAdded', (e) => {
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

        // IMPORTANT: Clear any transform or drag-related styling
        component.style.transform = '';
        component.style.zIndex = '';
        component.style.visibility = 'visible';
        
        // Set child dimensions - width controlled by gallery, height resizable
        const galleryWidth = parseInt(gallery.style.width) || 300;
        component.style.width = (galleryWidth - 20) + 'px'; // 10px padding on each side
        component.style.position = 'absolute'; // Use absolute positioning within gallery
        component.style.marginBottom = '0px'; // No margin needed with absolute positioning
        
        // CRITICAL: Reset positioning immediately to prevent visual glitches
        component.style.left = '10px'; // Reset left position for gallery layout
        component.style.top = '10px'; // Temporary position, will be recalculated
        
        console.log('Component positioning reset for gallery layout:', component.id);

        // Load gallery child behaviors
        if (window.GalleryComponentFactory) {
            window.GalleryComponentFactory.loadChildBehaviors(component.id);
            
            // Update gallery layout - use immediate execution to prevent timing issues
            window.GalleryComponentFactory.updateChildWidths(gallery);
            window.GalleryComponentFactory.updateGalleryHeight(gallery);
            
            // Force a second update after a brief delay to ensure proper positioning
            setTimeout(() => {
                window.GalleryComponentFactory.updateChildWidths(gallery);
                window.GalleryComponentFactory.updateGalleryHeight(gallery);
                console.log('Gallery layout updated for:', component.id);
            }, 50);
        }

        console.log('Component converted to gallery child:', component.id);
    }
})();