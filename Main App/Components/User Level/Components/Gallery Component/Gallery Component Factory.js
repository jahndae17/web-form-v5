// Gallery Component Factory
// Extends the Base User Component with gallery-specific functionality
// The gallery itself :
//      Uses base user movement behavior
//      Uses base user selection behavior
//      Uses base user nesting behavior
//      Uses ResizableX instead of ResizableXorYAxis
//      Height is controlled by the cumulative height of the children (including gaps)

// Children of the gallery component :
//      Use Gallery Movement Behavior
//      Use base user selection behavior
//      Use base user nesting behavior
//      Use ResizableY instead of ResizableXorYAxis
//      The width is controlled by the gallery (their parent)
//      There is an 8 px gap between each child element

window.GalleryComponentFactory = {
    // Create a new gallery instance
    createInstance: function(options = {}) {
        const galleryId = `gallery-component_${Date.now()}`;
        
        // Create the gallery container element
        const gallery = document.createElement('div');
        gallery.className = 'base-user-component gallery-component draggable ResizableX isNestable acceptsChildren snapping';
        gallery.setAttribute('data-component', 'gallery-component');
        gallery.id = galleryId;
        
        // Set default position or use provided options
        gallery.style.left = options.left || '220px';
        gallery.style.top = options.top || '10px';
        gallery.style.width = options.width || '300px';
        gallery.style.height = options.height || '120px'; // Initial height, will be updated based on children
        
        // Append to specified container or main canvas
        const container = options.container || document.getElementById('mainCanvas');
        if (container) {
            container.appendChild(gallery);
        }
        
        // Load base behaviors for the gallery itself
        this.loadGalleryBehaviors(galleryId);
        
        // Add listener for child management
        this.setupChildManagement(gallery);
        
        console.log('Gallery Component instance created:', galleryId);
        return gallery;
    },
    
    // Create a gallery child item
    // NOTE: Children are typically added via nesting behavior, not this method
    // TODO: Extend nesting behavior to automatically add "childOfGallery" class 
    //       when components are nested into gallery containers
    createChildItem: function(gallery, options = {}) {
        const childId = `gallery-child_${Date.now()}`;
        
        // Create the child element
        const child = document.createElement('div');
        child.className = 'base-user-component gallery-child draggable ResizableY isNestable snapping';
        child.setAttribute('data-component', 'gallery-child');
        child.id = childId;
        
        // Set child dimensions - width controlled by gallery, height resizable
        const galleryWidth = parseInt(gallery.style.width) || 300;
        child.style.width = (galleryWidth - 20) + 'px'; // 10px padding on each side
        child.style.height = options.height || '80px';
        child.style.position = 'relative';
        child.style.marginBottom = '8px'; // Gap between children
        
        // Add to gallery
        gallery.appendChild(child);
        
        // Load behaviors for the child
        this.loadChildBehaviors(childId);
        
        // Update gallery height
        this.updateGalleryHeight(gallery);
        
        console.log('Gallery child created:', childId);
        return child;
    },
    
    // Load behaviors for the gallery container
    // TODO: This is not inheritance - we're duplicating behavior loading logic
    // Should refactor to call BaseUserComponentFactory.loadComponentBehaviors() instead
    loadGalleryBehaviors: function(galleryId) {
        const behaviors = [
            'Base User Component Snapping Modifier.js',
            'Base User Component Selection Behavior.js',
            'Base User Component Move Behavior.js',
            'Gallery Component Nesting Behavior.js',
            'Gallery Component Resize Behavior.js'
        ];
        
        const basePath = '../Components/User Level/Components/Base User Component/';
        
        behaviors.forEach(behavior => {
            const cacheBuster = `?v=${Date.now()}`;
            // Use different path for Gallery Component behaviors
            const behaviorPath = behavior.startsWith('Gallery Component') 
                ? `../Components/User Level/Components/Gallery Component/${behavior}${cacheBuster}`
                : `${basePath}${behavior}${cacheBuster}`;
            
            fetch(behaviorPath)
                .then(response => response.text())
                .then(script => {
                    let modifiedScript = script.replace(
                        /const components = document\.querySelectorAll\('\.base-user-component'\);/g,
                        `const components = [document.getElementById('${galleryId}')];`
                    );
                    
                    modifiedScript = modifiedScript.replace(
                        /const component = document\.querySelector\('\.base-user-component'\);/g,
                        `const component = document.getElementById('${galleryId}');`
                    );
                    
                    eval(modifiedScript);
                    console.log(`${behavior} loaded for gallery:`, galleryId);
                })
                .catch(error => console.error(`Error loading ${behavior}:`, error));
        });
    },
    
    // Load behaviors for gallery children
    // TODO: This is not inheritance - we're duplicating behavior loading logic
    // Should refactor to call BaseUserComponentFactory.loadComponentBehaviors() instead
    loadChildBehaviors: function(childId) {
        const behaviors = [
            'Base User Component Snapping Modifier.js',
            'Base User Component Selection Behavior.js',
            'Gallery Component Move Behavior.js',
            'Base User Component Nesting Behavior.js',
            'Gallery Child Resize Behavior.js'
        ];
        
        const basePath = '../Components/User Level/Components/Base User Component/';
        
        behaviors.forEach(behavior => {
            const cacheBuster = `?v=${Date.now()}`;
            let behaviorPath;
            
            if (behavior.startsWith('Gallery Component') || behavior.startsWith('Gallery Child')) {
                // Gallery-specific behaviors are in the Gallery Component folder
                behaviorPath = `../Components/User Level/Components/Gallery Component/${behavior}${cacheBuster}`;
            } else {
                // Base behaviors are in the Base User Component folder
                behaviorPath = `${basePath}${behavior}${cacheBuster}`;
            }
            
            fetch(behaviorPath)
                .then(response => response.text())
                .then(script => {
                    let modifiedScript = script.replace(
                        /const components = document\.querySelectorAll\('\.base-user-component'\);/g,
                        `const components = [document.getElementById('${childId}')];`
                    );
                    
                    modifiedScript = modifiedScript.replace(
                        /const component = document\.querySelector\('\.base-user-component'\);/g,
                        `const component = document.getElementById('${childId}');`
                    );
                    
                    eval(modifiedScript);
                    console.log(`${behavior} loaded for child:`, childId);
                })
                .catch(error => console.error(`Error loading ${behavior}:`, error));
        });
    },
    
    // Setup child management for the gallery
    setupChildManagement: function(gallery) {
        // Listen for child additions
        gallery.addEventListener('childComponentAdded', (e) => {
            this.updateGalleryHeight(gallery);
            this.updateChildWidths(gallery);
        });
        
        // Listen for gallery resize to update child widths
        gallery.addEventListener('completeResize', (e) => {
            this.updateChildWidths(gallery);
        });
    },
    
    // Update gallery height based on children
    updateGalleryHeight: function(gallery) {
        const children = gallery.querySelectorAll('.gallery-child');
        let totalHeight = 20; // 10px padding top + bottom
        
        children.forEach(child => {
            console.log('Total height:', totalHeight);
            totalHeight += parseInt(child.style.height) || parseInt(window.getComputedStyle(child).height);
            totalHeight += 8; // Gap between children
        });
        
        // Remove the last gap
        if (children.length > 0) {
            totalHeight -= 8;
        }
        
        gallery.style.height = totalHeight + 'px';
        console.log(`Gallery height updated to: ${totalHeight}px`);
    },
    
    // Update child width and positions when gallery is resized
    updateChildWidths: function(gallery) {
        const children = gallery.querySelectorAll('.gallery-child');
        const galleryWidth = parseInt(gallery.style.width) || 300;
        const galleryHeight = parseInt(gallery.style.height) || 120;
        const childWidth = galleryWidth - 20; // 10px padding on each side
        
        let currentY = 10; // Start with 10px padding from top
        
        children.forEach((child, index) => {
            child.style.width = childWidth + 'px';
            // Reset x position to maintain proper alignment within gallery
            child.style.left = '10px'; // 10px padding from gallery left edge
            // Set y position to stack children vertically with gaps
            child.style.top = currentY + 'px';
            
            // Update currentY for next child (height + gap)
            const childHeight = parseInt(child.style.height) || 80;
            currentY += childHeight + 8; // 8px gap between children
        });
        
        console.log(`Child widths updated to: ${childWidth}px and positions reset with vertical stacking`);
    }
};

// Auto-register factory when this script loads
console.log('Gallery Component Factory loaded and ready');