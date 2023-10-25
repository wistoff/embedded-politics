const path = require('path')
const fs = require('fs')
const express = require('express')
const WebSocket = require('ws')
const readline = require('readline')
const dataFolder = '../computation/data'

const state = {
  interval: 3000,
  current: null
}

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.listen(4440)

const wss = new WebSocket.Server({ port: 4441 })

console.log('Embedded Politics server running on port 4440 (4441)')

process.stdout.write('\x1Bc')

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   prompt: 'Human '
// })

const models = getModels()

function getModels () {
  const files = fs.readdirSync(dataFolder)
  const models = files.map(file => {
    return path.parse(file).name
  })
  return models
}

function getSurveys () {
  const models = getModels()
  console.log('loading models')
  return models.flatMap(model => {
    console.log(model)
    const file = fs.readFileSync(`${dataFolder}/${model}.json`)
    const modelData = JSON.parse(file)
    return modelData.surveys.map(survey => ({
      date: survey.date,
      model,
      survey
    }))
  })
}

wss.on('connection', ws => {})

function broadcast (data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

function getAnswers () {
  const surveys = getSurveys()
  // console.log(surveys)
  console.log('Starting over')
  return surveys.flatMap(s => {
    return s.survey.answers.map(answer => ({
      date: s.date,
      model: s.model,
      answer
    }))
  })
}

function start () {
  const answers = getAnswers()

  answers.forEach((a, index) => {
    setTimeout(async () => {
      if (state.current && state.current.date != a.date) {
        broadcast(a)
      }
      state.current = a
      // console.log(state.current.date)
      console.log('Model:', a.model, '| Survey:', a.date)
      console.log('Question:', a.answer.question)
      console.log('Answer:', a.answer.answer)
      console.log('')

      if (index === answers.length - 1) {
        start()
      }
    }, index * state.interval)
  })
}

function init () {
  start()
}

init()
