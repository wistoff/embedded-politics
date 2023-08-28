const { generateDataFromModel } = require('./src/llm.js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
// const cors = require('cors')
// const express = require('express')

function getModels () {
  const files = fs.readdirSync(dataFolder)
  const models = files.map(file => {
    return path.parse(file).name
  })
  return models
}

// function serveEmbeddings () {
//   const app = express()
//   app.use(cors())

//   app.use('/', express.static(path.join(__dirname, 'embedded-politics')))

//   app.get('/api', (req, res) => {
//     res.setHeader('Content-Type', 'application/json')
//     res.send(JSON.stringify(state, null, 2))
//   })

//   app.listen(2224, () => {
//     console.log(`serving on http://localhost:2224`)
//   })
// }

async function init () {
  await generateDataFromModel()
  // const models = await getModels()
  // const embeddings = getEmbeddings(models)
}

init()
