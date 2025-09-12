// Third Party Sign In Factory
// Creates and manages third party authentication components (Google, Apple, Azure, Facebook)
// Extends Base User Component functionality: move, resize, snap (NO nesting)
// Uses official provider APIs for professional branding

window.ThirdPartySignInFactory = {
    
    /**
     * Configuration for the unified sign-in component
     * All provider settings are now handled within the UnifiedSignInComponent
     */
    UNIFIED_CONFIG: {
        // Default providers to enable
        defaultProviders: ['apple', 'google', 'microsoft', 'facebook'],
        
        // Default button styling
        defaultButtonSize: '48px',
        defaultButtonGap: '8px',
        
        // Component sizing
        defaultPadding: 16
    },
    
    /**
     * Create a new third party sign in component instance
     * @param {string} provider - Use 'unified' for the new unified component, individual providers are deprecated
     * @param {Object} options - Component options (position, size, config overrides)
     * @returns {HTMLElement} Created component element
     */
    createInstance: function(provider, options = {}) {
        // Handle unified component creation (recommended)
        if (provider === 'unified') {
            return this.createUnifiedInstance(options);
        }
        
        // Handle legacy individual providers (deprecated but supported for backward compatibility)
        if (['apple', 'google', 'azure', 'facebook', 'microsoft'].includes(provider)) {
            console.warn(`Individual provider '${provider}' is deprecated. Converting to unified component with single provider.`);
            return this.createUnifiedInstance({
                ...options,
                enabledProviders: [provider === 'azure' ? 'microsoft' : provider] // Normalize azure to microsoft
            });
        }
        
        throw new Error(`Unsupported provider: ${provider}. Use 'unified' for the new unified sign-in component.`);
    },
    
    /**
     * Create a unified sign-in component with multiple providers
     * @param {Object} options - Component options including enabledProviders array
     * @returns {HTMLElement} Created unified component element
     */
    createUnifiedInstance: function(options = {}) {
        const componentId = `signin-unified_${Date.now()}`;
        
        // Create the unified component element
        const component = document.createElement('div');
        component.className = 'base-user-component signin-component signin-unified draggable ResizableXorYAxis snapping';
        component.setAttribute('data-component', 'signin-unified');
        component.setAttribute('data-provider', 'unified');
        component.id = componentId;
        
        // Set sizing for horizontal gallery layout
        const enabledProviders = options.enabledProviders || ['apple', 'google', 'microsoft', 'facebook'];
        const buttonSize = parseInt(options.buttonSize || '48');
        const buttonGap = parseInt(options.buttonGap || '8');
        const padding = 16;
        
        // Calculate width based on number of enabled providers
        const calculatedWidth = (enabledProviders.length * buttonSize) + ((enabledProviders.length - 1) * buttonGap) + padding;
        const calculatedHeight = buttonSize + padding;
        
        component.style.position = 'absolute';
        component.style.left = options.left || '220px';
        component.style.top = options.top || '10px';
        component.style.minWidth = `${calculatedWidth}px`;
        component.style.minHeight = `${calculatedHeight}px`;
        component.style.width = options.width || `${calculatedWidth}px`;
        component.style.height = options.height || `${calculatedHeight}px`;
        
        // Add component styles
        this.ensureStylesLoaded();
        
        // Append to specified container or main canvas
        const container = options.container || document.getElementById('mainCanvas');
        if (container) {
            container.appendChild(component);
        }
        
        // Load Base User Component behaviors
        this.loadComponentBehaviors(componentId, 'unified');
        
        // Initialize unified component
        this.initializeUnifiedProvider(component, options);
        
        console.log(`Unified Sign In component created with providers: ${enabledProviders.join(', ')} (${componentId})`);
        return component;
    },
    
    /**
     * Initialize provider-specific authentication with official branding
     */
    initializeProvider: function(component, provider, options) {
        // Only handle unified provider now
        if (provider === 'unified') {
            this.initializeUnifiedProvider(component, options);
        } else {
            console.warn(`Individual provider ${provider} is deprecated. Use 'unified' provider instead.`);
            // Fallback for backward compatibility - convert to unified
            this.initializeUnifiedProvider(component, {
                ...options,
                enabledProviders: [provider]
            });
        }
    },

    /**
     * Initialize Unified Sign In component
     */
    initializeUnifiedProvider: function(component, options) {
        console.log('Initializing Unified Sign In component...');
        this.loadUnifiedComponent(component.id, options);
    },

    /**
     * Load Unified Sign In component
     */
    loadUnifiedComponent: function(componentId, options) {
        if (typeof window.UnifiedSignInComponent !== 'undefined') {
            const unifiedComponent = new window.UnifiedSignInComponent(componentId, options);
            unifiedComponent.initialize();
        } else {
            const cacheBuster = `?v=${Date.now()}`;
            fetch(`../Components/User Level/Components/Login Component/3rd Party Sign In/UnifiedSignIn.js${cacheBuster}`)
                .then(response => response.text())
                .then(script => {
                    eval(script);
                    const unifiedComponent = new window.UnifiedSignInComponent(componentId, options);
                    unifiedComponent.initialize();
                    console.log('Unified Sign In component loaded and initialized');
                })
                .catch(error => console.error('Error loading Unified Sign In component:', error));
        }
    },
    
    /**
     * Load Base User Component behaviors (excluding nesting)
     */
    loadComponentBehaviors: function(componentId, provider) {
        const behaviors = [
            'Base User Component Snapping Modifier.js',
            'Base User Component Selection Behavior.js',
            'Base User Component Move Behavior.js',
            'Base User Component Resize Behavior.js'
            // ❌ Excluded: Base User Component Nesting Behavior.js
            // Sign-in components should not accept children
        ];
        
        const basePath = '../Components/User Level/Components/Base User Component/';
        
        behaviors.forEach(behavior => {
            const cacheBuster = `?v=${Date.now()}`;
            fetch(`${basePath}${behavior}${cacheBuster}`)
                .then(response => response.text())
                .then(script => {
                    // Modify script to target specific component instance
                    let modifiedScript = script.replace(
                        /const components = document\.querySelectorAll\('\.base-user-component'\);/g,
                        `const components = [document.getElementById('${componentId}')];`
                    );
                    
                    modifiedScript = modifiedScript.replace(
                        /const component = document\.querySelector\('\.base-user-component'\);/g,
                        `const component = document.getElementById('${componentId}');`
                    );
                    
                    eval(modifiedScript);
                    console.log(`${behavior} loaded for ${provider} sign-in:`, componentId);
                })
                .catch(error => console.error(`Error loading ${behavior}:`, error));
        });
    },
    
    /**
     * Ensure component styles are loaded
     */
    ensureStylesLoaded: function() {
        if (!document.querySelector('style[data-component="signin-component"]')) {
            const style = document.createElement('style');
            style.setAttribute('data-component', 'signin-component');
            style.textContent = `
                .signin-component {
                    min-width: 200px;
                    min-height: 40px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    overflow: hidden;
                    transition: box-shadow 0.2s ease;
                }
                
                .signin-component:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                
                .signin-component.selected {
                    border-color: #007ACC;
                    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
                }
                
                /* Provider-specific styling */
                .signin-apple {
                    background: #fff;
                }
                
                .signin-google {
                    background: #fff;
                }
                
                .signin-azure {
                    background: #fff;
                }
                
                .signin-facebook {
                    background: #fff;
                }
                
                /* Apple button container styling */
                .apple-signin-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                /* Ensure Apple's web component fits properly */
                apple-signin-button {
                    --apple-sign-in-button-height: 40px;
                    --apple-sign-in-button-border-radius: 6px;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    /**
     * Get all active sign-in components
     */
    getActiveComponents: function() {
        return document.querySelectorAll('.signin-component');
    },
    
    /**
     * Get component by provider type
     */
    getComponentByProvider: function(provider) {
        return document.querySelector(`.signin-${provider}`);
    },
    
    /**
     * Check if user is signed in with any provider
     */
    isUserSignedIn: function() {
        if (window.handlerData && window.handlerData['shared handler data']) {
            const auth = window.handlerData['shared handler data'][0].authentication;
            return auth && auth.currentUser && auth.activeProvider;
        }
        return false;
    },
    
    /**
     * Get current user information
     */
    getCurrentUser: function() {
        if (window.handlerData && window.handlerData['shared handler data']) {
            const auth = window.handlerData['shared handler data'][0].authentication;
            return auth ? auth.currentUser : null;
        }
        return null;
    },
    
    /**
     * Sign out from all providers
     */
    signOutAll: function() {
        const components = this.getActiveComponents();
        components.forEach(component => {
            component.dispatchEvent(new CustomEvent('requestSignOut'));
        });
    }
};

// Auto-register factory when this script loads
console.log('Third Party Sign In Factory loaded and ready');