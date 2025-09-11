(function() {
    // Base User Component Resize Behavior.js - Reactive resize handling
    
    const components = document.querySelectorAll('.base-user-component:not(.gallery-child):not(.gallery-component)');
    if (!components.length) {
        console.log('No components found for resize behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.resizeBehaviorInitialized) return;
        component.dataset.resizeBehaviorInitialized = 'true';

        console.log('Resize behavior attached to:', component.id);

        // ✅ NEW: Updated event listener to match simplified Events Handler
        component.addEventListener('startResize', (e) => {
            const {mouse, handle} = e.detail;
            handleResizeStart(component, mouse, handle);
        });

        // Reactive event listeners - respond to Events Handler
        let addHandlesTimeout = null;
        let removeHandlesTimeout = null;

        component.addEventListener('showResizeHandles', () => {
            // Clear any pending remove operation
            if (removeHandlesTimeout) {
                clearTimeout(removeHandlesTimeout);
                removeHandlesTimeout = null;
            }
            
            // Debounce add operation
            if (!addHandlesTimeout) {
                addHandlesTimeout = setTimeout(() => {
                    addResizeHandles(component);
                    addHandlesTimeout = null;
                }, 10);
            }
        });

        component.addEventListener('hideResizeHandles', () => {
        // Clear any pending add operation
        if (addHandlesTimeout) {
            clearTimeout(addHandlesTimeout);
            addHandlesTimeout = null;
        }
        
        // Debounce remove operation
        if (!removeHandlesTimeout) {
            removeHandlesTimeout = setTimeout(() => {
                removeResizeHandles(component);
                removeHandlesTimeout = null;
            }, 10);
        }
        });

        // ✅ UPDATED: Live resize events - Fixed structure
        component.addEventListener('liveResize', (e) => {
            const {mouse, handle} = e.detail; // ✅ Fixed: was {handle, liveMouse}
            updateLiveResize(component, handle, mouse);
        });

        // ✅ UPDATED: Complete resize events
        component.addEventListener('completeResize', (e) => {
            const mouse = e.detail; // ✅ Fixed: mouse object directly
            completeResize(component, mouse);
        });

        // Clean up old event listeners that are no longer used
        component.addEventListener('resetOperationState', () => {
            removeResizeHandles(component);
            delete component.dataset.resizeStartPosition;
        });
    });

    // ✅ NEW: Handle resize start from Events Handler routing
    function handleResizeStart(component, mouse, handle) {
        // Start resize operation via Events Handler API
        if (window.EventsHandler) {
            window.EventsHandler.start('resize', component, handle);
        }
    }
    
    function addResizeHandles(component) {
        // Check if handles already exist
        const existingHandles = component.querySelectorAll('.resize-handle');
        if (existingHandles.length > 0) {
            console.log('Resize handles already exist for:', component.id);
            return;
        }

        // Remove existing handles first
        removeResizeHandles(component);
        
        // Determine which handles to add based on component classes
        let handles = [];
        
        if (component.classList.contains('ResizableX')) {
            // Only horizontal resize handles
            handles = ['e', 'w'];
        } else if (component.classList.contains('ResizableY')) {
            // Only vertical resize handles
            handles = ['n', 's'];
        } else if (component.classList.contains('ResizableXorYAxis')) {
            // All resize handles (both axes and corners)
            handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        } else {
            // No resize class found, skip adding handles
            console.log('No resize class found for:', component.id);
            return;
        }
        
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
        
        console.log(`Resize handles (${handles.join(', ')}) added to:`, component.id);
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

    // ✅ UPDATED: Fixed parameter name and structure
    function updateLiveResize(element, handle, mouse) {
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
        
        // ✅ UPDATED: Use totalDeltaX/Y from mouse object
        applyLiveResize(element, handle, mouse.totalDeltaX, mouse.totalDeltaY, startPosition);
    }

    // ✅ NEW: Complete resize function
    function completeResize(component, mouse) {
        // Clean up the start position after resize completion
        delete component.dataset.resizeStartPosition;
        console.log('Resize operation completed for:', component.id);
        // Note: Resize already applied via live updates, no need to apply again
    }

    function applyLiveResize(element, handle, deltaX, deltaY, startPosition) {
        const resizeOperations = {
            'nw': () => {
                let newWidth = startPosition.width - deltaX;
                let newHeight = startPosition.height - deltaY;
                let newLeft = startPosition.left + deltaX;
                let newTop = startPosition.top + deltaY;
                
                // Apply coordinated snapping for corner handles
                if (typeof window.applySnapping === 'function') {
                    // For corner handles, calculate the bottom-right corner first
                    const rightEdge = startPosition.left + startPosition.width;
                    const bottomEdge = startPosition.top + startPosition.height;
                    
                    // Snap the new top-left position
                    const snappedPos = window.applySnapping(newLeft, newTop, false);
                    newLeft = snappedPos.x;
                    newTop = snappedPos.y;
                    
                    // Calculate dimensions from snapped position to maintain bottom-right
                    newWidth = rightEdge - newLeft;
                    newHeight = bottomEdge - newTop;
                }
                
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
            },
            'ne': () => {
                let newWidth = startPosition.width + deltaX;
                let newHeight = startPosition.height - deltaY;
                let newTop = startPosition.top + deltaY;
                
                // Apply coordinated snapping for corner handles
                if (typeof window.applySnapping === 'function') {
                    // Calculate the right edge and snap top position
                    const rightEdge = startPosition.left + newWidth;
                    const bottomEdge = startPosition.top + startPosition.height;
                    
                    // Snap the right edge and top position
                    const snappedRight = window.applySnapping(rightEdge, 0, false);
                    const snappedTop = window.applySnapping(0, newTop, false);
                    
                    newWidth = snappedRight.x - startPosition.left;
                    newTop = snappedTop.y;
                    newHeight = bottomEdge - newTop;
                }
                
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
                element.style.top = `${newTop}px`;
            },
            'sw': () => {
                let newWidth = startPosition.width - deltaX;
                let newHeight = startPosition.height + deltaY;
                let newLeft = startPosition.left + deltaX;
                
                // Apply coordinated snapping for corner handles
                if (typeof window.applySnapping === 'function') {
                    // Calculate the right edge and bottom edge
                    const rightEdge = startPosition.left + startPosition.width;
                    const bottomEdge = startPosition.top + newHeight;
                    
                    // Snap the left position and bottom edge
                    const snappedLeft = window.applySnapping(newLeft, 0, false);
                    const snappedBottom = window.applySnapping(0, bottomEdge, false);
                    
                    newLeft = snappedLeft.x;
                    newWidth = rightEdge - newLeft;
                    newHeight = snappedBottom.y - startPosition.top;
                }
                
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
                element.style.left = `${newLeft}px`;
            },
            'se': () => {
                let newWidth = startPosition.width + deltaX;
                let newHeight = startPosition.height + deltaY;
                
                // Apply snapping to the bottom-right corner
                if (typeof window.applySnapping === 'function') {
                    const rightEdge = startPosition.left + newWidth;
                    const bottomEdge = startPosition.top + newHeight;
                    const snapped = window.applySnapping(rightEdge, bottomEdge, false);
                    newWidth = snapped.x - startPosition.left;
                    newHeight = snapped.y - startPosition.top;
                }
                
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
            },
            'n': () => {
                let newHeight = startPosition.height - deltaY;
                let newTop = startPosition.top + deltaY;
                
                // Apply coordinated snapping for edge handles
                if (typeof window.applySnapping === 'function') {
                    const bottomEdge = startPosition.top + startPosition.height;
                    const snappedTop = window.applySnapping(0, newTop, false);
                    newTop = snappedTop.y;
                    newHeight = bottomEdge - newTop;
                }
                
                element.style.height = `${newHeight}px`;
                element.style.top = `${newTop}px`;
            },
            's': () => {
                let newHeight = startPosition.height + deltaY;
                
                // Apply snapping to bottom edge
                if (typeof window.applySnapping === 'function') {
                    const bottomEdge = startPosition.top + newHeight;
                    const snapped = window.applySnapping(0, bottomEdge, false);
                    newHeight = snapped.y - startPosition.top;
                }
                
                element.style.height = `${newHeight}px`;
            },
            'e': () => {
                let newWidth = startPosition.width + deltaX;
                
                // Apply snapping to right edge
                if (typeof window.applySnapping === 'function') {
                    const rightEdge = startPosition.left + newWidth;
                    const snapped = window.applySnapping(rightEdge, 0, false);
                    newWidth = snapped.x - startPosition.left;
                }
                
                element.style.width = `${newWidth}px`;
            },
            'w': () => {
                let newWidth = startPosition.width - deltaX;
                let newLeft = startPosition.left + deltaX;
                
                // Apply coordinated snapping for edge handles
                if (typeof window.applySnapping === 'function') {
                    const rightEdge = startPosition.left + startPosition.width;
                    const snappedLeft = window.applySnapping(newLeft, 0, false);
                    newLeft = snappedLeft.x;
                    newWidth = rightEdge - newLeft;
                }
                
                element.style.width = `${newWidth}px`;
                element.style.left = `${newLeft}px`;
            }
        };
        
        resizeOperations[handle]?.();
    }
})();