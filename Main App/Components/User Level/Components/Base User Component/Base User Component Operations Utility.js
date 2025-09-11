// Base User Component Operations Utility
// Centralized utility functions for common drag operations
// Used by Move, Nesting, and Reorder behaviors to avoid code duplication

(function() {
    'use strict';
    
    // === COORDINATE CALCULATION UTILITIES ===
    
    /**
     * Calculates element position based on mouse coordinates and stored drag offset
     * Handles coordinate system conversion between absolute and relative positioning
     * @param {Object} mouse - Mouse state object with x, y coordinates
     * @param {HTMLElement} element - Element being dragged
     * @returns {Object} - {left, top} coordinates for positioning, or null if offsets not set
     */
    function calculateDragPosition(mouse, element) {
        if (!element.dataset.dragOffset || !element.dataset.parentOffset) {
            console.warn('Drag offsets not set for element:', element.id);
            return null;
        }
        
        const dragOffset = JSON.parse(element.dataset.dragOffset);
        const parentOffset = JSON.parse(element.dataset.parentOffset);
        
        // Calculate desired component position in absolute coordinates
        const absoluteLeft = mouse.x - dragOffset.x;
        const absoluteTop = mouse.y - dragOffset.y;
        
        // Convert to relative coordinates by subtracting parent offset
        const relativeLeft = absoluteLeft - parentOffset.x;
        const relativeTop = absoluteTop - parentOffset.y;
        
        return {
            left: relativeLeft,
            top: relativeTop
        };
    }
    
    /**
     * Stores drag offset and parent offset for coordinate calculations
     * @param {HTMLElement} element - Element to store offsets for
     * @param {Object} mouse - Mouse state object with x, y coordinates
     */
    function storeDragOffsets(element, mouse) {
        // Use absolute position from getBoundingClientRect for proper coordinate matching
        const rect = element.getBoundingClientRect();
        element.dataset.dragOffset = JSON.stringify({
            x: mouse.x - rect.left,
            y: mouse.y - rect.top
        });
        
        // Store the parent offset to convert between coordinate systems
        const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : {left: 0, top: 0};
        element.dataset.parentOffset = JSON.stringify({
            x: parentRect.left,
            y: parentRect.top
        });
    }
    
    /**
     * Clears stored drag offsets from element
     * @param {HTMLElement} element - Element to clear offsets from
     */
    function clearDragOffsets(element) {
        delete element.dataset.dragOffset;
        delete element.dataset.parentOffset;
    }
    
    // === VISUAL STATE UTILITIES ===
    
    const OPERATION_STYLES = {
        move: {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            zIndex: null
        },
        nesting: {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0, 150, 255, 0.4)',
            border: '2px dashed #0096ff',
            opacity: '0.8'
        },
        reorder: {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            zIndex: '1000'
        }
    };
    
    /**
     * Applies visual styling for drag operations
     * @param {HTMLElement} element - Element to style
     * @param {string} operation - Operation type: 'move', 'nesting', 'reorder'
     */
    function applyOperationVisuals(element, operation) {
        const styles = OPERATION_STYLES[operation];
        if (!styles) {
            console.warn('Unknown operation type:', operation);
            return;
        }
        
        Object.entries(styles).forEach(([property, value]) => {
            if (value !== null) {
                element.style[property] = value;
            }
        });
    }
    
    /**
     * Clears all operation-related visual styling
     * @param {HTMLElement} element - Element to clear styling from
     * @param {boolean} preserveSelection - Whether to preserve selection visuals
     */
    function clearOperationVisuals(element, preserveSelection = true) {
        // Clear common operation styles
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.zIndex = '';
        element.style.opacity = '';
        
        // Clear nesting-specific border (dashed), preserve selection border
        if (element.style.border && element.style.border.includes('dashed')) {
            if (preserveSelection && element.classList.contains('selected')) {
                element.style.border = '2px solid #007ACC';
            } else {
                element.style.border = '';
            }
        }
        
        // Preserve selection background if requested
        if (preserveSelection && element.classList.contains('selected')) {
            element.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
        }
    }
    
    /**
     * Updates element position with optional snapping
     * @param {HTMLElement} element - Element to position
     * @param {Object} position - {left, top} coordinates
     * @param {boolean} useSnapping - Whether to apply snapping
     */
    function updateElementPosition(element, position, useSnapping = true) {
        let finalLeft = position.left;
        let finalTop = position.top;
        
        // Apply snapping if available and requested
        if (useSnapping && typeof window.applySnapping === 'function') {
            const snapped = window.applySnapping(finalLeft, finalTop, false);
            finalLeft = snapped.x;
            finalTop = snapped.y;
        }
        
        element.style.left = finalLeft + 'px';
        element.style.top = finalTop + 'px';
    }
    
    // === EDGE DETECTION UTILITIES ===
    
    /**
     * Determines if mouse position is near component edges for resize detection
     * @param {HTMLElement} element - Element to check against
     * @param {number} mouseX - Mouse X coordinate
     * @param {number} mouseY - Mouse Y coordinate
     * @param {number} threshold - Distance threshold for "near" detection (default: 10px)
     * @returns {boolean} - True if mouse is near any edge
     */
    function isNearComponentEdge(element, mouseX, mouseY, threshold = 10) {
        const rect = element.getBoundingClientRect();
        
        // Calculate distances to each edge
        const nearLeft = mouseX >= rect.left && mouseX <= rect.left + threshold;
        const nearRight = mouseX >= rect.right - threshold && mouseX <= rect.right;
        const nearTop = mouseY >= rect.top && mouseY <= rect.top + threshold;
        const nearBottom = mouseY >= rect.bottom - threshold && mouseY <= rect.bottom;
        
        // Return true if near any edge
        return nearLeft || nearRight || nearTop || nearBottom;
    }
    
    // === GALLERY UTILITIES ===
    
    /**
     * Clears all gallery reorder indicator elements
     */
    function clearGalleryReorderIndicators() {
        const indicators = document.querySelectorAll('.gallery-reorder-indicator');
        indicators.forEach(indicator => indicator.remove());
    }
    
    // === PUBLIC API ===
    window.OperationsUtility = {
        // Coordinate utilities
        calculateDragPosition,
        storeDragOffsets,
        clearDragOffsets,
        
        // Visual utilities  
        applyOperationVisuals,
        clearOperationVisuals,
        updateElementPosition,
        
        // Edge detection utilities
        isNearComponentEdge,
        
        // Gallery utilities
        clearGalleryReorderIndicators
    };
    
    console.log('Operations Utility loaded - provides centralized drag operation functions');
})();
