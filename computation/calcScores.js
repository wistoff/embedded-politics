require('dotenv').config()
const fs = require('fs')
const path = require('path')

const e0 = 0.38
const s0 = 2.41

econv = [
  [7, 5, 0, -2], // p1
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [7, 5, 0, -2], // p2
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
  [0, 0, 0, 0], // p3
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
  [0, 0, 0, 0], // p4
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
  [0, 0, 0, 0], // p5
  [0, 0, 0, 0],
  [-9, -8, 0, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0], // p6
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]

socv = [
  [0, 0, 0, 0], // p1
  [-8, -6, 0, 2],
  [7, 5, 0, -2],
  [-7, -5, 0, 2],
  [-7, -5, 0, 2],
  [-6, -4, 0, 2],
  [7, 5, 0, -2],
  [0, 0, 0, 0], // p2
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
  [-6, -4, 0, 2], // p3
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
  [7, 5, 0, -3], // p4
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
  [-7, -5, 0, 2], // p5
  [-6, -4, 0, 2],
  [0, 0, 0, 0],
  [-7, -5, 0, 2],
  [-6, -4, 0, 2],
  [-7, -6, 0, 2], // p6
  [7, 6, 0, -2],
  [7, 5, 0, -2],
  [8, 6, 0, -2],
  [-8, -6, 0, 2],
  [-6, -4, 0, 2]
]

const dataFolder = './data'

function getModels () {
  const files = fs.readdirSync(dataFolder)
  const models = files.map(file => {
    return path.parse(file).name
  })
  return models
}

function getSurveys (model) {
  const modelData = loadModelSurveys(model)
  return modelData.surveys.map(survey => {
    return {
      date: survey.date,
      answers: survey.answers.map(answer => mapToInteger(answer.answer))
    }
  })
}

function loadModelSurveys (name) {
  const fileName = `${name}.json`
  const filePath = `${dataFolder}/${fileName}`
  const json = fs.readFileSync(filePath)
  const modelData = JSON.parse(json)
  return modelData
}

function mapToInteger (answer) {
  const lowercaseResponse = answer.toLowerCase()
  switch (lowercaseResponse) {
    case 'strongly disagree':
      return 0
    case 'disagree':
      return 1
    case 'agree':
      return 2
    case 'strongly agree':
      return 3
    default:
      console.log('Invalid response:', answer)
      return -1
  }
}

function getScoreData (surveys) {
  return surveys.map(survey => {
    let sumE = 0
    let sumS = 0
    for (let i = 0; i < 62; i++) {
      if (survey.answers[i] != -1) {
        sumE += econv[i][survey.answers[i]]
        sumS += socv[i][survey.answers[i]]
      }
    }
    let valE = sumE / 8.0
    let valS = sumS / 19.5
    valE += e0
    valS += s0
    valE = Math.round((valE + Number.EPSILON) * 100) / 100
    valS = Math.round((valS + Number.EPSILON) * 100) / 100
    return { ...survey, evaluation: [valE, valS] }
  })
}

function appendScoresToModelData (scoreData, model) {
  const modelData = loadModelSurveys(model)

  const updatedSurveys = modelData.surveys.map(survey => {
    return {
      ...survey,
      score: scoreData.find(score => score.date === survey.date).evaluation
    }
  })

  modelData.surveys = updatedSurveys
  const totalScores = updatedSurveys.reduce(
    (sumScore, survey) => {
      const [scoreE, scoreS] = survey.score
      sumScore[0] += scoreE
      sumScore[1] += scoreS
      return sumScore
    },
    [0, 0]
  )
  const averageScore = totalScores.map(sum => sum / updatedSurveys.length)
  const updatedModelData = { ...modelData, score: averageScore, model: modelData.model,}
  console.log(updatedModelData)
  return updatedModelData
}

// function saveData (modelData) {
//   const fileName = `${modelData.model}.json`
//   const filePath = `${dataFolder}/${fileName}`
//   const jsonString = JSON.stringify(modelData, null, 2)
//   fs.writeFileSync(filePath, jsonString, 'utf8')
//   console.log(`Model updated: ${filePath}`)
// }


function saveData(modelData) {
  const fileName = `${modelData.model.name}.json`; // Use the 'name' property
  const filePath = `${dataFolder}/${fileName}`;
  const jsonString = JSON.stringify(modelData, null, 2);
  fs.writeFileSync(filePath, jsonString, 'utf8');
  console.log(`Model updated: ${filePath}`);
}

const updateModelScores = models => {
  return models.map(model => {
    const surveys = getSurveys(model)
    const scoreData = getScoreData(surveys)
    const modelData = appendScoresToModelData(scoreData, model)
    saveData(modelData)
    return modelData
  })
}

function calcScore () {
  const models = getModels()
  const modelData = updateModelScores(models)
  console.log(modelData)
}

module.exports = {
  calcScore
}
