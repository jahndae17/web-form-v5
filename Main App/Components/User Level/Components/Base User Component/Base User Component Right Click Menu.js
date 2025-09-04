// Base User Component Right Click Menu
// Provides context menu functionality for base user components
// Includes option to convert to gallery component

(function() {
    let contextMenu = null;
    let targetComponent = null;
    
    // Initialize right-click menu for all base user components
    function initializeRightClickMenu() {
        const components = document.querySelectorAll('.base-user-component');
        
        components.forEach(component => {
            // Remove existing listeners to prevent duplicates
            component.removeEventListener('contextmenu', handleRightClick);
            component.addEventListener('contextmenu', handleRightClick);
        });
        
        // Note: System events like click/mouseup handled by Events Handler
        // This component only handles its specific contextmenu interactions
    }
    
    // Handle right-click on component
    function handleRightClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        targetComponent = e.currentTarget;
        
        // Don't show menu if this is already a gallery component
        if (targetComponent.classList.contains('gallery-component')) {
            return;
        }
        
        showContextMenu(e.clientX, e.clientY);
    }
    
    // Show context menu at specified position
    function showContextMenu(x, y) {
        closeContextMenu(); // Close any existing menu
        
        contextMenu = document.createElement('div');
        contextMenu.className = 'component-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="convert-to-gallery">
                <span class="menu-icon">📁</span>
                Convert to Gallery Component
            </div>
        `;
        
        // Position menu
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        
        // Add event listeners to menu items
        contextMenu.addEventListener('click', handleMenuClick);
        
        // Add to document
        document.body.appendChild(contextMenu);
        
        // Adjust position if menu goes off-screen
        adjustMenuPosition();
        
        // Add styles if not already present
        ensureMenuStyles();
    }
    
    // Handle menu item clicks
    function handleMenuClick(e) {
        e.stopPropagation();
        
        const menuItem = e.target.closest('.context-menu-item');
        if (!menuItem || !targetComponent) return;
        
        const action = menuItem.getAttribute('data-action');
        
        switch (action) {
            case 'convert-to-gallery':
                convertToGallery();
                break;
        }
        
        closeContextMenu();
    }
    
    // Convert base component to gallery component
    function convertToGallery() {
        if (!targetComponent || !window.GalleryComponentFactory) {
            console.error('Cannot convert to gallery: missing component or factory');
            return;
        }
        
        // Get current component properties
        const currentRect = targetComponent.getBoundingClientRect();
        const container = targetComponent.parentElement;
        const currentLeft = targetComponent.style.left;
        const currentTop = targetComponent.style.top;
        const currentWidth = targetComponent.style.width;
        
        // Remove the old component
        const componentId = targetComponent.id;
        targetComponent.remove();
        
        // Create new gallery component at same position
        const gallery = window.GalleryComponentFactory.createInstance({
            left: currentLeft,
            top: currentTop,
            width: currentWidth,
            container: container
        });
        
        // Fire custom event to notify of conversion
        const convertEvent = new CustomEvent('componentConverted', {
            detail: {
                originalId: componentId,
                newId: gallery.id,
                type: 'gallery'
            }
        });
        document.dispatchEvent(convertEvent);
        
        console.log(`Converted ${componentId} to gallery component ${gallery.id}`);
    }
    
    // Close context menu
    function closeContextMenu() {
        if (contextMenu) {
            contextMenu.remove();
            contextMenu = null;
        }
        targetComponent = null;
    }
    
    // Adjust menu position to stay on screen
    function adjustMenuPosition() {
        if (!contextMenu) return;
        
        const menuRect = contextMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position
        if (menuRect.right > viewportWidth) {
            contextMenu.style.left = (viewportWidth - menuRect.width - 10) + 'px';
        }
        
        // Adjust vertical position
        if (menuRect.bottom > viewportHeight) {
            contextMenu.style.top = (viewportHeight - menuRect.height - 10) + 'px';
        }
    }
    
    // Ensure menu styles are loaded
    function ensureMenuStyles() {
        if (!document.querySelector('style[data-component="context-menu"]')) {
            const style = document.createElement('style');
            style.setAttribute('data-component', 'context-menu');
            style.textContent = `
                .component-context-menu {
                    position: fixed;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    padding: 4px 0;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    min-width: 200px;
                }
                
                .context-menu-item {
                    padding: 8px 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: background-color 0.2s;
                }
                
                .context-menu-item:hover {
                    background-color: #f0f0f0;
                }
                
                .context-menu-item:active {
                    background-color: #e0e0e0;
                }
                
                .menu-icon {
                    margin-right: 8px;
                    font-size: 16px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Auto-initialize when script loads
    initializeRightClickMenu();
    
    // Re-initialize when new components are added
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.classList && e.target.classList.contains('base-user-component')) {
            setTimeout(initializeRightClickMenu, 100);
        }
    });
    
    // Also listen for component creation events
    document.addEventListener('componentCreated', function(e) {
        setTimeout(initializeRightClickMenu, 100);
    });
    
    console.log('Base User Component Right Click Menu initialized');
    
    // Export for manual re-initialization if needed
    window.BaseUserComponentRightClickMenu = {
        initialize: initializeRightClickMenu,
        close: closeContextMenu
    };
})();