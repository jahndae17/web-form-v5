// Facebook Sign In Component
// Implements Facebook SDK for JavaScript for Facebook Login authentication
// Professional branding through Facebook's official Social Plugins
// Integrates with Base User Component system (move, resize, snap - NO nesting)

(function() {
    'use strict';
    
    /**
     * Facebook Sign In Component Implementation
     * Uses Facebook SDK for JavaScript for authentic branding
     * https://developers.facebook.com/docs/facebook-login/web
     */
    class FacebookSignInComponent {
        constructor(componentId, config = {}) {
            this.componentId = componentId;
            this.component = document.getElementById(componentId);
            this.config = {
                appId: config.appId || 'your-facebook-app-id',
                version: config.version || 'v18.0',
                scope: config.scope || 'email,public_profile',
                
                // Facebook's official social plugin options
                buttonSize: config.buttonSize || 'large',        // 'small' | 'medium' | 'large'
                buttonType: config.buttonType || 'continue_with', // 'login_with' | 'continue_with'
                layout: config.layout || 'default',             // 'default' | 'rounded'
                useOfficialPlugin: config.useOfficialPlugin !== false,
                
                // Login behavior
                enableCookies: config.enableCookies !== false,
                parseXFBML: config.parseXFBML !== false,
                rerequest: config.rerequest === true
            };
            
            this.userProfile = null;
            this.authToken = null;
            this.isInitialized = false;
            
            console.log('Facebook Sign In component created:', componentId);
        }
        
        /**
         * Initialize Facebook Sign In with official SDK
         */
        async initialize() {
            try {
                // Load Facebook's official SDK
                await this.loadFacebookSDK();
                
                // Initialize Facebook SDK
                FB.init({
                    appId: this.config.appId,
                    cookie: this.config.enableCookies,
                    xfbml: this.config.parseXFBML,
                    version: this.config.version
                });
                
                // Check login status
                await this.checkLoginStatus();
                
                // Render Facebook's official button
                this.renderOfficialFacebookButton();
                
                // Attach event listeners
                this.attachEventListeners();
                
                // Integration with Events Handler
                this.setupEventsHandlerIntegration();
                
                this.isInitialized = true;
                console.log('Facebook Sign In initialized successfully:', this.componentId);
                
                // Notify component is ready
                this.component.dispatchEvent(new CustomEvent('facebookSignInReady', {
                    detail: { componentId: this.componentId }
                }));
                
            } catch (error) {
                console.error('Facebook Sign In initialization failed:', error);
                this.handleError('INITIALIZATION_FAILED', error);
            }
        }
        
        /**
         * Load Facebook's official SDK
         */
        loadFacebookSDK() {
            return new Promise((resolve, reject) => {
                // Check if Facebook SDK is already loaded
                if (typeof FB !== 'undefined') {
                    resolve();
                    return;
                }
                
                console.log('Loading Facebook SDK...');
                
                // Load Facebook SDK asynchronously
                window.fbAsyncInit = function() {
                    console.log('Facebook SDK loaded successfully');
                    resolve();
                };
                
                // Create script element
                const script = document.createElement('script');
                script.id = 'facebook-jssdk';
                script.src = 'https://connect.facebook.net/en_US/sdk.js';
                script.async = true;
                script.defer = true;
                script.crossOrigin = 'anonymous';
                script.onerror = (error) => {
                    console.error('Failed to load Facebook SDK:', error);
                    reject(new Error('Facebook SDK loading failed'));
                };
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * Check current login status (skip if not HTTPS)
         */
        checkLoginStatus() {
            return new Promise((resolve) => {
                // Skip login status check if not HTTPS (Facebook requirement)
                if (window.location.protocol !== 'https:') {
                    console.log('Skipping Facebook login status check - HTTPS required');
                    resolve();
                    return;
                }
                
                FB.getLoginStatus((response) => {
                    if (response.status === 'connected') {
                        console.log('User is already logged into Facebook');
                        this.handleLoginResponse(response);
                    }
                    resolve();
                });
            });
        }
        
        /**
         * Render Facebook's official button with authentic branding
         */
        renderOfficialFacebookButton() {
            // Clear any existing content
            this.component.innerHTML = '';
            
            // Create container for Facebook's official button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'facebook-signin-container';
            buttonContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 200px;
                min-height: 40px;
            `;
            
            // Create Facebook's logo-only button
            const facebookButton = document.createElement('button');
            facebookButton.id = `facebook-signin-button-${this.componentId}`;
            facebookButton.className = 'facebook-signin-button';
            
            facebookButton.style.cssText = `
                width: 100%;
                height: 100%;
                background: #1877f2;
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
            
            // Add Facebook logo only
            facebookButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            `;
            
            // Add hover effects
            facebookButton.addEventListener('mouseenter', () => {
                facebookButton.style.backgroundColor = '#166fe5';
            });
            
            facebookButton.addEventListener('mouseleave', () => {
                facebookButton.style.backgroundColor = '#1877f2';
            });
            
            // Add click handler
            facebookButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateSignIn();
            });
            
            buttonContainer.appendChild(facebookButton);
            this.component.appendChild(buttonContainer);
            
            console.log('Facebook official button rendered:', this.componentId);
        }
        
        /**
         * Initiate Facebook Sign In flow
         */
        async initiateSignIn() {
            try {
                console.log('Initiating Facebook Sign In...');
                
                // Check HTTPS requirement
                if (window.location.protocol !== 'https:') {
                    throw new Error('Facebook Login requires HTTPS. Please use a secure connection.');
                }
                
                // Dispatch sign-in initiated event
                this.component.dispatchEvent(new CustomEvent('signInInitiated', {
                    detail: { 
                        provider: 'facebook',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Update button state to loading
                this.setButtonState('loading');
                
                // Configure login options
                const loginOptions = {
                    scope: this.config.scope,
                    return_scopes: true,
                    enable_profile_selector: true
                };
                
                if (this.config.rerequest) {
                    loginOptions.auth_type = 'rerequest';
                }
                
                // Use Facebook's login method
                FB.login((response) => {
                    this.handleLoginResponse(response);
                }, loginOptions);
                
            } catch (error) {
                console.error('Facebook Sign In failed:', error);
                this.handleError('SIGN_IN_FAILED', error);
            }
        }
        
        /**
         * Handle Facebook login response
         */
        async handleLoginResponse(response) {
            try {
                console.log('Facebook login response received:', response);
                
                if (response.status === 'connected') {
                    // Store auth token
                    this.authToken = {
                        accessToken: response.authResponse.accessToken,
                        userID: response.authResponse.userID,
                        expiresIn: response.authResponse.expiresIn,
                        signedRequest: response.authResponse.signedRequest,
                        grantedScopes: response.authResponse.grantedScopes,
                        reauthorize_required_in: response.authResponse.reauthorize_required_in
                    };
                    
                    // Get user profile information
                    await this.getUserProfile();
                    
                    // Update button state to success
                    this.setButtonState('success');
                    
                    // Store authentication data
                    this.storeAuthenticationData();
                    
                    // Dispatch successful sign-in event
                    this.component.dispatchEvent(new CustomEvent('signInCompleted', {
                        detail: {
                            provider: 'facebook',
                            componentId: this.componentId,
                            userInfo: this.userProfile,
                            tokens: {
                                accessToken: this.authToken.accessToken,
                                userID: this.authToken.userID
                            },
                            timestamp: Date.now()
                        }
                    }));
                    
                    console.log('Facebook Sign In completed successfully:', this.userProfile);
                    
                } else {
                    // User cancelled login or didn't authorize
                    throw new Error(response.status === 'not_authorized' 
                        ? 'User did not authorize the app'
                        : 'User cancelled login');
                }
                
            } catch (error) {
                console.error('Error processing Facebook login:', error);
                this.handleError('LOGIN_PROCESSING_FAILED', error);
            }
        }
        
        /**
         * Get user profile information from Facebook Graph API
         */
        getUserProfile() {
            return new Promise((resolve, reject) => {
                FB.api('/me', {
                    fields: 'id,name,email,first_name,last_name,picture,locale,verified'
                }, (response) => {
                    if (response && !response.error) {
                        this.userProfile = {
                            id: response.id,
                            provider: 'facebook',
                            email: response.email,
                            name: response.name,
                            firstName: response.first_name,
                            lastName: response.last_name,
                            picture: response.picture?.data?.url,
                            verified: response.verified,
                            locale: response.locale,
                            lastLogin: new Date().toISOString()
                        };
                        resolve();
                    } else {
                        reject(new Error('Failed to get user profile from Facebook'));
                    }
                });
            });
        }
        
        /**
         * Set button visual state
         */
        setButtonState(state) {
            const button = this.component.querySelector('.facebook-signin-button');
            if (!button) return;
            
            const container = this.component.querySelector('.facebook-signin-container');
            
            switch (state) {
                case 'loading':
                    container.style.opacity = '0.7';
                    container.style.pointerEvents = 'none';
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="32" stroke-dashoffset="32">
                                <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                        <span>Signing in...</span>
                    `;
                    break;
                    
                case 'success':
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        this.setButtonState('idle');
                    }, 2000);
                    break;
                    
                case 'error':
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        this.setButtonState('idle');
                    }, 3000);
                    break;
                    
                case 'idle':
                default:
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    this.renderOfficialFacebookButton();
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
                sharedData.authentication.activeProvider = 'facebook';
                sharedData.authentication.sessionToken = this.authToken;
                sharedData.authentication.lastSignInTime = new Date().toISOString();
                
                console.log('Authentication data stored in app state');
            }
            
            // Also store in sessionStorage for persistence
            try {
                sessionStorage.setItem('facebook_auth_token', JSON.stringify(this.authToken));
                sessionStorage.setItem('facebook_user_profile', JSON.stringify(this.userProfile));
            } catch (error) {
                console.warn('Could not store auth data in sessionStorage:', error);
            }
        }
        
        /**
         * Sign out the user
         */
        async signOut() {
            try {
                console.log('Signing out Facebook user...');
                
                // Facebook's logout
                FB.logout((response) => {
                    console.log('Facebook logout response:', response);
                });
                
                // Clear stored authentication data
                this.userProfile = null;
                this.authToken = null;
                
                // Clear from app state
                if (window.handlerData && window.handlerData['shared handler data']) {
                    const auth = window.handlerData['shared handler data'][0].authentication;
                    if (auth && auth.activeProvider === 'facebook') {
                        auth.currentUser = null;
                        auth.activeProvider = null;
                        auth.sessionToken = null;
                        auth.lastSignInTime = null;
                    }
                }
                
                // Clear sessionStorage
                try {
                    sessionStorage.removeItem('facebook_auth_token');
                    sessionStorage.removeItem('facebook_user_profile');
                } catch (error) {
                    console.warn('Could not clear sessionStorage:', error);
                }
                
                // Reset button state
                this.setButtonState('idle');
                
                // Dispatch sign-out event
                this.component.dispatchEvent(new CustomEvent('signOutCompleted', {
                    detail: {
                        provider: 'facebook',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Facebook sign out completed');
                
            } catch (error) {
                console.error('Facebook sign out error:', error);
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
                this.renderOfficialFacebookButton();
            });
        }
        
        /**
         * Setup integration with Events Handler system
         */
        setupEventsHandlerIntegration() {
            // Register with Events Handler if available
            if (window.EventsHandler) {
                console.log('Facebook Sign In integrated with Events Handler');
            }
            
            // Component selection behavior integration
            this.component.addEventListener('handleComponentSelect', (e) => {
                console.log('Facebook Sign In component selected:', this.componentId);
            });
        }
        
        /**
         * Handle errors in Facebook Sign In flow
         */
        handleError(errorType, error) {
            console.error(`Facebook Sign In Error [${errorType}]:`, error);
            
            // Set button to error state
            this.setButtonState('error');
            
            // Determine error details
            let errorMessage = 'Facebook Sign In failed';
            let errorCode = errorType;
            
            if (error.message) {
                errorMessage = error.message;
            }
            
            // Dispatch error event
            this.component.dispatchEvent(new CustomEvent('signInError', {
                detail: {
                    provider: 'facebook',
                    componentId: this.componentId,
                    error: errorMessage,
                    errorCode: errorCode,
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
    
    // Export FacebookSignInComponent for use by factory
    window.FacebookSignInComponent = FacebookSignInComponent;
    
    console.log('Facebook Sign In component class loaded');
    
})();
