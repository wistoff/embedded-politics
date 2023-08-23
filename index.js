require('dotenv').config()
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const express = require('express')

const state = {
    lastUpdate: Date.now(),
    models: {}
}

var e0 = 0.38
var s0 = 2.41

econv = [
    //[4.5, 2.5, -2.5, -4.5],
    [7, 5, 0, -2], //p1
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [7, 5, 0, -2], //p2
    [-7, -5, 0, 2],
    [6, 4, 0, -2],
    [7, 5, 0, -2],
    [-8, -6, 0, 2],
    [8, 6, 0, -2],
    [8, 6, 0, -1],
    [7, 5, 0, -3],
    [8, 6, 0, -1],
    [-7, -5, 0, 2],
    [-7, -5, 0, 1],
    [-6, -4, 0, 2],
    [6, 4, 0, -1],
    [0, 0, 0, 0],
    [0, 0, 0, 0], //p3
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [-8, -6, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [-10, -8, 0, 1],
    [-5, -4, 0, 1],
    [0, 0, 0, 0], //p4
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0], //p5
    [0, 0, 0, 0],
    [-9, -8, 0, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0], //p6
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]

socv = [
    [0, 0, 0, 0], //p1
    [-8, -6, 0, 2],
    [7, 5, 0, -2],
    [-7, -5, 0, 2],
    [-7, -5, 0, 2],
    [-6, -4, 0, 2],
    [7, 5, 0, -2],
    [0, 0, 0, 0], //p2
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [-6, -4, 0, 2], //p3
    [7, 6, 0, -2],
    [-5, -4, 0, 2],
    [0, 0, 0, 0],
    [8, 4, 0, -2],
    [-7, -5, 0, 2],
    [-7, -5, 0, 3],
    [6, 4, 0, -3],
    [6, 3, 0, -2],
    [-7, -5, 0, 3],
    [-9, -7, 0, 2],
    [-8, -6, 0, 2],
    [7, 6, 0, -2],
    [-7, -5, 0, 2],
    [-6, -4, 0, 2],
    [-7, -4, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [7, 5, 0, -3], //p4
    [-9, -6, 0, 2],
    [-8, -6, 0, 2],
    [-8, -6, 0, 2],
    [-6, -4, 0, 2],
    [-8, -6, 0, 2],
    [-7, -5, 0, 2],
    [-8, -6, 0, 2],
    [-5, -3, 0, 2],
    [-7, -5, 0, 2],
    [7, 5, 0, -2],
    [-6, -4, 0, 2],
    [-7, -5, 0, 2], //p5
    [-6, -4, 0, 2],
    [0, 0, 0, 0],
    [-7, -5, 0, 2],
    [-6, -4, 0, 2],
    [-7, -6, 0, 2], //p6
    [7, 6, 0, -2],
    [7, 5, 0, -2],
    [8, 6, 0, -2],
    [-8, -6, 0, 2],
    [-6, -4, 0, 2]
]

const models = [
    {
        name: 'ChatGPT', iterations: 10, valE: 0, valS: 0, data: {}
    },]


const app = express()
app.use(cors())

app.use('/', express.static(path.join(__dirname, 'embedded-politics')))

app.get('/api', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(state, null, 2))
})

app.listen(2224, () => {
    console.log(`serving on http://localhost:2224`)
})

async function update() {
    state.models = models
    state.lastUpdate = Date.now()
    console.log(`${state.lastUpdate} devices updated`)
}


async function readModelData() {
    var state = [];
    // state.length = 63; 
    // state.fill(-1);
    let json = fs.readFileSync('./model-data/ChatGPT.json');
    let chatgpt = JSON.parse(json);
    // console.log(chatgpt)

    for (var iteration in chatgpt) {
        var currentIteration = chatgpt[iteration]
        // console.log(iteration)
        for (var page in currentIteration) {
            var currentQuestions = currentIteration[page]
            // console.log(page)
            for (var question in currentQuestions) {
                var question = currentQuestions[question];
                answer = question[Object.keys(question)]
                // console.log(answer)
                const answerI = mapToInteger(answer);
                state.push(answerI);
            }

        }
    }
    return state;
}

function mapToInteger(answer) {
    const lowercaseResponse = answer.toLowerCase();
    switch (lowercaseResponse) {
        case "strongly disagree":
            return 0;
        case "disagree":
            return 1;
        case "agree":
            return 2;
        case "strongly agree":
            return 3;
        default:
            console.log("Invalid response:", answer);
            return -1;
    }
}



async function transformModelData() {
    const modelState = await readModelData();
    var sumE = 0, sumS = 0
    for (var i = 0; i < 62; i++) {
        if (modelState[i] != -1) {
            sumE += econv[i][modelState[i]]
            sumS += socv[i][modelState[i]]
        }
    }
    var valE = sumE / 8.0
    var valS = sumS / 19.5
    valE += e0
    valS += s0
    valE = Math.round((valE + Number.EPSILON) * 100) / 100
    valS = Math.round((valS + Number.EPSILON) * 100) / 100
    state.models[0].valE = valE
    state.models[0].valS = valS
}

async function init() {
    await update()
    await transformModelData()
}

init()