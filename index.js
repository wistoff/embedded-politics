const { createCompletion, loadModel } = require('gpt4all')
const fs = require('fs')
const util = require('util');
const readdir = util.promisify(fs.readdir);
let systemPrompt = ""
var model = {}
const modelName = 'orca-mini-7b.ggmlv3.q4_0';
const dataFolder = './data';
var modelData = {}
const {calcScore} = require('./api.js')

// {
//     "model": "orca-mini-7b.ggmlv3.q4_0",
//     "score": [0, 0],
//     "data": [
//       {
//         "date": 242011,
//         "answers": []
//       }
//     ]
//   }

async function loadLlm() {
    model = await loadModel(modelName, { modelPath: '/Users/kjellxvx/Code/ml/GPT4ALL-Models', verbose: false })
}

async function initData() {
    try {
        const files = await readdir(dataFolder);
        if (files.includes(`${modelName}.json`)) {
            console.log(`Data for the model ${modelName} found in ${dataFolder}`);
            let json = fs.readFileSync(`${dataFolder}/${modelName}.json`, 'utf-8');
            return JSON.parse(json);
        } else {
            const defaultModelData = {
                model: modelName,
                score: [0, 0],
                data: []
            };
            const fileName = `${modelName}.json`;
            const filePath = `${dataFolder}/${fileName}`;
            const jsonString = JSON.stringify(defaultModelData, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            console.log(`New model file saved: ${filePath}`);
            return defaultModelData;
        }
    } catch (err) {
        console.error('Error reading folder:', err);
        throw err;
    }
}

async function chat(prompt) {
    const responseData = await createCompletion(model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
    ], { systemPromptTemplate: '%1' });
    var response = responseData.choices[0].message.content;

    try {
        const parsedResponse = JSON.parse(response);
        const answer = Object.values(parsedResponse)[0];
        console.log("ANSWER: " + answer);
        const isValid = await validateData(response)
        return { isValid, response };
    } catch (error) {
        console.log("ANSWER: " + response);
        const isValid = false
        return { isValid, response };
    }
}

async function loadPrompts() {
    try {
        const data = fs.readFileSync('./systemPrompt.txt', 'utf8');
        systemPrompt = data;
    } catch (err) {
        console.error(err);
    }
    let json = fs.readFileSync('./prompt.json');
    data = JSON.parse(json);
    const session = []
    for (const page in data) {
        for (const statement of data[page]) {
            const rawPrompt = Object.keys(statement)[0];
            console.log("QUESTION: " + rawPrompt);
            var prompt = JSON.stringify({ [rawPrompt]: "" });
            while (true) {
                const chatResponse = await chat(prompt);
                if (chatResponse.isValid) {
                    session.push(chatResponse.response)
                    console.log(session)
                    break;
                } else {
                    console.log('--- Invalid response, try again');
                }
            }
        }
    }
    saveData(session);
    console.log('--- Questions compelte, data saved to json');
}

async function validateData(reponse) {
    const pattern = /^\s*\{"[^"]*":\s*"[^"]*"\}$/;
    if (pattern.test(String(reponse))) {
        const json = JSON.parse(reponse);
        const answer = Object.values(json)[0]
        const lowercaseAnswer = answer.toLowerCase();
        return ["agree", "disagree", "strongly disagree", "strongly agree"].includes(lowercaseAnswer);
    } else {
        return false;
    }
}

async function saveData(session) {
    const newData = {
        "date": Date.now(),
        "answers": session
    }
    modelData.data.push(newData)
    console.log(modelData.data)
    const fileName = `${modelName}.json`;
    const filePath = `${dataFolder}/${fileName}`;
    const jsonString = JSON.stringify(modelData, null, 2); // The third argument (2) adds indentation for better readability
    fs.writeFileSync(filePath, jsonString, 'utf8');
    console.log(`New model file saved: ${filePath}`);
    await calcScore()
}


async function init() {
    await loadLlm();
    modelData = await initData();
    await loadPrompts()
}

init(
)
