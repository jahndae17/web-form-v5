(function() {
    // Base User Component Resize Behavior.js - Reactive resize handling
    
    const components = document.querySelectorAll('.base-user-component');
    if (!components.length) {
        console.log('No components found for resize behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.resizeBehaviorInitialized) return;
        component.dataset.resizeBehaviorInitialized = 'true';

        console.log('Resize behavior attached to:', component.id);

        // Reactive event listeners - respond to Events Handler
        component.addEventListener('addResizeHandles', () => {
            addResizeHandles(component);
        });

        component.addEventListener('removeResizeHandles', () => {
            removeResizeHandles(component);
        });

        component.addEventListener('resizeElement', (e) => {
            // Clean up the start position after resize completion
            delete component.dataset.resizeStartPosition;
            
            console.log('Resize operation completed for:', component.id);
            // Note: Resize already applied via live updates, no need to apply again
            // const {handle, deltaX, deltaY} = e.detail;
            // resizeElement(component, handle, deltaX, deltaY);
        });

        // Live resize events - FIX: Extract both handle and liveMouse
        component.addEventListener('liveResize', (e) => {
            const {handle, liveMouse} = e.detail;
            updateLiveResize(component, handle, liveMouse);
        });

        component.addEventListener('dragResizeComplete', (e) => {
            const completionMouse = e.detail;
            console.log('Resize completed for:', component.id);
            // Resize already applied live
        });
    });
    
    function addResizeHandles(component) {
        // Remove existing handles first
        removeResizeHandles(component);
        
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        handles.forEach(handle => {
            const div = document.createElement('div');
            div.className = `resize-handle ${handle}`;
            div.style.cssText = `position:absolute;opacity:0;cursor:${getCursor(handle)};pointer-events:auto;`;
            div.style.width = handle === 'n' || handle === 's' ? '100%' : '10px';
            div.style.height = handle === 'e' || handle === 'w' ? '100%' : '10px';
            div.dataset.handle = handle;

            // Position the handle
            const positions = {
                'nw': 'top:-5px;left:-5px', 'ne': 'top:-5px;right:-5px',
                'sw': 'bottom:-5px;left:-5px', 'se': 'bottom:-5px;right:-5px',
                'n': 'top:-5px;left:0', 's': 'bottom:-5px;left:0',
                'e': 'top:0;right:-5px', 'w': 'top:0;left:-5px'
            };
            div.style.cssText += positions[handle];

            component.appendChild(div);
        });
        
        console.log('Resize handles added to:', component.id);
    }

    function removeResizeHandles(component) {
        const handles = component.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
        if (handles.length > 0) {
            console.log('Resize handles removed from:', component.id);
        }
    }

    function getCursor(handle) {
        const cursors = {
            'nw': 'nw-resize', 'se': 'nw-resize',
            'ne': 'ne-resize', 'sw': 'ne-resize',
            'n': 'ns-resize', 's': 'ns-resize',
            'e': 'ew-resize', 'w': 'ew-resize'
        };
        return cursors[handle];
    }

    function updateLiveResize(element, handle, liveMouse) {
        // Use element dataset to track start position (survives across calls)
        if (!element.dataset.resizeStartPosition) {
            const rect = element.getBoundingClientRect();
            element.dataset.resizeStartPosition = JSON.stringify({
                width: rect.width,
                height: rect.height,
                left: parseInt(element.style.left || 0),
                top: parseInt(element.style.top || 0)
            });
        }
        
        const startPosition = JSON.parse(element.dataset.resizeStartPosition);
        
        // Use total deltas for cumulative resize effect
        applyLiveResize(element, handle, liveMouse.totalDeltaX, liveMouse.totalDeltaY, startPosition);
    }

    function applyLiveResize(element, handle, deltaX, deltaY, startPosition) {
        const resizeOperations = {
            'nw': () => {
                element.style.width = `${startPosition.width - deltaX}px`;
                element.style.height = `${startPosition.height - deltaY}px`;
                element.style.left = `${startPosition.left + deltaX}px`;
                element.style.top = `${startPosition.top + deltaY}px`;
            },
            'ne': () => {
                element.style.width = `${startPosition.width + deltaX}px`;
                element.style.height = `${startPosition.height - deltaY}px`;
                element.style.top = `${startPosition.top + deltaY}px`;
            },
            'sw': () => {
                element.style.width = `${startPosition.width - deltaX}px`;
                element.style.height = `${startPosition.height + deltaY}px`;
                element.style.left = `${startPosition.left + deltaX}px`;
            },
            'se': () => {
                element.style.width = `${startPosition.width + deltaX}px`;
                element.style.height = `${startPosition.height + deltaY}px`;
            },
            'n': () => {
                element.style.height = `${startPosition.height - deltaY}px`;
                element.style.top = `${startPosition.top + deltaY}px`;
            },
            's': () => {
                element.style.height = `${startPosition.height + deltaY}px`;
            },
            'e': () => {
                element.style.width = `${startPosition.width + deltaX}px`;
            },
            'w': () => {
                element.style.width = `${startPosition.width - deltaX}px`;
                element.style.left = `${startPosition.left + deltaX}px`;
            }
        };
        
        resizeOperations[handle]?.();
    }
})();