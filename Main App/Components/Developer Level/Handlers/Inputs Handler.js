//sets the "context" section of Main App\Components\Developer Level\Registers\Handler Data.json using event handlers
function handleMousedown(e){
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['on last mouse down'] = {
            element: e.target,
            "component type": e.target.dataset.component,
            button: e.button,
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        };
    }
};

function handleMouseMove(e) {
    const mousedown_time = window.handlerData ? window.handlerData['shared handler data'][0]['context']['on last mouse down']['time'] : null;
    const mousemove_duration = Date.now() - mousedown_time;
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['now'] = {
            element: e.target,
            "component type": e.target.dataset.component,
            button: e.button,
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        };
    }
};

function handleMouseUp(e) {
    // Update the context in the handler data
    if (window.handlerData) {
        window.handlerData['shared handler data'][0]['context']['on last mouse up'] = {
            element: e.target,
            "component type": e.target.dataset.component,
            button: e.button,
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        };
    }
};