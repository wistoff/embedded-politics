require('dotenv').config()
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const express = require('express')
const dataFolder = './data'

function getModels () {
  const files = fs.readdirSync(dataFolder)
  const models = files.map(file => {
    return path.parse(file).name
  })
  return models
}

function getEmbeddings (models) {
  const updatedData = models.map(model => {
    const file = fs.readFileSync(`./${dataFolder}/${model}.json`)
    const modelData = JSON.parse(file)
    return modelData
  })
  return updatedData
}

const app = express()
app.use(cors())

app.use('/', express.static(path.join(__dirname, 'embedded-politics')))

app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const models = getModels()
  const embeddings = getEmbeddings(models)
  console.log(embeddings)
  res.send(JSON.stringify(embeddings, null, 2))
})

app.listen(2224, () => {
  console.log(`serving on http://localhost:2224`)
})


