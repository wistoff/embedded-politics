const path = require('path')
const fs = require('fs')
const express = require('express')
const WebSocket = require('ws')
const dataFolder = '../computation/data'
const { ui } = require('./ui')

const state = {
  interval: 5,
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
      survey,
      score: survey.score,
      metadata: modelData.metadata
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
    return s.survey.answers.map((answer, i) => ({
      index: i + 1,
      survey: {
        date: s.date,
        score: s.score
      },
      metadata: s.metadata,
      model: s.model,
      answer
    }))
  })
}

function init () {
  const answers = getAnswers()
  answers.forEach((a, index) => {
    setTimeout(() => {
      if (state.current && state.current.survey.date != a.survey.date) {
        broadcast(a)
      }
      state.current = a
      state.history.push(a)
      /* ui(state.current) */

      if (index === answers.length - 1) {
        broadcast({
          clear: true
        })

        state.history = []
        init()
      }
    }, index * state.interval)
  })
}

init()
