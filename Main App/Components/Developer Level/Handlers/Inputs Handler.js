//sets the "context" section of Main App\Components\Developer Level\Registers\Handler Data.json using event handlers
function handleMousedown(e){
    const mousedown_element = e.target;
    const mousedown_context = e.target.dataset.component;
    const mousedown_x = e.clientX;
    const mousedown_y = e.clientY;
    const mousedown_time = Date.now();
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['on last mouse down'] = {
            element: mousedown_element,
            "component type": mousedown_context,
            x: mousedown_x,
            y: mousedown_y,
            time: mousedown_time
        };
    }
};

function handleMouseMove(e) {
    const mousemove_element = e.target;
    const mousemove_context = e.target.dataset.component;
    const mousemove_x = e.clientX;
    const mousemove_y = e.clientY;
    const mousemove_time = Date.now();
    const mousedown_time = window.handlerData ? window.handlerData['shared handler data'][0]['context']['on last mouse down']['time'] : null;
    const mousemove_duration = mousemove_time - mousedown_time;
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['now'] = {
            element: mousemove_element,
            "component type": mousemove_context,
            x: mousemove_x,
            y: mousemove_y,
            time: mousemove_time
        };
    }
};

function handleMouseUp(e) {
    const mouseup_element = e.target;
    const mouseup_context = e.target.dataset.component;
    const mouseup_x = e.clientX;
    const mouseup_y = e.clientY;
    const mouseup_time = Date.now();
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['on last mouse up'] = {
            element: mouseup_element,
            "component type": mouseup_context,
            x: mouseup_x,
            y: mouseup_y,
            time: mouseup_time
        };
    }
};

function handleRightClick(e) {
    const rightclick_element = e.target;
    const rightclick_context = e.target.dataset.component;
    const rightclick_x = e.clientX;
    const rightclick_y = e.clientY;
    const rightclick_time = Date.now();
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['on last right click'] = {
            element: rightclick_element,
            "component type": rightclick_context,
            x: rightclick_x,
            y: rightclick_y,
            time: rightclick_time
        };
    }
};
