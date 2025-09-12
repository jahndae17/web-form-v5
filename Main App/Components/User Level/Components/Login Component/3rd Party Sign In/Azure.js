// Azure/Microsoft Sign In Component
// Implements Microsoft Authentication Library (MSAL) for Azure AD authentication
// Professional branding through Microsoft's official assets and Graph Toolkit
// Integrates with Base User Component system (move, resize, snap - NO nesting)

(function() {
    'use strict';
    
    /**
     * Azure/Microsoft Sign In Component Implementation
     * Uses Microsoft Authentication Library (MSAL) for authentic branding
     * https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications
     */
    class AzureSignInComponent {
        constructor(componentId, config = {}) {
            this.componentId = componentId;
            this.component = document.getElementById(componentId);
            this.config = {
                clientId: config.clientId || 'your-azure-client-id',
                authority: config.authority || 'https://login.microsoftonline.com/common',
                scopes: config.scopes || ['user.read', 'profile', 'email', 'openid'],
                redirectUri: config.redirectUri || window.location.origin,
                
                // Microsoft's official branding options
                buttonText: config.buttonText || 'Sign in with Microsoft',
                buttonStyle: config.buttonStyle || 'primary',     // 'primary' | 'secondary'
                buttonSize: config.buttonSize || 'medium',        // 'small' | 'medium' | 'large'
                brandColor: config.brandColor || '#0078d4',
                useOfficialAssets: config.useOfficialAssets !== false,
                
                // Login behavior
                loginType: config.loginType || 'popup',           // 'popup' | 'redirect'
                prompt: config.prompt || 'select_account'         // 'login' | 'select_account' | 'consent'
            };
            
            this.msalInstance = null;
            this.userProfile = null;
            this.authToken = null;
            this.isInitialized = false;
            
            console.log('Azure Sign In component created:', componentId);
        }
        
        /**
         * Initialize Microsoft Sign In with official MSAL SDK
         */
        async initialize() {
            try {
                // Load Microsoft's official MSAL SDK
                await this.loadMSALSDK();
                
                // Initialize MSAL instance
                this.msalInstance = new msal.PublicClientApplication({
                    auth: {
                        clientId: this.config.clientId,
                        authority: this.config.authority,
                        redirectUri: this.config.redirectUri
                    },
                    cache: {
                        cacheLocation: 'localStorage',
                        storeAuthStateInCookie: true
                    }
                });
                
                // Handle redirect response if returning from authentication
                await this.msalInstance.handleRedirectPromise();
                
                // Render Microsoft's official button
                this.renderOfficialMicrosoftButton();
                
                // Attach event listeners
                this.attachEventListeners();
                
                // Integration with Events Handler
                this.setupEventsHandlerIntegration();
                
                this.isInitialized = true;
                console.log('Azure Sign In initialized successfully:', this.componentId);
                
                // Notify component is ready
                this.component.dispatchEvent(new CustomEvent('azureSignInReady', {
                    detail: { componentId: this.componentId }
                }));
                
            } catch (error) {
                console.error('Azure Sign In initialization failed:', error);
                this.handleError('INITIALIZATION_FAILED', error);
            }
        }
        
        /**
         * Load Microsoft's official MSAL SDK
         */
        loadMSALSDK() {
            return new Promise((resolve, reject) => {
                // Check if MSAL SDK is already loaded
                if (typeof msal !== 'undefined') {
                    resolve();
                    return;
                }
                
                console.log('Loading Microsoft MSAL SDK...');
                
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.4/lib/msal-browser.min.js';
                script.async = true;
                script.onload = () => {
                    console.log('Microsoft MSAL SDK loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load Microsoft MSAL SDK:', error);
                    reject(new Error('Microsoft MSAL SDK loading failed'));
                };
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * Render Microsoft's official button with authentic branding
         */
        renderOfficialMicrosoftButton() {
            // Clear any existing content
            this.component.innerHTML = '';
            
            // Create container for Microsoft's official button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'microsoft-signin-container';
            buttonContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 200px;
                min-height: 40px;
            `;
            
            // Create Microsoft's logo-only button
            const microsoftButton = document.createElement('button');
            microsoftButton.id = `microsoft-signin-button-${this.componentId}`;
            microsoftButton.className = 'microsoft-signin-button';
            
            microsoftButton.style.cssText = `
                width: 100%;
                height: 100%;
                background: #ffffff;
                color: #5e5e5e;
                border: 1px solid #8a8886;
                border-radius: 2px;
                font-family: 'Segoe UI', 'Segoe UI Web', Tahoma, Arial, Helvetica, sans-serif;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                outline: none;
                min-width: 48px;
                min-height: 48px;
            `;
            
            // Add Microsoft logo only
            microsoftButton.innerHTML = `
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                    <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                    <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                    <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                </svg>
            `;
            
            // Add hover effects
            microsoftButton.addEventListener('mouseenter', () => {
                microsoftButton.style.backgroundColor = '#f3f2f1';
                microsoftButton.style.borderColor = '#605e5c';
            });
            
            microsoftButton.addEventListener('mouseleave', () => {
                microsoftButton.style.backgroundColor = '#ffffff';
                microsoftButton.style.borderColor = '#8a8886';
            });
            
            // Add click handler
            microsoftButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateSignIn();
            });
            
            buttonContainer.appendChild(microsoftButton);
            this.component.appendChild(buttonContainer);
            
            console.log('Microsoft official button rendered:', this.componentId);
        }
        
        /**
         * Initiate Microsoft Sign In flow
         */
        async initiateSignIn() {
            try {
                console.log('Initiating Microsoft Sign In...');
                
                // Dispatch sign-in initiated event
                this.component.dispatchEvent(new CustomEvent('signInInitiated', {
                    detail: { 
                        provider: 'microsoft',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Update button state to loading
                this.setButtonState('loading');
                
                // Configure login request
                const loginRequest = {
                    scopes: this.config.scopes,
                    prompt: this.config.prompt
                };
                
                let response;
                
                // Use popup or redirect based on configuration
                if (this.config.loginType === 'popup') {
                    response = await this.msalInstance.loginPopup(loginRequest);
                } else {
                    await this.msalInstance.loginRedirect(loginRequest);
                    return; // Redirect will handle the response
                }
                
                console.log('Microsoft Sign In response received:', response);
                
                // Process the authentication response
                await this.handleAuthenticationResponse(response);
                
            } catch (error) {
                console.error('Microsoft Sign In failed:', error);
                this.handleError('SIGN_IN_FAILED', error);
            }
        }
        
        /**
         * Handle Microsoft authentication response
         */
        async handleAuthenticationResponse(response) {
            try {
                // Store auth token
                this.authToken = {
                    accessToken: response.accessToken,
                    idToken: response.idToken,
                    account: response.account,
                    scopes: response.scopes,
                    expiresOn: response.expiresOn
                };
                
                // Extract user profile from account info
                const account = response.account;
                this.userProfile = {
                    id: account.homeAccountId,
                    provider: 'microsoft',
                    email: account.username,
                    name: account.name,
                    firstName: account.idTokenClaims?.given_name,
                    lastName: account.idTokenClaims?.family_name,
                    picture: null, // Would need Microsoft Graph API call
                    verified: true,
                    tenantId: account.tenantId,
                    locale: account.idTokenClaims?.locale,
                    lastLogin: new Date().toISOString()
                };
                
                // Update button state to success
                this.setButtonState('success');
                
                // Store authentication data
                this.storeAuthenticationData();
                
                // Dispatch successful sign-in event
                this.component.dispatchEvent(new CustomEvent('signInCompleted', {
                    detail: {
                        provider: 'microsoft',
                        componentId: this.componentId,
                        userInfo: this.userProfile,
                        tokens: {
                            accessToken: this.authToken.accessToken,
                            idToken: this.authToken.idToken
                        },
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Microsoft Sign In completed successfully:', this.userProfile);
                
            } catch (error) {
                console.error('Error processing Microsoft authentication:', error);
                this.handleError('AUTHENTICATION_PROCESSING_FAILED', error);
            }
        }
        
        /**
         * Set button visual state
         */
        setButtonState(state) {
            const button = this.component.querySelector('.microsoft-signin-button');
            if (!button) return;
            
            const container = this.component.querySelector('.microsoft-signin-container');
            
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
                    this.renderOfficialMicrosoftButton();
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
                sharedData.authentication.activeProvider = 'microsoft';
                sharedData.authentication.sessionToken = this.authToken;
                sharedData.authentication.lastSignInTime = new Date().toISOString();
                
                console.log('Authentication data stored in app state');
            }
            
            // Also store in sessionStorage for persistence
            try {
                sessionStorage.setItem('microsoft_auth_token', JSON.stringify(this.authToken));
                sessionStorage.setItem('microsoft_user_profile', JSON.stringify(this.userProfile));
            } catch (error) {
                console.warn('Could not store auth data in sessionStorage:', error);
            }
        }
        
        /**
         * Sign out the user
         */
        async signOut() {
            try {
                console.log('Signing out Microsoft user...');
                
                // Microsoft's sign out
                if (this.msalInstance && this.authToken && this.authToken.account) {
                    const logoutRequest = {
                        account: this.authToken.account,
                        postLogoutRedirectUri: window.location.origin
                    };
                    
                    if (this.config.loginType === 'popup') {
                        await this.msalInstance.logoutPopup(logoutRequest);
                    } else {
                        await this.msalInstance.logoutRedirect(logoutRequest);
                    }
                }
                
                // Clear stored authentication data
                this.userProfile = null;
                this.authToken = null;
                
                // Clear from app state
                if (window.handlerData && window.handlerData['shared handler data']) {
                    const auth = window.handlerData['shared handler data'][0].authentication;
                    if (auth && auth.activeProvider === 'microsoft') {
                        auth.currentUser = null;
                        auth.activeProvider = null;
                        auth.sessionToken = null;
                        auth.lastSignInTime = null;
                    }
                }
                
                // Clear sessionStorage
                try {
                    sessionStorage.removeItem('microsoft_auth_token');
                    sessionStorage.removeItem('microsoft_user_profile');
                } catch (error) {
                    console.warn('Could not clear sessionStorage:', error);
                }
                
                // Reset button state
                this.setButtonState('idle');
                
                // Dispatch sign-out event
                this.component.dispatchEvent(new CustomEvent('signOutCompleted', {
                    detail: {
                        provider: 'microsoft',
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                console.log('Microsoft sign out completed');
                
            } catch (error) {
                console.error('Microsoft sign out error:', error);
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
                this.renderOfficialMicrosoftButton();
            });
        }
        
        /**
         * Setup integration with Events Handler system
         */
        setupEventsHandlerIntegration() {
            // Register with Events Handler if available
            if (window.EventsHandler) {
                console.log('Microsoft Sign In integrated with Events Handler');
            }
            
            // Component selection behavior integration
            this.component.addEventListener('handleComponentSelect', (e) => {
                console.log('Microsoft Sign In component selected:', this.componentId);
            });
        }
        
        /**
         * Handle errors in Microsoft Sign In flow
         */
        handleError(errorType, error) {
            console.error(`Microsoft Sign In Error [${errorType}]:`, error);
            
            // Set button to error state
            this.setButtonState('error');
            
            // Determine error details
            let errorMessage = 'Microsoft Sign In failed';
            let errorCode = errorType;
            
            if (error.errorCode) {
                switch (error.errorCode) {
                    case 'user_cancelled':
                        errorMessage = 'Sign in was cancelled';
                        errorCode = 'USER_CANCELLED';
                        break;
                    case 'popup_window_error':
                        errorMessage = 'Popup was blocked or closed';
                        errorCode = 'POPUP_ERROR';
                        break;
                    case 'invalid_client':
                        errorMessage = 'Invalid Microsoft client configuration';
                        errorCode = 'INVALID_CLIENT';
                        break;
                    default:
                        errorMessage = error.errorMessage || error.message || errorMessage;
                        errorCode = error.errorCode.toUpperCase();
                }
            }
            
            // Dispatch error event
            this.component.dispatchEvent(new CustomEvent('signInError', {
                detail: {
                    provider: 'microsoft',
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
    
    // Export AzureSignInComponent for use by factory
    window.AzureSignInComponent = AzureSignInComponent;
    
    console.log('Azure Sign In component class loaded');
    
})();
