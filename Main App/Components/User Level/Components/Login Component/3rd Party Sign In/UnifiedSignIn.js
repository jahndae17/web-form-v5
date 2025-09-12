// Unified Sign In Component
// Single component that displays multiple authentication providers in a horizontal gallery
// Uses official SDKs for Apple, Google, Microsoft, and Facebook authentication
// Integrates with Base User Component system (move, resize, snap - NO nesting)

(function() {
    'use strict';
    
    /**
     * Unified Sign In Component Implementation
     * Displays multiple authentication providers in a horizontal gallery
     */
    class UnifiedSignInComponent {
        constructor(componentId, config = {}) {
            this.componentId = componentId;
            this.component = document.getElementById(componentId);
            this.config = {
                // Provider visibility controls
                enabledProviders: config.enabledProviders || ['apple', 'google', 'microsoft', 'facebook'],
                
                // Apple configuration
                apple: {
                    clientId: config.apple?.clientId || 'your.apple.service.id',
                    scope: config.apple?.scope || 'name email',
                    redirectURI: config.apple?.redirectURI || window.location.origin + '/auth/apple/callback',
                    usePopup: config.apple?.usePopup !== false
                },
                
                // Google configuration
                google: {
                    clientId: config.google?.clientId || 'your-google-client-id.googleusercontent.com',
                    scope: config.google?.scope || 'email profile openid'
                },
                
                // Microsoft configuration
                microsoft: {
                    clientId: config.microsoft?.clientId || 'your-azure-client-id',
                    authority: config.microsoft?.authority || 'https://login.microsoftonline.com/common',
                    scopes: config.microsoft?.scopes || ['user.read', 'profile', 'email', 'openid'],
                    loginType: config.microsoft?.loginType || 'popup'
                },
                
                // Facebook configuration
                facebook: {
                    appId: config.facebook?.appId || 'your-facebook-app-id',
                    version: config.facebook?.version || 'v18.0',
                    scope: config.facebook?.scope || 'email,public_profile'
                },
                
                // Button styling
                buttonGap: config.buttonGap || '8px',
                buttonSize: config.buttonSize || '48px' // Square buttons (width = height)
            };
            
            this.sdksLoaded = {
                apple: false,
                google: false,
                microsoft: false,
                facebook: false
            };
            
            this.userProfiles = {};
            this.authTokens = {};
            this.isInitialized = false;
            
            console.log('Unified Sign In component created:', componentId);
        }
        
        /**
         * Initialize Unified Sign In with all enabled providers
         */
        async initialize() {
            try {
                // Load all required SDKs
                await this.loadAllSDKs();
                
                // Initialize all enabled providers
                await this.initializeProviders();
                
                // Render the horizontal gallery of buttons
                this.renderButtonGallery();
                
                // Attach event listeners
                this.attachEventListeners();
                
                // Integration with Events Handler
                this.setupEventsHandlerIntegration();
                
                this.isInitialized = true;
                console.log('Unified Sign In initialized successfully:', this.componentId);
                
                // Notify component is ready
                this.component.dispatchEvent(new CustomEvent('unifiedSignInReady', {
                    detail: { componentId: this.componentId, enabledProviders: this.config.enabledProviders }
                }));
                
            } catch (error) {
                console.error('Unified Sign In initialization failed:', error);
                this.handleError('INITIALIZATION_FAILED', error);
            }
        }
        
        /**
         * Load all required SDKs for enabled providers
         */
        async loadAllSDKs() {
            const loadPromises = [];
            
            if (this.config.enabledProviders.includes('apple')) {
                loadPromises.push(this.loadAppleSDK());
            }
            
            if (this.config.enabledProviders.includes('google')) {
                loadPromises.push(this.loadGoogleSDK());
            }
            
            if (this.config.enabledProviders.includes('microsoft')) {
                loadPromises.push(this.loadMicrosoftSDK());
            }
            
            if (this.config.enabledProviders.includes('facebook')) {
                loadPromises.push(this.loadFacebookSDK());
            }
            
            await Promise.allSettled(loadPromises);
            console.log('All SDKs loaded for enabled providers');
        }
        
        /**
         * Load Apple SDK
         */
        loadAppleSDK() {
            return new Promise((resolve, reject) => {
                if (typeof AppleID !== 'undefined') {
                    this.sdksLoaded.apple = true;
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
                script.async = true;
                script.onload = () => {
                    this.sdksLoaded.apple = true;
                    resolve();
                };
                script.onerror = () => reject(new Error('Apple SDK loading failed'));
                document.head.appendChild(script);
            });
        }
        
        /**
         * Load Google SDK
         */
        loadGoogleSDK() {
            return new Promise((resolve, reject) => {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    this.sdksLoaded.google = true;
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    this.sdksLoaded.google = true;
                    resolve();
                };
                script.onerror = () => reject(new Error('Google SDK loading failed'));
                document.head.appendChild(script);
            });
        }
        
        /**
         * Load Microsoft SDK
         */
        loadMicrosoftSDK() {
            return new Promise((resolve, reject) => {
                if (typeof msal !== 'undefined') {
                    this.sdksLoaded.microsoft = true;
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.4/lib/msal-browser.min.js';
                script.async = true;
                script.onload = () => {
                    this.sdksLoaded.microsoft = true;
                    resolve();
                };
                script.onerror = () => reject(new Error('Microsoft SDK loading failed'));
                document.head.appendChild(script);
            });
        }
        
        /**
         * Load Facebook SDK
         */
        loadFacebookSDK() {
            return new Promise((resolve, reject) => {
                if (typeof FB !== 'undefined') {
                    this.sdksLoaded.facebook = true;
                    resolve();
                    return;
                }
                
                window.fbAsyncInit = () => {
                    this.sdksLoaded.facebook = true;
                    resolve();
                };
                
                const script = document.createElement('script');
                script.id = 'facebook-jssdk';
                script.src = 'https://connect.facebook.net/en_US/sdk.js';
                script.async = true;
                script.defer = true;
                script.crossOrigin = 'anonymous';
                script.onerror = () => reject(new Error('Facebook SDK loading failed'));
                document.head.appendChild(script);
            });
        }
        
        /**
         * Initialize all enabled providers
         */
        async initializeProviders() {
            const initPromises = [];
            
            if (this.config.enabledProviders.includes('apple') && this.sdksLoaded.apple) {
                initPromises.push(this.initializeApple());
            }
            
            if (this.config.enabledProviders.includes('google') && this.sdksLoaded.google) {
                initPromises.push(this.initializeGoogle());
            }
            
            if (this.config.enabledProviders.includes('microsoft') && this.sdksLoaded.microsoft) {
                initPromises.push(this.initializeMicrosoft());
            }
            
            if (this.config.enabledProviders.includes('facebook') && this.sdksLoaded.facebook) {
                initPromises.push(this.initializeFacebook());
            }
            
            await Promise.allSettled(initPromises);
        }
        
        /**
         * Initialize Apple Sign In
         */
        async initializeApple() {
            try {
                await AppleID.auth.init({
                    clientId: this.config.apple.clientId,
                    scope: this.config.apple.scope,
                    redirectURI: this.config.apple.redirectURI,
                    usePopup: this.config.apple.usePopup
                });
            } catch (error) {
                console.error('Apple initialization failed:', error);
            }
        }
        
        /**
         * Initialize Google Sign In
         */
        async initializeGoogle() {
            try {
                google.accounts.id.initialize({
                    client_id: this.config.google.clientId,
                    callback: (response) => this.handleGoogleResponse(response),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
            } catch (error) {
                console.error('Google initialization failed:', error);
            }
        }
        
        /**
         * Initialize Microsoft Sign In
         */
        async initializeMicrosoft() {
            try {
                this.msalInstance = new msal.PublicClientApplication({
                    auth: {
                        clientId: this.config.microsoft.clientId,
                        authority: this.config.microsoft.authority
                    },
                    cache: {
                        cacheLocation: 'localStorage',
                        storeAuthStateInCookie: true
                    }
                });
                
                await this.msalInstance.handleRedirectPromise();
            } catch (error) {
                console.error('Microsoft initialization failed:', error);
            }
        }
        
        /**
         * Initialize Facebook Sign In
         */
        async initializeFacebook() {
            try {
                FB.init({
                    appId: this.config.facebook.appId,
                    cookie: true,
                    xfbml: true,
                    version: this.config.facebook.version
                });
                
                // Skip login status check if not HTTPS
                if (window.location.protocol === 'https:') {
                    FB.getLoginStatus((response) => {
                        if (response.status === 'connected') {
                            this.handleFacebookResponse(response);
                        }
                    });
                }
            } catch (error) {
                console.error('Facebook initialization failed:', error);
            }
        }
        
        /**
         * Render horizontal gallery of sign-in buttons
         */
        renderButtonGallery() {
            // Clear any existing content
            this.component.innerHTML = '';
            
            // Create gallery container
            const gallery = document.createElement('div');
            gallery.className = 'signin-gallery';
            gallery.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: ${this.config.buttonGap};
                padding: 8px;
                box-sizing: border-box;
            `;
            
            // Create buttons for each enabled provider
            this.config.enabledProviders.forEach(provider => {
                if (this.sdksLoaded[provider]) {
                    const button = this.createProviderButton(provider);
                    gallery.appendChild(button);
                }
            });
            
            this.component.appendChild(gallery);
            console.log('Sign-in button gallery rendered with providers:', this.config.enabledProviders);
        }
        
        /**
         * Create individual provider button
         */
        createProviderButton(provider) {
            const button = document.createElement('button');
            button.className = `signin-button signin-${provider}`;
            button.setAttribute('data-provider', provider);
            
            // Base button styling (square: width = height)
            button.style.cssText = `
                width: ${this.config.buttonSize};
                height: ${this.config.buttonSize};
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                outline: none;
                position: relative;
            `;
            
            // Provider-specific styling and logos
            switch (provider) {
                case 'apple':
                    button.style.backgroundColor = '#000000';
                    button.style.color = '#ffffff';
                    button.innerHTML = `
                        <svg width="20" height="24" viewBox="0 0 24 29" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                    `;
                    button.addEventListener('mouseenter', () => button.style.backgroundColor = '#333333');
                    button.addEventListener('mouseleave', () => button.style.backgroundColor = '#000000');
                    break;
                    
                case 'google':
                    button.style.backgroundColor = '#ffffff';
                    button.style.border = '1px solid #dadce0';
                    button.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    `;
                    button.addEventListener('mouseenter', () => {
                        button.style.backgroundColor = '#f8f9fa';
                        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    });
                    button.addEventListener('mouseleave', () => {
                        button.style.backgroundColor = '#ffffff';
                        button.style.boxShadow = 'none';
                    });
                    break;
                    
                case 'microsoft':
                    button.style.backgroundColor = '#ffffff';
                    button.style.border = '1px solid #8a8886';
                    button.innerHTML = `
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                            <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                            <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
                        </svg>
                    `;
                    button.addEventListener('mouseenter', () => {
                        button.style.backgroundColor = '#f3f2f1';
                        button.style.borderColor = '#605e5c';
                    });
                    button.addEventListener('mouseleave', () => {
                        button.style.backgroundColor = '#ffffff';
                        button.style.borderColor = '#8a8886';
                    });
                    break;
                    
                case 'facebook':
                    button.style.backgroundColor = '#1877f2';
                    button.style.color = '#ffffff';
                    button.innerHTML = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    `;
                    button.addEventListener('mouseenter', () => button.style.backgroundColor = '#166fe5');
                    button.addEventListener('mouseleave', () => button.style.backgroundColor = '#1877f2');
                    break;
            }
            
            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateSignIn(provider);
            });
            
            return button;
        }
        
        /**
         * Initiate sign-in for specific provider
         */
        async initiateSignIn(provider) {
            try {
                console.log(`Initiating ${provider} Sign In...`);
                
                // Dispatch sign-in initiated event
                this.component.dispatchEvent(new CustomEvent('signInInitiated', {
                    detail: { 
                        provider: provider,
                        componentId: this.componentId,
                        timestamp: Date.now()
                    }
                }));
                
                // Set button loading state
                this.setButtonState(provider, 'loading');
                
                switch (provider) {
                    case 'apple':
                        await this.signInWithApple();
                        break;
                    case 'google':
                        await this.signInWithGoogle();
                        break;
                    case 'microsoft':
                        await this.signInWithMicrosoft();
                        break;
                    case 'facebook':
                        await this.signInWithFacebook();
                        break;
                }
                
            } catch (error) {
                console.error(`${provider} Sign In failed:`, error);
                this.handleError('SIGN_IN_FAILED', error, provider);
            }
        }
        
        /**
         * Apple Sign In implementation
         */
        async signInWithApple() {
            const response = await AppleID.auth.signIn();
            await this.handleAppleResponse(response);
        }
        
        /**
         * Google Sign In implementation
         */
        async signInWithGoogle() {
            // Google uses callback in initialization, so we trigger the flow differently
            google.accounts.id.prompt();
        }
        
        /**
         * Microsoft Sign In implementation
         */
        async signInWithMicrosoft() {
            const loginRequest = {
                scopes: this.config.microsoft.scopes,
                prompt: 'select_account'
            };
            
            let response;
            if (this.config.microsoft.loginType === 'popup') {
                response = await this.msalInstance.loginPopup(loginRequest);
            } else {
                await this.msalInstance.loginRedirect(loginRequest);
                return;
            }
            
            await this.handleMicrosoftResponse(response);
        }
        
        /**
         * Facebook Sign In implementation
         */
        async signInWithFacebook() {
            // Check HTTPS requirement
            if (window.location.protocol !== 'https:') {
                throw new Error('Facebook Login requires HTTPS. Please use a secure connection.');
            }
            
            FB.login((response) => {
                this.handleFacebookResponse(response);
            }, {
                scope: this.config.facebook.scope,
                return_scopes: true
            });
        }
        
        /**
         * Handle Apple authentication response
         */
        async handleAppleResponse(response) {
            const { authorization, user } = response;
            
            this.authTokens.apple = {
                code: authorization.code,
                id_token: authorization.id_token,
                state: authorization.state
            };
            
            this.userProfiles.apple = {
                id: user?.email || 'apple_user',
                provider: 'apple',
                email: user?.email,
                name: user?.name ? `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim() : null,
                verified: true,
                lastLogin: new Date().toISOString()
            };
            
            this.setButtonState('apple', 'success');
            this.storeAuthenticationData('apple');
            this.dispatchSignInCompleted('apple');
        }
        
        /**
         * Handle Google authentication response
         */
        async handleGoogleResponse(response) {
            const credential = this.parseJWT(response.credential);
            
            this.authTokens.google = {
                credential: response.credential,
                clientId: response.clientId
            };
            
            this.userProfiles.google = {
                id: credential.sub,
                provider: 'google',
                email: credential.email,
                name: credential.name,
                firstName: credential.given_name,
                lastName: credential.family_name,
                picture: credential.picture,
                verified: credential.email_verified,
                lastLogin: new Date().toISOString()
            };
            
            this.setButtonState('google', 'success');
            this.storeAuthenticationData('google');
            this.dispatchSignInCompleted('google');
        }
        
        /**
         * Handle Microsoft authentication response
         */
        async handleMicrosoftResponse(response) {
            this.authTokens.microsoft = {
                accessToken: response.accessToken,
                idToken: response.idToken,
                account: response.account
            };
            
            const account = response.account;
            this.userProfiles.microsoft = {
                id: account.homeAccountId,
                provider: 'microsoft',
                email: account.username,
                name: account.name,
                verified: true,
                lastLogin: new Date().toISOString()
            };
            
            this.setButtonState('microsoft', 'success');
            this.storeAuthenticationData('microsoft');
            this.dispatchSignInCompleted('microsoft');
        }
        
        /**
         * Handle Facebook authentication response
         */
        async handleFacebookResponse(response) {
            if (response.status === 'connected') {
                this.authTokens.facebook = {
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID
                };
                
                // Get user profile from Facebook API
                FB.api('/me', {
                    fields: 'id,name,email,first_name,last_name,picture'
                }, (userResponse) => {
                    this.userProfiles.facebook = {
                        id: userResponse.id,
                        provider: 'facebook',
                        email: userResponse.email,
                        name: userResponse.name,
                        firstName: userResponse.first_name,
                        lastName: userResponse.last_name,
                        picture: userResponse.picture?.data?.url,
                        lastLogin: new Date().toISOString()
                    };
                    
                    this.setButtonState('facebook', 'success');
                    this.storeAuthenticationData('facebook');
                    this.dispatchSignInCompleted('facebook');
                });
            } else {
                throw new Error('Facebook authentication failed');
            }
        }
        
        /**
         * Set button visual state
         */
        setButtonState(provider, state) {
            const button = this.component.querySelector(`[data-provider="${provider}"]`);
            if (!button) return;
            
            switch (state) {
                case 'loading':
                    button.style.opacity = '0.7';
                    button.style.pointerEvents = 'none';
                    break;
                    
                case 'success':
                    button.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        this.setButtonState(provider, 'idle');
                    }, 2000);
                    break;
                    
                case 'error':
                    button.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        this.setButtonState(provider, 'idle');
                    }, 3000);
                    break;
                    
                case 'idle':
                default:
                    button.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    break;
            }
        }
        
        /**
         * Store authentication data
         */
        storeAuthenticationData(provider) {
            if (window.handlerData && window.handlerData['shared handler data']) {
                const sharedData = window.handlerData['shared handler data'][0];
                
                if (!sharedData.authentication) {
                    sharedData.authentication = {
                        currentUser: null,
                        activeProvider: null,
                        sessionToken: null,
                        lastSignInTime: null
                    };
                }
                
                sharedData.authentication.currentUser = this.userProfiles[provider];
                sharedData.authentication.activeProvider = provider;
                sharedData.authentication.sessionToken = this.authTokens[provider];
                sharedData.authentication.lastSignInTime = new Date().toISOString();
            }
            
            try {
                sessionStorage.setItem(`${provider}_auth_token`, JSON.stringify(this.authTokens[provider]));
                sessionStorage.setItem(`${provider}_user_profile`, JSON.stringify(this.userProfiles[provider]));
            } catch (error) {
                console.warn('Could not store auth data in sessionStorage:', error);
            }
        }
        
        /**
         * Dispatch sign-in completed event
         */
        dispatchSignInCompleted(provider) {
            this.component.dispatchEvent(new CustomEvent('signInCompleted', {
                detail: {
                    provider: provider,
                    componentId: this.componentId,
                    userInfo: this.userProfiles[provider],
                    tokens: this.authTokens[provider],
                    timestamp: Date.now()
                }
            }));
            
            console.log(`${provider} Sign In completed successfully:`, this.userProfiles[provider]);
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
         * Attach event listeners
         */
        attachEventListeners() {
            // Listen for configuration updates
            this.component.addEventListener('updateConfig', (e) => {
                this.config = { ...this.config, ...e.detail };
                this.renderButtonGallery();
            });
        }
        
        /**
         * Setup integration with Events Handler system
         */
        setupEventsHandlerIntegration() {
            if (window.EventsHandler) {
                console.log('Unified Sign In integrated with Events Handler');
            }
            
            this.component.addEventListener('handleComponentSelect', (e) => {
                console.log('Unified Sign In component selected:', this.componentId);
            });
        }
        
        /**
         * Handle errors
         */
        handleError(errorType, error, provider = 'unknown') {
            console.error(`${provider} Sign In Error [${errorType}]:`, error);
            
            this.setButtonState(provider, 'error');
            
            this.component.dispatchEvent(new CustomEvent('signInError', {
                detail: {
                    provider: provider,
                    componentId: this.componentId,
                    error: error.message || 'Sign In failed',
                    errorCode: errorType,
                    originalError: error,
                    timestamp: Date.now()
                }
            }));
        }
        
        /**
         * Get user profile for specific provider
         */
        getUserProfile(provider) {
            return this.userProfiles[provider] || null;
        }
        
        /**
         * Get auth token for specific provider
         */
        getAuthToken(provider) {
            return this.authTokens[provider] || null;
        }
        
        /**
         * Check if user is signed in with any provider
         */
        isSignedIn() {
            return Object.keys(this.userProfiles).length > 0;
        }
        
        /**
         * Get all signed-in providers
         */
        getSignedInProviders() {
            return Object.keys(this.userProfiles);
        }
    }
    
    // Export UnifiedSignInComponent for use by factory
    window.UnifiedSignInComponent = UnifiedSignInComponent;
    
    console.log('Unified Sign In component class loaded');
    
})();
