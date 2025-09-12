// Apple Sign In Component
// Implements Sign in with Apple using official Apple JS SDK
// Professional branding through Apple's official web components
// Integrates with Base User Component system (move, resize, snap - NO nesting)

(function() {
    'use strict';
    
    /**
     * Apple Sign In Component Implementation
     * Uses Apple's official Sign in with Apple JS SDK for authentic branding
     * https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js
     */
    class AppleSignInComponent {
        constructor(componentId, config = {}) {
            this.componentId = componentId;
            this.component = document.getElementById(componentId);
            this.config = {
                clientId: config.clientId || 'your.apple.service.id',
                scope: config.scope || 'name email',
                redirectURI: config.redirectURI || window.location.origin + '/auth/apple/callback',
                state: config.state || this.generateState(),
                nonce: config.nonce || this.generateNonce(),
                usePopup: config.usePopup !== false, // Default to popup
                
                // Apple's official button styling options
                color: config.color || 'black',           // 'black' | 'white'
                border: config.border !== false,          // Default to true
                type: config.type || 'sign-in',           // 'sign-in' | 'continue'
                borderRadius: config.borderRadius || 6,   // Apple's design guidelines
                width: config.width || 200,
                height: config.height || 40,
                locale: config.locale || 'en_US'
            };
            
            this.userProfile = null;
            this.authToken = null;
            this.isInitialized = false;
            
            console.log('Apple Sign In component created:', componentId);
        }
        
        /**
         * Initialize Apple Sign In with official SDK
         */
        async initialize() {
            try {
                // Load Apple's official SDK if not already loaded
                await this.loadAppleSDK();
                
                // Initialize Apple ID authentication
                await AppleID.auth.init({
                    clientId: this.config.clientId,
                    scope: this.config.scope,
                    redirectURI: this.config.redirectURI,
                    state: this.config.state,
                    nonce: this.config.nonce,
                    usePopup: this.config.usePopup
                });
                
                // Render Apple's official button with authentic branding
                this.renderOfficialAppleButton();
                
                // Attach authentication event listeners
                this.attachEventListeners();
                
                // Integration with Events Handler
                this.setupEventsHandlerIntegration();
                
                this.isInitialized = true;
                console.log('Apple Sign In initialized successfully:', this.componentId);
                
                // Notify component is ready
                this.component.dispatchEvent(new CustomEvent('appleSignInReady', {
                    detail: { componentId: this.componentId }
                }));
                
            } catch (error) {
                console.error('Apple Sign In initialization failed:', error);
                this.handleError('INITIALIZATION_FAILED', error);
            }
        }
        
        /**
         * Load Apple's official Sign in with Apple JS SDK
         */
        loadAppleSDK() {
            return new Promise((resolve, reject) => {
                // Check if Apple SDK is already loaded
                if (typeof AppleID !== 'undefined') {
                    resolve();
                    return;
                }
                
                console.log('Loading Apple Sign In SDK...');
                
                const script = document.createElement('script');
                script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
                script.async = true;
                script.onload = () => {
                    console.log('Apple SDK loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load Apple SDK:', error);
                    reject(new Error('Apple SDK loading failed'));
                };
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * Render Apple's official button with authentic branding
         * Uses Apple's web component for professional appearance
         */
        renderOfficialAppleButton() {
            // Clear any existing content
            this.component.innerHTML = '';
            
            // Create container for Apple's official button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'apple-signin-container';
            buttonContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 200px;
                min-height: 40px;
            `;
            
            // Create Apple's logo-only button instead of official component
            const appleButton = document.createElement('button');
            appleButton.id = `apple-signin-button-${this.componentId}`;
            appleButton.className = 'apple-signin-button-custom';
            
            appleButton.style.cssText = `
                width: 100%;
                height: 100%;
                background: #000000;
                color: #ffffff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                outline: none;
                min-width: 48px;
                min-height: 48px;
            `;
            
            // Add Apple logo only
            appleButton.innerHTML = `
                <svg width="20" height="24" viewBox="0 0 24 29" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
            `;
            
            // Add hover effects
            appleButton.addEventListener('mouseenter', () => {
                appleButton.style.backgroundColor = '#333333';
            });
            
            appleButton.addEventListener('mouseleave', () => {
                appleButton.style.backgroundColor = '#000000';
            });
            
            buttonContainer.appendChild(appleButton);
            this.component.appendChild(buttonContainer);
            
            // Attach click handler to custom Apple button
            appleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateSignIn();
            });
            
            console.log('Apple official button rendered:', this.componentId);
        }
        
        /**
         * Initiate Apple Sign In flow
         */
        async initiateSignIn() {
            try {
                console.log('Initiating Apple Sign In...');
                
                // Dispatch sign-in initiated event
                this.component.dispatchEvent(new CustomEvent('signInInitiated', {
                    detail: { 
                        provider: 'apple',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Update button state to loading
                this.setButtonState('loading');
                
                // Use Apple's official authorization method
                const response = await AppleID.auth.signIn();
                
                console.log('Apple Sign In response received:', response);
                
                // Process the authorization response
                await this.handleAuthorizationResponse(response);
                
            } catch (error) {
                console.error('Apple Sign In failed:', error);
                this.handleError('SIGN_IN_FAILED', error);
            }
        }
        
        /**
         * Handle Apple's authorization response
         */
        async handleAuthorizationResponse(response) {
            try {
                // Extract authorization data
                const { authorization, user } = response;
                
                if (!authorization || !authorization.code) {
                    throw new Error('Invalid authorization response from Apple');
                }
                
                // Store auth token
                this.authToken = {
                    code: authorization.code,
                    id_token: authorization.id_token,
                    state: authorization.state
                };
                
                // Process user profile if provided (only on first sign-in)
                if (user) {
                    this.userProfile = {
                        id: user.email, // Apple doesn't provide stable user ID in frontend
                        provider: 'apple',
                        email: user.email,
                        name: user.name ? `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim() : null,
                        firstName: user.name?.firstName,
                        lastName: user.name?.lastName,
                        picture: null, // Apple doesn't provide profile pictures
                        verified: true, // Apple emails are always verified
                        locale: this.config.locale,
                        lastLogin: new Date().toISOString()
                    };
                } else {
                    // For returning users, we only get the authorization code
                    this.userProfile = {
                        id: 'apple_user', // Placeholder - real ID would come from server
                        provider: 'apple',
                        email: null, // Would be retrieved from server using auth code
                        name: null,
                        verified: true,
                        lastLogin: new Date().toISOString()
                    };
                }
                
                // Update button state to success
                this.setButtonState('success');
                
                // Store authentication data
                this.storeAuthenticationData();
                
                // Dispatch successful sign-in event
                this.component.dispatchEvent(new CustomEvent('signInCompleted', {
                    detail: {
                        provider: 'apple',
                        componentId: this.componentId,
                        userInfo: this.userProfile,
                        tokens: {
                            authorizationCode: this.authToken.code,
                            identityToken: this.authToken.id_token,
                            state: this.authToken.state
                        },
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Apple Sign In completed successfully:', this.userProfile);
                
            } catch (error) {
                console.error('Error processing Apple authorization:', error);
                this.handleError('AUTHORIZATION_PROCESSING_FAILED', error);
            }
        }
        
        /**
         * Set button visual state
         */
        setButtonState(state) {
            const button = this.component.querySelector('.apple-signin-button-custom');
            if (!button) return;
            
            const container = this.component.querySelector('.apple-signin-container');
            
            switch (state) {
                case 'loading':
                    container.style.opacity = '0.7';
                    container.style.pointerEvents = 'none';
                    // Could add loading spinner overlay
                    break;
                    
                case 'success':
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    // Could show checkmark briefly
                    setTimeout(() => {
                        this.setButtonState('idle');
                    }, 2000);
                    break;
                    
                case 'error':
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    // Could show error styling briefly
                    setTimeout(() => {
                        this.setButtonState('idle');
                    }, 3000);
                    break;
                    
                case 'idle':
                default:
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    break;
            }
        }
        
        /**
         * Store authentication data in app state
         */
        storeAuthenticationData() {
            // Integration with existing handler data structure
            if (window.handlerData && window.handlerData['shared handler data']) {
                const sharedData = window.handlerData['shared handler data'][0];
                
                // Initialize authentication section if it doesn't exist
                if (!sharedData.authentication) {
                    sharedData.authentication = {
                        currentUser: null,
                        activeProvider: null,
                        sessionToken: null,
                        lastSignInTime: null
                    };
                }
                
                // Update authentication state
                sharedData.authentication.currentUser = this.userProfile;
                sharedData.authentication.activeProvider = 'apple';
                sharedData.authentication.sessionToken = this.authToken;
                sharedData.authentication.lastSignInTime = new Date().toISOString();
                
                console.log('Authentication data stored in app state');
            }
            
            // Also store in sessionStorage for persistence
            try {
                sessionStorage.setItem('apple_auth_token', JSON.stringify(this.authToken));
                sessionStorage.setItem('apple_user_profile', JSON.stringify(this.userProfile));
            } catch (error) {
                console.warn('Could not store auth data in sessionStorage:', error);
            }
        }
        
        /**
         * Sign out the user
         */
        async signOut() {
            try {
                console.log('Signing out Apple user...');
                
                // Clear stored authentication data
                this.userProfile = null;
                this.authToken = null;
                
                // Clear from app state
                if (window.handlerData && window.handlerData['shared handler data']) {
                    const auth = window.handlerData['shared handler data'][0].authentication;
                    if (auth && auth.activeProvider === 'apple') {
                        auth.currentUser = null;
                        auth.activeProvider = null;
                        auth.sessionToken = null;
                        auth.lastSignInTime = null;
                    }
                }
                
                // Clear sessionStorage
                try {
                    sessionStorage.removeItem('apple_auth_token');
                    sessionStorage.removeItem('apple_user_profile');
                } catch (error) {
                    console.warn('Could not clear sessionStorage:', error);
                }
                
                // Reset button state
                this.setButtonState('idle');
                
                // Dispatch sign-out event
                this.component.dispatchEvent(new CustomEvent('signOutCompleted', {
                    detail: {
                        provider: 'apple',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Apple sign out completed');
                
            } catch (error) {
                console.error('Apple sign out error:', error);
                this.handleError('SIGN_OUT_FAILED', error);
            }
        }
        
        /**
         * Attach event listeners for component interaction
         */
        attachEventListeners() {
            // Listen for manual sign-out requests
            this.component.addEventListener('requestSignOut', () => {
                this.signOut();
            });
            
            // Listen for configuration updates
            this.component.addEventListener('updateConfig', (e) => {
                this.config = { ...this.config, ...e.detail };
                this.renderOfficialAppleButton();
            });
        }
        
        /**
         * Setup integration with Events Handler system
         */
        setupEventsHandlerIntegration() {
            // Register with Events Handler if available
            if (window.EventsHandler) {
                // Apple Sign In components don't need operation state management
                // They handle their own authentication state
                console.log('Apple Sign In integrated with Events Handler');
            }
            
            // Component selection behavior integration
            this.component.addEventListener('handleComponentSelect', (e) => {
                console.log('Apple Sign In component selected:', this.componentId);
                // Don't interfere with authentication flow when selected
            });
        }
        
        /**
         * Handle errors in Apple Sign In flow
         */
        handleError(errorType, error) {
            console.error(`Apple Sign In Error [${errorType}]:`, error);
            
            // Set button to error state
            this.setButtonState('error');
            
            // Determine error details
            let errorMessage = 'Apple Sign In failed';
            let errorCode = errorType;
            
            if (error.error) {
                switch (error.error) {
                    case 'popup_closed_by_user':
                        errorMessage = 'Sign in was cancelled';
                        errorCode = 'USER_CANCELLED';
                        break;
                    case 'popup_blocked':
                        errorMessage = 'Popup was blocked by browser';
                        errorCode = 'POPUP_BLOCKED';
                        break;
                    case 'invalid_client':
                        errorMessage = 'Invalid Apple client configuration';
                        errorCode = 'INVALID_CLIENT';
                        break;
                    default:
                        errorMessage = error.error_description || error.error;
                        errorCode = error.error.toUpperCase();
                }
            }
            
            // Dispatch error event
            this.component.dispatchEvent(new CustomEvent('signInError', {
                detail: {
                    provider: 'apple',
                    componentId: this.componentId,
                    error: errorMessage,
                    errorCode: errorCode,
                    originalError: error,
                    timestamp: Date.now()
                }
            }));
        }
        
        /**
         * Generate secure random state parameter
         */
        generateState() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        
        /**
         * Generate secure random nonce parameter
         */
        generateNonce() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        
        /**
         * Check if user is currently signed in
         */
        isSignedIn() {
            return this.userProfile !== null && this.authToken !== null;
        }
        
        /**
         * Get current user profile
         */
        getUserProfile() {
            return this.userProfile;
        }
        
        /**
         * Get current auth token
         */
        getAuthToken() {
            return this.authToken;
        }
    }
    
    // Export AppleSignInComponent for use by factory
    window.AppleSignInComponent = AppleSignInComponent;
    
    console.log('Apple Sign In component class loaded');
    
})();
