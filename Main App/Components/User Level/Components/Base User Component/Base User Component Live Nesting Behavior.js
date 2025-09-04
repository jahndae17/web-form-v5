(function() {
    // Base User Component Live Nesting Behavior.js - Reactive live nesting handling
    
    const components = document.querySelectorAll('.base-user-component');
    if (!components.length) {
        console.log('No components found for live nesting behavior, exiting script');
        return;
    }

    components.forEach(component => {
        // Skip if already initialized
        if (component.dataset.liveNestingInitialized) return;
        component.dataset.liveNestingInitialized = 'true';

        console.log('Live nesting behavior attached to:', component.id);

        // Live nesting updates during drag
        component.addEventListener('liveNesting', (e) => {
            const {liveMouse, inputs} = e.detail;
            updateLiveNesting(component, liveMouse);
        });

        // Nesting completion
        component.addEventListener('completeNesting', (e) => {
            const {completionMouse, inputs} = e.detail;
            handleNestingCompletion(component, completionMouse, inputs);
        });

        // Visual cleanup
        component.addEventListener('cleanupNestingVisuals', () => {
            cleanupNestingVisuals(component);
        });
    });

    // Global event listener for clearing highlights
    document.addEventListener('clearNestingHighlights', () => {
        clearNestingHighlights();
    });

    function updateLiveNesting(element, liveMouse) {
        // Clear previous highlights
        clearNestingHighlights();
        
        // Find potential drop target using correct mouse coordinates
        const potentialTarget = findPotentialDropTarget(liveMouse.x, liveMouse.y, element);
        
        if (potentialTarget) {
            potentialTarget.style.outline = '3px solid #0096ff';
            potentialTarget.style.backgroundColor = 'rgba(0, 150, 255, 0.1)';
            potentialTarget.dataset.nestingTarget = 'true';
            console.log('Highlighting potential drop target:', potentialTarget.id);
        }
        
        // Update dragged element position with frame delta - fix NaN issue
        const currentLeft = parseInt(element.style.left) || 0;
        const currentTop = parseInt(element.style.top) || 0;
        
        const newLeft = currentLeft + (liveMouse.deltaX || 0);
        const newTop = currentTop + (liveMouse.deltaY || 0);
        
        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 8px 16px rgba(0, 150, 255, 0.4)';
        element.style.border = '2px dashed #0096ff';
        element.style.opacity = '0.8';
        
        console.log(`Live nesting: ${element.id} at (${newLeft}, ${newTop})`);
    }

    function handleNestingCompletion(element, completionMouse, inputs) {
        // Use current element position instead of calculating from deltas
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Find target at current position
        element.style.visibility = 'hidden';
        const targetElement = document.elementFromPoint(centerX, centerY);
        element.style.visibility = 'visible';
        
        // Validate nesting target
        if (targetElement && 
            targetElement.classList.contains('acceptsChildren') && 
            targetElement !== element &&
            !targetElement.contains(element) &&
            targetElement !== element.parentElement) {
            
            console.log('Nesting into target:', targetElement.id);
            performNesting(element, targetElement);
        } else {
            console.log('No valid nesting target, performing regular move');
            // Dispatch move completion instead
            element.dispatchEvent(new CustomEvent('dragMoveComplete', {detail: completionMouse}));
        }
        
        // Clean up
        cleanupNestingVisuals(element);
        clearNestingHighlights();
    }

    function performNesting(nestableComponent, targetContainer) {
        // Calculate relative position within new parent
        const containerRect = targetContainer.getBoundingClientRect();
        const componentRect = nestableComponent.getBoundingClientRect();
        
        const relativeX = componentRect.left - containerRect.left;
        const relativeY = componentRect.top - containerRect.top;
        
        // Ensure target container has relative positioning
        if (getComputedStyle(targetContainer).position === 'static') {
            targetContainer.style.position = 'relative';
        }
        
        // Move component to new parent
        targetContainer.appendChild(nestableComponent);
        
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
        const components = document.querySelectorAll('.base-user-component');
        let potentialTarget = null;
        
        components.forEach(comp => {
            if (comp === excludeElement) return;
            if (!comp.classList.contains('acceptsChildren')) return;
            
            const rect = comp.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                potentialTarget = comp;
            }
        });
        
        return potentialTarget;
    }

    function cleanupNestingVisuals(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.border = '';
        element.style.opacity = '';
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
