// Gallery Component Move Behavior
// Drag and drop with indicator bar to reorder children in the gallery
// Extends base move behavior for gallery children to include reordering functionality
// Tie into Gallery Component Factory & Event Handler

(function() {
    // Gallery Component Move Behavior.js - Handles reordering of gallery children
    
    const galleryChildren = document.querySelectorAll('.gallery-child');
    if (!galleryChildren.length) {
        console.log('No gallery children found for move behavior, exiting script');
        return;
    }

    galleryChildren.forEach(child => {
        // Skip if already initialized
        if (child.dataset.galleryMoveInitialized) return;
        child.dataset.galleryMoveInitialized = 'true';

        console.log('Gallery move behavior attached to:', child.id);

        // Live move updates during drag - add reordering logic
        child.addEventListener('liveMove', (e) => {
            const liveMouse = e.detail;
            updateGalleryChildMove(child, liveMouse);
        });

        // Completion handling for gallery children
        child.addEventListener('resetOperationState', () => {
            cleanupGalleryMoveVisuals(child);
        });
    });

    function updateGalleryChildMove(element, liveMouse) {
        // Get the gallery parent
        const gallery = element.closest('.gallery-component');
        if (!gallery) return;

        // Apply standard move behavior first
        updateStandardMove(element, liveMouse);

        // Add gallery-specific reordering logic
        showReorderIndicator(element, liveMouse, gallery);
    }

    function updateStandardMove(element, liveMouse) {
        // Store drag offset using centralized utility
        if (!element.dataset.dragOffset && liveMouse.isDragging) {
            window.OperationsUtility.storeDragOffsets(element, liveMouse);
        }
        
        // Calculate and apply position using centralized utility
        if (element.dataset.dragOffset) {
            const { finalLeft, finalTop } = window.OperationsUtility.calculateDragPosition(element, liveMouse);
            
            element.style.left = finalLeft + 'px';
            element.style.top = finalTop + 'px';
        }
        
        // Apply operation visuals using centralized utility
        window.OperationsUtility.applyOperationVisuals(element, 'move');
    }

    function showReorderIndicator(draggedElement, liveMouse, gallery) {
        // Clear existing indicators
        window.OperationsUtility.clearGalleryReorderIndicators();

        // Get all gallery children except the dragged one
        const allChildren = Array.from(gallery.querySelectorAll('.gallery-child'))
            .filter(child => child !== draggedElement);

        // Find insertion point based on mouse Y position
        let insertionPoint = null;
        let insertAfter = null;

        for (let i = 0; i < allChildren.length; i++) {
            const child = allChildren[i];
            const rect = child.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;

            if (liveMouse.y < centerY) {
                insertionPoint = rect.top;
                insertAfter = i > 0 ? allChildren[i - 1] : null;
                break;
            }
        }

        // If no insertion point found, insert at the end
        if (!insertionPoint && allChildren.length > 0) {
            const lastChild = allChildren[allChildren.length - 1];
            const rect = lastChild.getBoundingClientRect();
            insertionPoint = rect.bottom + 4; // 4px gap indicator
            insertAfter = lastChild;
        }

        // Show reorder indicator
        if (insertionPoint) {
            showInsertionIndicator(insertionPoint, gallery);
            draggedElement.dataset.insertAfter = insertAfter ? insertAfter.id : 'beginning';
        }
    }

    function showInsertionIndicator(yPosition, gallery) {
        const indicator = document.createElement('div');
        indicator.className = 'gallery-reorder-indicator';
        indicator.style.cssText = `
            position: absolute;
            left: 10px;
            right: 10px;
            top: ${yPosition}px;
            height: 2px;
            background: #007acc;
            z-index: 999;
            pointer-events: none;
            box-shadow: 0 0 4px rgba(0, 122, 204, 0.5);
        `;

        gallery.appendChild(indicator);
    }

    function cleanupGalleryMoveVisuals(element) {
        // Handle reordering if needed
        const insertAfter = element.dataset.insertAfter;
        if (insertAfter) {
            performReorder(element, insertAfter);
            delete element.dataset.insertAfter;
        }

        // Clear operation visuals using centralized utility
        window.OperationsUtility.clearOperationVisuals(element);
        
        // Clear indicators using centralized utility
        window.OperationsUtility.clearGalleryReorderIndicators();
        
        // Preserve selection visuals after move cleanup
        if (element.classList.contains('selected')) {
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        }
        
        console.log('Gallery move visuals cleaned up for:', element.id);
    }

    function performReorder(element, insertAfterId) {
        const gallery = element.closest('.gallery-component');
        if (!gallery) return;

        if (insertAfterId === 'beginning') {
            // Insert at beginning
            gallery.insertBefore(element, gallery.firstElementChild);
        } else {
            // Insert after specific element
            const insertAfterElement = document.getElementById(insertAfterId);
            if (insertAfterElement && insertAfterElement.nextSibling) {
                gallery.insertBefore(element, insertAfterElement.nextSibling);
            } else {
                // Insert at end
                gallery.appendChild(element);
            }
        }

        // Update gallery layout after reordering
        if (window.GalleryComponentFactory) {
            window.GalleryComponentFactory.updateChildWidths(gallery);
            window.GalleryComponentFactory.updateGalleryHeight(gallery);
        }

        console.log('Gallery child reordered:', element.id);
    }
})();