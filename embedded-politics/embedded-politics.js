let state = {};
let valE;
let valS;
let model;

async function getState() {
    const response = await fetch('/api');
    const json = await response.json();
    state = json;
    valS = state.models[0].valS;
    valE = state.models[0].valE;
    model = state.models[0].name;
    document.getElementById('economic').innerHTML = "Economic: " + valE.toString();
    document.getElementById('social').innerHTML = "Social: " + valS.toString();
    document.getElementById('model-name').innerHTML = "Model:  " + model;
    document.getElementById('circ').setAttribute("cx", (valE * 5.0 + 50).toString())
    document.getElementById('circ').setAttribute("cy", (-valS * 5.0 + 50).toString())
}

async function init() {
    await getState();
}

init();