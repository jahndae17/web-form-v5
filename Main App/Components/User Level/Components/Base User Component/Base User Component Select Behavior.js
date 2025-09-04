(function() {
// Base User Component Select Behavior.js - Reactive selection handling

const component = document.querySelector('.base-user-component');
console.log('Component found:', component);
console.log('All components:', document.querySelectorAll('.base-user-component'));

if (!component) {
    console.log('No component found, exiting script');
    return;
}

console.log('Listener attached to:', component);

const inputs = window.handlerData['shared handler data'][0]['inputs'];

let initialLeft = 0;
let initialTop = 0;

component.addEventListener('componentSelected', () => {
    initialLeft = parseInt(component.style.left || 0);
    initialTop = parseInt(component.style.top || 0);
    // Additional selection logic can be added here
    component.style.border = '2px solid blue';
    inputs['selectedElementList'][component.id] = component; // Use object
});

component.addEventListener('componentDeselected', () => {
    console.log('Component deselected');
    // Additional deselection logic can be added here
    component.style.border = 'none';
    delete inputs['selectedElementList'][component.id]; // Remove from object
});
})();