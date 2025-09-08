(function() {
    // Base User Component Nesting Behavior.js - Reactive nesting handling with live updates
    
    const components = document.querySelectorAll('.base-user-component');
    if (!components.length) {
        console.log('No components found for nesting behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.nestingInitialized) return;
        component.dataset.nestingInitialized = 'true';

        console.log('Nesting behavior attached to:', component.id);

        // ✅ UPDATED: Live nesting updates during drag - Fixed event structure
        component.addEventListener('liveNesting', (e) => {
            const mouse = e.detail; // ✅ Mouse object directly (not {liveMouse, inputs})
            updateLiveNesting(component, mouse);
        });

        // ✅ UPDATED: Nesting completion - Fixed event structure
        component.addEventListener('completeNesting', (e) => {
            const mouse = e.detail; // ✅ Mouse object directly (not {completionMouse, inputs})
            handleNestingCompletion(component, mouse);
        });

        // ✅ UPDATED: Visual cleanup - Now called via 'cleanup' event
        component.addEventListener('cleanup', () => {
            cleanupNestingVisuals(component);
        });
    });

    // Global event listener for clearing highlights (this can stay the same)
    document.addEventListener('clearNestingHighlights', () => {
        clearNestingHighlights();
    });

    // ✅ UPDATED: Parameter name changed from liveMouse to mouse
    function updateLiveNesting(element, mouse) {
        // Clear previous highlights
        clearNestingHighlights();
        
        // Find potential drop target using correct mouse coordinates
        const potentialTarget = findPotentialDropTarget(mouse.x, mouse.y, element);
        
        if (potentialTarget) {
            potentialTarget.style.outline = '3px solid #0096ff';
            potentialTarget.style.backgroundColor = 'rgba(0, 150, 255, 0.1)';
            potentialTarget.dataset.nestingTarget = 'true';
        }
        
        // Update dragged element position using direct mouse-to-component calculation
        // Get the offset from mouse to component ONLY on first frame of drag
        if (!element.dataset.dragOffset && mouse.isDragging) {
            const rect = element.getBoundingClientRect();
            element.dataset.dragOffset = JSON.stringify({
                x: mouse.x - rect.left,
                y: mouse.y - rect.top
            });
        }
        
        // Calculate component position based on current mouse and original offset
        if (element.dataset.dragOffset) {
            const dragOffset = JSON.parse(element.dataset.dragOffset);
            
            // Calculate desired component position: nowMouseX - dragOffsetX
            const desiredLeft = mouse.x - dragOffset.x;
            const desiredTop = mouse.y - dragOffset.y;
            
            // Apply snapping to the component position
            let finalLeft = desiredLeft;
            let finalTop = desiredTop;
            
            if (typeof window.applySnapping === 'function') {
                const snapped = window.applySnapping(desiredLeft, desiredTop, false);
                finalLeft = snapped.x;
                finalTop = snapped.y;
            }
            
            element.style.left = finalLeft + 'px';
            element.style.top = finalTop + 'px';
        }
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 8px 16px rgba(0, 150, 255, 0.4)';
        element.style.border = '2px dashed #0096ff';
        element.style.opacity = '0.8';
    }

    // ✅ UPDATED: Parameter names and structure
    function handleNestingCompletion(element, mouse) {
        // Get inputs from handler data since it's not passed in event anymore
        const inputs = window.handlerData?.['shared handler data']?.[0]?.inputs;
        
        // Use current element position instead of calculating from deltas
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Find target at current position
        element.style.visibility = 'hidden';
        const targetElement = document.elementFromPoint(centerX, centerY);
        element.style.visibility = 'visible';
        
        // Validate nesting target
        console.log('Nesting validation:', {
            targetElement: targetElement?.id || targetElement?.tagName,
            hasAcceptsChildren: targetElement?.classList.contains('acceptsChildren'),
            isNotSameElement: targetElement !== element,
            targetDoesntContainElement: !targetElement?.contains(element),
            elementDoesntContainTarget: !element.contains(targetElement),
            isNotCurrentParent: targetElement !== element.parentElement
        });
        
        if (targetElement && 
            targetElement.classList.contains('acceptsChildren') && 
            targetElement !== element &&
            !element.contains(targetElement)) {  // Only prevent nesting into own descendant
            
            console.log('Nesting into target:', targetElement.id);
            performNesting(element, targetElement);
        } else {
            console.log('No valid nesting target, performing regular move');
            // Move completion is handled automatically by Events Handler
        }
        
        // Clean up
        cleanupNestingVisuals(element);
        clearNestingHighlights();
    }

    function performNesting(nestableComponent, targetContainer) {
        // Calculate relative position within new parent
        const containerRect = targetContainer.getBoundingClientRect();
        const componentRect = nestableComponent.getBoundingClientRect();
        
        let relativeX = componentRect.left - containerRect.left;
        let relativeY = componentRect.top - containerRect.top;
        
        // Special handling for mainCanvas - account for padding
        if (targetContainer.id === 'mainCanvas') {
            const containerStyle = getComputedStyle(targetContainer);
            const paddingLeft = parseInt(containerStyle.paddingLeft) || 0;
            const paddingTop = parseInt(containerStyle.paddingTop) || 0;
            relativeX -= paddingLeft;
            relativeY -= paddingTop;
        }
        
        // Ensure target container has relative positioning for absolute children
        // Special handling for mainCanvas to preserve flex layout and z-index
        if (targetContainer.id === 'mainCanvas') {
            // Canvas doesn't need position changes - it already handles positioned children
            // Don't modify its position to avoid z-index issues with sidebar
        } else if (getComputedStyle(targetContainer).position === 'static') {
            targetContainer.style.position = 'relative';
        }
        
        // Move component to new parent
        targetContainer.appendChild(nestableComponent);
        
        // Apply snapping to final position
        if (typeof window.applySnapping === 'function') {
            const snapped = window.applySnapping(relativeX, relativeY, false); // Don't show guidelines for final position
            relativeX = snapped.x;
            relativeY = snapped.y;
        }
        
        // Update position to be relative to new parent
        nestableComponent.style.left = relativeX + 'px';
        nestableComponent.style.top = relativeY + 'px';
        
        // Dispatch nesting events
        nestableComponent.dispatchEvent(new CustomEvent('componentNested', {
            detail: { 
                newParent: targetContainer,
                relativeX: relativeX,
                relativeY: relativeY
            }
        }));
        
        targetContainer.dispatchEvent(new CustomEvent('childComponentAdded', {
            detail: { 
                child: nestableComponent,
                relativeX: relativeX,
                relativeY: relativeY
            }
        }));
        
        console.log('Component successfully nested');
    }

    function findPotentialDropTarget(x, y, excludeElement) {
        // Check all elements that accept children (components and canvas)
        const allTargets = document.querySelectorAll('.acceptsChildren');
        let potentialTarget = null;
        
        allTargets.forEach(target => {
            if (target === excludeElement) return;
            if (excludeElement.contains(target)) return;  // Prevent nesting into own descendant
            
            const rect = target.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                potentialTarget = target;
            }
        });
        
        return potentialTarget;
    }

    function cleanupNestingVisuals(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.opacity = '';
        
        // Clear drag offset when nesting completes
        delete element.dataset.dragOffset;
        
        // Only clear nesting-specific border (dashed), preserve selection border
        if (element.style.border.includes('dashed')) {
            // Restore selection border if element is selected
            if (element.classList.contains('selected')) {
                element.style.border = '2px solid #007ACC';
            } else {
                element.style.border = '';
            }
        }
        
        console.log('Nesting visuals cleaned up for:', element.id);
    }

    function clearNestingHighlights() {
        const highlightedElements = document.querySelectorAll('[data-nesting-target="true"]');
        highlightedElements.forEach(element => {
            element.style.outline = '';
            element.style.backgroundColor = '';
            element.removeAttribute('data-nesting-target');
        });
    }
})();