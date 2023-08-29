const { createCompletion, loadModel } = require('gpt4all')
const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const { calcScore } = require('./calcScores.js')
const OpenAI = require('openai')
const modelName = process.argv.slice(2)[0]

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

let systemPrompt = ''
// const modelName = 'orca-mini-7b.ggmlv3.q4_0'

const dataFolder = './data'

async function loadLlm () {
  if (modelName === 'chatgpt') {
    return 'chatgpt'
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
    const fileName = `${modelName}.json`
    const filePath = `${dataFolder}/${fileName}`
    const jsonString = JSON.stringify(defaultModelData, null, 2)
    fs.writeFileSync(filePath, jsonString, 'utf8')
    console.log(`New model file saved: ${filePath}`)
    return defaultModelData
  }
}

async function askLlm (prompt, model) {
  console.log('QUESTION: ' + prompt)

  if (model === 'chatgpt') {
    const responseData = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-3.5-turbo'
    })
    console.log(responseData)
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
    return responseData.choices[0].message.content
  }
}

async function processPromptsSequentially (prompts, model) {
  let answeredPrompts = []
  for (const prompt of prompts) {
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
        // console.log(answeredPrompts)
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
    const answer = parsedResponse.response
    console.log('ANSWER: ' + answer)
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
  // console.log(modelData)
  const fileName = `${modelName}.json`
  const filePath = `${dataFolder}/${fileName}`
  const jsonString = JSON.stringify(modelData, null, 2)
  fs.writeFileSync(filePath, jsonString, 'utf8')
  console.log(`New model file saved: ${filePath}`)
  return modelData
}

async function generateDataFromModel () {
  console.log('Selected Model: ' + modelName)

  const model = await loadLlm(modelName)

  const modelData = await initData()
  const prompts = await getPrompts()
  while (true) {
    const answeredPrompts = await processPromptsSequentially(prompts, model)
    console.log('--- Questions compelte, data saved to json')
    const savedModelData = await saveData(modelData, answeredPrompts)
    // console.log(savedModelData)
    calcScore()
    console.log('calcScores')
  }
}

generateDataFromModel()
