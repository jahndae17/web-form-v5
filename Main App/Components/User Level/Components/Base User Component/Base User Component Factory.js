// Base User Component Factory
window.BaseUserComponentFactory = {
    // Create a new instance of the component
    createInstance: function(options = {}) {
        const componentId = `base-user-component_${Date.now()}`;
        
        // Create the component element
        const component = document.createElement('div');
        component.className = 'base-user-component draggable ResizableXorYAxis isNestable acceptsChildren snapping';
        component.setAttribute('data-component', 'base-user-component');
        component.id = componentId;
        
        // Set default position or use provided options
        component.style.left = options.left || '220px';
        component.style.top = options.top || '10px';
        
        // Add styles to document if not already present
        this.ensureStylesLoaded();
        
        // Append to specified container or main canvas
        const container = options.container || document.getElementById('mainCanvas');
        if (container) {
            container.appendChild(component);
        }
        
        // Load and execute behavior scripts for this specific instance
        this.loadComponentBehaviors(componentId);
        
        console.log('Base User Component instance created:', componentId);
        return component;
    },
    
    // Ensure component styles are loaded in the document
    ensureStylesLoaded: function() {
        if (!document.querySelector('style[data-component="base-user-component"]')) {
            const style = document.createElement('style');
            style.setAttribute('data-component', 'base-user-component');
            style.textContent = `
                .base-user-component {
                    width: 300px; height: 100px; background: #f0f0f0; border: 1px solid #ccc;
                    position: absolute; cursor: pointer; border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Load behavior scripts for a specific component instance
    loadComponentBehaviors: function(componentId) {
        const behaviors = [
            'Base User Component Snapping Modifier.js',
            'Base User Component Selection Behavior.js',
            'Base User Component Move Behavior.js',
            'Base User Component Nesting Behavior.js',
            'Base User Component Resize Behavior.js',
            'Base User Component Right Click Menu.js'
        ];
        
        const basePath = '../Components/User Level/Components/Base User Component/';
        
        behaviors.forEach(behavior => {
            // Add cache-busting parameter to ensure fresh file loading
            const cacheBuster = `?v=${Date.now()}`;
            fetch(`${basePath}${behavior}${cacheBuster}`)
                .then(response => response.text())
                .then(script => {
                    // Modify script to target specific component instance
                    let modifiedScript = script.replace(
                        /const components = document\.querySelectorAll\('\.base-user-component'\);/g,
                        `const components = [document.getElementById('${componentId}')];`
                    );
                    
                    // Also handle single component selectors
                    modifiedScript = modifiedScript.replace(
                        /const component = document\.querySelector\('\.base-user-component'\);/g,
                        `const component = document.getElementById('${componentId}');`
                    );
                    
                    // Execute the modified script
                    eval(modifiedScript);
                    console.log(`${behavior} loaded for:`, componentId);
                })
                .catch(error => console.error(`Error loading ${behavior}:`, error));
        });
    },
    
    // Load global utilities that all components need
    loadGlobalUtilities: function() {
        const basePath = '../Components/User Level/Components/Base User Component/';
        const cacheBuster = `?v=${Date.now()}`;
        
        fetch(`${basePath}Base User Component Operations Utility.js${cacheBuster}`)
            .then(response => response.text())
            .then(script => {
                eval(script);
                console.log('Operations Utility loaded globally');
            })
            .catch(error => console.error('Error loading Operations Utility:', error));
    }
};

// Load global utilities first, then register factory
window.BaseUserComponentFactory.loadGlobalUtilities();
console.log('Base User Component Factory loaded and ready');
