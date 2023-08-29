const { createCompletion, loadModel } = require('gpt4all')
const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const { calcScore } = require('./calcScores.js')
const OpenAI = require('openai')

const mode = process.argv.slice(2)[0]
const modelName = process.argv.slice(3)[0]


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

let systemPrompt = ''
// const modelName = 'orca-mini-7b.ggmlv3.q4_0'

const dataFolder = './data'

async function loadLlm () {
  if (mode === 'openai') {
    return modelName
  } else {
    return await loadModel(modelName, {
      modelPath: '/Users/kjellxvx/Code/ml/GPT4ALL-Models',
      verbose: false
    })
  }
}

function getPrompts () {
  const data = fs.readFileSync('./systemPrompt.txt', 'utf8')
  systemPrompt = data
  let json = fs.readFileSync('./prompt.json')
  return JSON.parse(json)
}

async function initData () {
  const files = await readdir(dataFolder)
  if (files.includes(`${modelName}.json`)) {
    console.log(`Data for the model ${modelName} found in ${dataFolder}`)
    let json = fs.readFileSync(`${dataFolder}/${modelName}.json`, 'utf-8')
    return JSON.parse(json)
  } else {
    const defaultModelData = {
      model: modelName,
      score: [0, 0],
      surveys: []
    }
    return defaultModelData
  }
}

async function askLlm (prompt, model) {
  console.log('QUESTION: ' + prompt)
  if (mode === 'openai') {
    const responseData = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: model
    })
    console.log('ANSWER: ' + responseData.choices[0].message.content)
    return responseData.choices[0].message.content
  } else {
    const responseData = await createCompletion(
      model,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      { systemPromptTemplate: '%1' }
    )
    console.log('ANSWER: ' + responseData.choices[0].message.content)
    return responseData.choices[0].message.content
  }
}

async function processPromptsSequentially (prompts, model) {
  let answeredPrompts = []
  for (const prompt of prompts) {
    console.log("Progress: " + answeredPrompts.length + "/" +prompts.length)
    while (true) {
      const response = await askLlm(prompt, model)
      // console.log('RAW response:' + response)
      const validedResponse = await validateResponse(response)
      if (validedResponse.isValid === true) {
        answeredPrompt = {
          question: prompt,
          answer: validedResponse.answer
        }
        answeredPrompts.push(answeredPrompt)
        break
      } else {
        console.log('--- Invalid response, try again')
      }
    }
  }
  return answeredPrompts
}

async function validateResponse (response) {
  try {
    const parsedResponse = JSON.parse(response)
    const answer = parsedResponse.opinion
    // console.log('ANSWER: ' + answer)
    const isValid = await validateResponseFormat(response)
    return { isValid, answer }
  } catch (error) {
    console.log('Error:', error)
    const isValid = false
    return { isValid }
  }
}

async function validateResponseFormat (reponse) {
  const pattern = /^\s*\{(?:\s*"[^"]*"\s*:\s*"[^"]*"\s*,?\s*)+\}$/
  if (pattern.test(String(reponse))) {
    const json = JSON.parse(reponse)
    const answer = Object.values(json)[0]
    const lowercaseAnswer = answer.toLowerCase()
    return [
      'agree',
      'disagree',
      'strongly disagree',
      'strongly agree'
    ].includes(lowercaseAnswer)
  } else {
    return false
  }
}

async function saveData (modelData, answeredPrompts) {
  newSurvey = {
    date: Date.now(),
    answers: answeredPrompts
  }
  modelData.surveys.push(newSurvey)
  const fileName = `${modelName}.json`
  const filePath = `${dataFolder}/${fileName}`
  const jsonString = JSON.stringify(modelData, null, 2)
  fs.writeFileSync(filePath, jsonString, 'utf8')
  console.log(`New model file saved: ${filePath}`)
  return modelData
}

async function generateDataFromModel () {
  if (process.argv.length < 4) {
    console.error('Expecting "mode" and "model" as parameters')
    process.exit(1)
  } else {
    const model = await loadLlm(modelName)
    console.log('Selected Mode: ' + mode)
    console.log('Selected Model: ' + modelName)
    const modelData = await initData()
    const prompts = await getPrompts()
    while (true) {
      const answeredPrompts = await processPromptsSequentially(prompts, model)
      console.log('--- Questions compelte, data saved to json')
      await saveData(modelData, answeredPrompts)
      calcScore()
      console.log('calcScores')
    }
  }
}

generateDataFromModel()
