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
            console.log('addResizeHandles event received for:', component.id);
            addResizeHandles(component);
        });

        component.addEventListener('removeResizeHandles', () => {
            console.log('removeResizeHandles event received for:', component.id);
            removeResizeHandles(component);
        });

        component.addEventListener('resizeElement', (e) => {
            console.log('resizeElement event received for:', component.id);
            const {handle, deltaX, deltaY} = e.detail;
            resizeElement(component, handle, deltaX, deltaY);
        });

        // Live resize events
        component.addEventListener('liveResize', (e) => {
            const liveMouse = e.detail;
            updateLiveResize(component, liveMouse);
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

    function resizeElement(element, handle, dx, dy) {
        const rect = element.getBoundingClientRect();
        const resizeOperations = {
            'nw': () => {
                element.style.width = `${rect.width - dx}px`;
                element.style.height = `${rect.height - dy}px`;
                element.style.top = `${rect.top + dy}px`;
                element.style.left = `${rect.left + dx}px`;
            },
            'ne': () => {
                element.style.width = `${rect.width + dx}px`;
                element.style.height = `${rect.height - dy}px`;
                element.style.top = `${rect.top + dy}px`;
            },
            'sw': () => {
                element.style.width = `${rect.width - dx}px`;
                element.style.height = `${rect.height + dy}px`;
                element.style.left = `${rect.left + dx}px`;
            },
            'se': () => {
                element.style.width = `${rect.width + dx}px`;
                element.style.height = `${rect.height + dy}px`;
            },
            'n': () => {
                element.style.height = `${rect.height - dy}px`;
                element.style.top = `${rect.top + dy}px`;
            },
            's': () => {
                element.style.height = `${rect.height + dy}px`;
            },
            'e': () => {
                element.style.width = `${rect.width + dx}px`;
            },
            'w': () => {
                element.style.width = `${rect.width - dx}px`;
                element.style.left = `${rect.left + dx}px`;
            }
        };
        
        resizeOperations[handle]?.();
        console.log('Element resized:', element.id, 'handle:', handle);
    }

    function updateLiveResize(element, liveMouse) {
        // Get current state from Events Handler
        const state = window.EventsHandler?.getState();
        if (!state || !state.handle) return;

        if (!state.resizeStartPosition) {
            const rect = element.getBoundingClientRect();
            state.resizeStartPosition = {
                width: rect.width,
                height: rect.height,
                left: parseInt(element.style.left || 0),
                top: parseInt(element.style.top || 0)
            };
        }
        
        // Apply live resize transformation based on handle using cumulative deltas
        applyLiveResize(element, state.handle, liveMouse.deltaX, liveMouse.deltaY, state.resizeStartPosition);
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