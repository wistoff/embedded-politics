const path = require('path')
const fs = require('fs')
const express = require('express')
const WebSocket = require('ws')
const dataFolder = '../computation/data'
const { ui } = require('./ui')

const state = {
  interval: 100,
  current: null,
  history: []
}

const app = express()
const wss = new WebSocket.Server({ port: 4441 })

app.use(express.static(path.join(__dirname, 'public')))
app.listen(4440)

function getModels () {
  const files = fs.readdirSync(dataFolder)
  const models = files.map(file => {
    return path.parse(file).name
  })
  return models
}

function getSurveys () {
  const models = getModels()
  return models.flatMap(model => {
    const file = fs.readFileSync(`${dataFolder}/${model}.json`)
    const modelData = JSON.parse(file)
    return modelData.surveys.map(survey => ({
      date: survey.date,
      model,
      survey
    }))
  })
}

function broadcast (data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

function getAnswers () {
  const surveys = getSurveys()
  return surveys.flatMap(s => {
    return s.survey.answers.map(answer => ({
      date: s.date,
      model: s.model,
      answer
    }))
  })
}

function init () {
  const answers = getAnswers()

  answers.forEach((a, index) => {
    setTimeout(() => {
      if (state.current && state.current.date != a.date) {
        broadcast(a)
      }
      state.current = a
      state.history.push(a)
      ui(state.current)

      if (index === answers.length - 1) {
        state.history = []
        init()
      }
    }, index * state.interval)
  })
}

init()
