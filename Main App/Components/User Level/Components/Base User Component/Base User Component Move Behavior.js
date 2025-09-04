// Base User Component Move Behavior.js - Reactive move handling

const component = document.querySelector('.base-user-component');

component.addEventListener('dragMove', (e) => {
    const deltaX = e.detail.deltaX;
    const deltaY = e.detail.deltaY;
    const initialLeft = parseInt(component.style.left || 0);
    const initialTop = parseInt(component.style.top || 0);
    component.style.left = (initialLeft + deltaX) + 'px';
    component.style.top = (initialTop + deltaY) + 'px';
});
