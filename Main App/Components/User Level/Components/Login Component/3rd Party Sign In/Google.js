// Google Sign In Component
// Implements Google Identity Services using official Google SDK
// Professional branding through Google's official button API
// Integrates with Base User Component system (move, resize, snap - NO nesting)

(function() {
    'use strict';
    
    /**
     * Google Sign In Component Implementation
     * Uses Google Identity Services (GSI) for authentic branding
     * https://developers.google.com/identity/gsi/web/guides/display-button
     */
    class GoogleSignInComponent {
        constructor(componentId, config = {}) {
            this.componentId = componentId;
            this.component = document.getElementById(componentId);
            this.config = {
                clientId: config.clientId || 'your-google-client-id.googleusercontent.com',
                scope: config.scope || 'email profile openid',
                
                // Google's official button styling options
                type: config.type || 'standard',        // 'standard' | 'icon'
                theme: config.theme || 'outline',       // 'outline' | 'filled_blue' | 'filled_black'
                size: config.size || 'large',           // 'large' | 'medium' | 'small'
                text: config.text || 'signin_with',     // 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
                shape: config.shape || 'rectangular',   // 'rectangular' | 'pill' | 'circle' | 'square'
                logo_alignment: config.logoAlignment || 'left', // 'left' | 'center'
                width: config.width || 200,
                locale: config.locale || 'en'
            };
            
            this.userProfile = null;
            this.authToken = null;
            this.isInitialized = false;
            
            console.log('Google Sign In component created:', componentId);
        }
        
        /**
         * Initialize Google Sign In with official SDK
         */
        async initialize() {
            try {
                // Load Google's official SDK
                await this.loadGoogleSDK();
                
                // Initialize Google Identity Services
                google.accounts.id.initialize({
                    client_id: this.config.clientId,
                    callback: (response) => this.handleCredentialResponse(response),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                
                // Render Google's official button
                this.renderOfficialGoogleButton();
                
                // Attach event listeners
                this.attachEventListeners();
                
                // Integration with Events Handler
                this.setupEventsHandlerIntegration();
                
                this.isInitialized = true;
                console.log('Google Sign In initialized successfully:', this.componentId);
                
                // Notify component is ready
                this.component.dispatchEvent(new CustomEvent('googleSignInReady', {
                    detail: { componentId: this.componentId }
                }));
                
            } catch (error) {
                console.error('Google Sign In initialization failed:', error);
                this.handleError('INITIALIZATION_FAILED', error);
            }
        }
        
        /**
         * Load Google's official Identity Services SDK
         */
        loadGoogleSDK() {
            return new Promise((resolve, reject) => {
                // Check if Google SDK is already loaded
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    resolve();
                    return;
                }
                
                console.log('Loading Google Identity Services SDK...');
                
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('Google SDK loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load Google SDK:', error);
                    reject(new Error('Google SDK loading failed'));
                };
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * Render Google's official button with authentic branding
         */
        renderOfficialGoogleButton() {
            // Clear any existing content
            this.component.innerHTML = '';
            
            // Create container for Google's official button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'google-signin-container';
            buttonContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 200px;
                min-height: 40px;
            `;
            
            // Create div for Google's button to render into
            const googleButtonDiv = document.createElement('div');
            googleButtonDiv.id = `google-signin-button-${this.componentId}`;
            
            buttonContainer.appendChild(googleButtonDiv);
            this.component.appendChild(buttonContainer);
            
            // Create custom Google button with logo only
            this.createCustomGoogleButton(googleButtonDiv);
            
            console.log('Google official button rendered:', this.componentId);
        }
        
        /**
         * Create custom Google button with logo only
         */
        createCustomGoogleButton(container) {
            const googleButton = document.createElement('button');
            googleButton.className = 'google-signin-button-custom';
            
            googleButton.style.cssText = `
                width: 100%;
                height: 100%;
                background: #ffffff;
                border: 1px solid #dadce0;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                outline: none;
                min-width: 48px;
                min-height: 48px;
            `;
            
            // Google logo SVG (official colors)
            googleButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            `;
            
            // Add hover effects
            googleButton.addEventListener('mouseenter', () => {
                googleButton.style.backgroundColor = '#f8f9fa';
                googleButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            });
            
            googleButton.addEventListener('mouseleave', () => {
                googleButton.style.backgroundColor = '#ffffff';
                googleButton.style.boxShadow = 'none';
            });
            
            // Add click handler
            googleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateSignIn();
            });
            
            container.appendChild(googleButton);
        }
        
        /**
         * Handle Google credential response
         */
        async handleCredentialResponse(response) {
            try {
                console.log('Google Sign In response received');
                
                // Dispatch sign-in initiated event
                this.component.dispatchEvent(new CustomEvent('signInInitiated', {
                    detail: { 
                        provider: 'google',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Decode the JWT credential
                const credential = this.parseJWT(response.credential);
                
                // Store auth token
                this.authToken = {
                    credential: response.credential,
                    clientId: response.clientId || this.config.clientId,
                    select_by: response.select_by
                };
                
                // Extract user profile from JWT
                this.userProfile = {
                    id: credential.sub,
                    provider: 'google',
                    email: credential.email,
                    name: credential.name,
                    firstName: credential.given_name,
                    lastName: credential.family_name,
                    picture: credential.picture,
                    verified: credential.email_verified,
                    locale: credential.locale,
                    lastLogin: new Date().toISOString()
                };
                
                // Store authentication data
                this.storeAuthenticationData();
                
                // Dispatch successful sign-in event
                this.component.dispatchEvent(new CustomEvent('signInCompleted', {
                    detail: {
                        provider: 'google',
                        componentId: this.componentId,
                        userInfo: this.userProfile,
                        tokens: {
                            credential: this.authToken.credential,
                            clientId: this.authToken.clientId
                        },
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Google Sign In completed successfully:', this.userProfile);
                
            } catch (error) {
                console.error('Error processing Google credential:', error);
                this.handleError('CREDENTIAL_PROCESSING_FAILED', error);
            }
        }
        
        /**
         * Parse JWT token
         */
        parseJWT(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                return JSON.parse(jsonPayload);
            } catch (error) {
                throw new Error('Invalid JWT token');
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
                sharedData.authentication.activeProvider = 'google';
                sharedData.authentication.sessionToken = this.authToken;
                sharedData.authentication.lastSignInTime = new Date().toISOString();
                
                console.log('Authentication data stored in app state');
            }
            
            // Also store in sessionStorage for persistence
            try {
                sessionStorage.setItem('google_auth_token', JSON.stringify(this.authToken));
                sessionStorage.setItem('google_user_profile', JSON.stringify(this.userProfile));
            } catch (error) {
                console.warn('Could not store auth data in sessionStorage:', error);
            }
        }
        
        /**
         * Sign out the user
         */
        async signOut() {
            try {
                console.log('Signing out Google user...');
                
                // Google's sign out
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    google.accounts.id.disableAutoSelect();
                }
                
                // Clear stored authentication data
                this.userProfile = null;
                this.authToken = null;
                
                // Clear from app state
                if (window.handlerData && window.handlerData['shared handler data']) {
                    const auth = window.handlerData['shared handler data'][0].authentication;
                    if (auth && auth.activeProvider === 'google') {
                        auth.currentUser = null;
                        auth.activeProvider = null;
                        auth.sessionToken = null;
                        auth.lastSignInTime = null;
                    }
                }
                
                // Clear sessionStorage
                try {
                    sessionStorage.removeItem('google_auth_token');
                    sessionStorage.removeItem('google_user_profile');
                } catch (error) {
                    console.warn('Could not clear sessionStorage:', error);
                }
                
                // Dispatch sign-out event
                this.component.dispatchEvent(new CustomEvent('signOutCompleted', {
                    detail: {
                        provider: 'google',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Google sign out completed');
                
            } catch (error) {
                console.error('Google sign out error:', error);
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
                this.renderOfficialGoogleButton();
            });
        }
        
        /**
         * Setup integration with Events Handler system
         */
        setupEventsHandlerIntegration() {
            // Register with Events Handler if available
            if (window.EventsHandler) {
                console.log('Google Sign In integrated with Events Handler');
            }
            
            // Component selection behavior integration
            this.component.addEventListener('handleComponentSelect', (e) => {
                console.log('Google Sign In component selected:', this.componentId);
            });
        }
        
        /**
         * Handle errors in Google Sign In flow
         */
        handleError(errorType, error) {
            console.error(`Google Sign In Error [${errorType}]:`, error);
            
            // Dispatch error event
            this.component.dispatchEvent(new CustomEvent('signInError', {
                detail: {
                    provider: 'google',
                    componentId: this.componentId,
                    error: error.message || 'Google Sign In failed',
                    errorCode: errorType,
                    originalError: error,
                    timestamp: Date.now()
                }
            }));
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
    
    // Export GoogleSignInComponent for use by factory
    window.GoogleSignInComponent = GoogleSignInComponent;
    
    console.log('Google Sign In component class loaded');
    
})();
