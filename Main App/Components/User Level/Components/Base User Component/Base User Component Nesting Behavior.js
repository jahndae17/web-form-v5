(function() {
    // Base User Component Nesting Behavior.js - Reactive nesting handling
    
    const component = document.querySelector('.base-user-component');
    if (!component) {
        console.log('No component found for nesting behavior, exiting script');
        return;
    }

    console.log('Nesting behavior attached to:', component.id);

    const inputs = window.handlerData['shared handler data'][0]['inputs'];

    // Listen for drag move completion to check for nesting opportunities
    component.addEventListener('dragMove', (e) => {
        // Only process if this component is nestable
        if (!component.classList.contains('isNestable')) return;
        
        const deltaX = e.detail.deltaX;
        const deltaY = e.detail.deltaY;
        
        // Calculate final position
        const currentLeft = parseInt(component.style.left || 0);
        const currentTop = parseInt(component.style.top || 0);
        const finalX = currentLeft + deltaX;
        const finalY = currentTop + deltaY;
        
        // Find element at the center of the component's final position
        const componentRect = component.getBoundingClientRect();
        const centerX = componentRect.left + componentRect.width / 2 + deltaX;
        const centerY = componentRect.top + componentRect.height / 2 + deltaY;
        
        // Temporarily hide component to get element underneath
        component.style.visibility = 'hidden';
        const targetElement = document.elementFromPoint(centerX, centerY);
        component.style.visibility = 'visible';
        
        // Check if target accepts children and is different from current parent
        if (targetElement && 
            targetElement.classList.contains('acceptsChildren') && 
            targetElement !== component.parentElement) {
            
            console.log('Nesting component into target:', targetElement);
            
            // Perform nesting operation
            nestComponent(component, targetElement, finalX, finalY);
        }
    });

    function nestComponent(nestableComponent, targetContainer, absoluteX, absoluteY) {
        // Calculate relative position within new parent
        const containerRect = targetContainer.getBoundingClientRect();
        const relativeX = absoluteX - containerRect.left;
        const relativeY = absoluteY - containerRect.top;
        
        // Ensure target container has relative positioning for absolute children
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
})();