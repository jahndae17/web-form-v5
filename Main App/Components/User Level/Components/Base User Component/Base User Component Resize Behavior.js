function addResizeHandles(component) {
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(handle => {
        const div = document.createElement('div');
        div.className = `resize-handle ${handle}`;
        div.style.position = 'absolute';
        div.style.width = handle === 'n' || handle === 's' ? '100%' : '40px';
        div.style.height = handle === 'e' || handle === 'w' ? '100%' : '40px';
        div.style.opacity = '0'; //should be invisible
        div.style.cursor = getCursor(handle);
        div.dataset.handle = handle;

        // Position the handle
        switch (handle) {
            case 'nw': div.style.top = '-5px'; div.style.left = '-5px'; break;
            case 'ne': div.style.top = '-5px'; div.style.right = '-5px'; break;
            case 'sw': div.style.bottom = '-5px'; div.style.left = '-5px'; break;
            case 'se': div.style.bottom = '-5px'; div.style.right = '-5px'; break;
            case 'n': div.style.top = '-5px'; div.style.left = '0'; break;
            case 's': div.style.bottom = '-5px'; div.style.left = '0'; break;
            case 'e': div.style.top = '0'; div.style.right = '-5px'; break;
            case 'w': div.style.top = '0'; div.style.left = '-5px'; break;
        }

        component.appendChild(div);
    });
}

function removeResizeHandles(component) {
    const handles = component.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
}

function getCursor(handle) {
    switch (handle) {
        case 'nw': case 'se': return 'nw-resize';
        case 'ne': case 'sw': return 'ne-resize';
        case 'n': case 's': return 'ns-resize';
        case 'e': case 'w': return 'ew-resize';
    }
}

// Actual resizing
function resizeElement(element, handle, dx, dy) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    switch (handle) {
        case 'nw':
            element.style.width = `${rect.width - dx}px`;
            element.style.height = `${rect.height - dy}px`;
            element.style.top = `${rect.top + dy}px`;
            element.style.left = `${rect.left + dx}px`;
            break;
        case 'ne':
            element.style.width = `${rect.width + dx}px`;
            element.style.height = `${rect.height - dy}px`;
            element.style.top = `${rect.top + dy}px`;
            break;
        case 'sw':
            element.style.width = `${rect.width - dx}px`;
            element.style.height = `${rect.height + dy}px`;
            element.style.left = `${rect.left + dx}px`;
            break;
        case 'se':
            element.style.width = `${rect.width + dx}px`;
            element.style.height = `${rect.height + dy}px`;
            break;
        case 'n':
            element.style.height = `${rect.height - dy}px`;
            element.style.top = `${rect.top + dy}px`;
            break;
        case 's':
            element.style.height = `${rect.height + dy}px`;
            break;
        case 'e':
            element.style.width = `${rect.width + dx}px`;
            break;
        case 'w':
            element.style.width = `${rect.width - dx}px`;
            element.style.left = `${rect.left + dx}px`;
            break;
    }
}
const component = document.querySelector('.base-user-component');