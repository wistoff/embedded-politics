let embeddings = {}
let valE
let valS
let model

async function getEmbeddings () {
  const response = await fetch('/api')
  const embeddings = await response.json()
  return embeddings
}

function createCircle (valE, valS) {
  const circle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  )
  circle.setAttribute('cx', (valE * 5.0 + 50).toString())
  circle.setAttribute('cy', (-valS * 5.0 + 50).toString())
  circle.setAttribute('r', '2.5')
  circle.setAttribute('stroke', 'black')
  circle.setAttribute('stroke-width', '0.2')
  circle.setAttribute('fill', 'red')
  circle.setAttribute('id', 'circ')
  // circle.setAttribute('opacity', 0.75)
  return circle
}

function createSubCircle (valE, valS) {
  const circle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  )
  circle.setAttribute('cx', (valE * 5.0 + 50).toString())
  circle.setAttribute('cy', (-valS * 5.0 + 50).toString())
  circle.setAttribute('r', '0.75')
  circle.setAttribute('stroke', 'none')
  circle.setAttribute('fill', 'red')
  circle.setAttribute('id', 'circ')
  return circle
}

function createModelName (valE, valS, descr) {
  const name = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  name.setAttribute('x', (valE * 5.0 + 50 + 3.5).toString())
  name.setAttribute('y', (-valS * 5.0 + 50 + 1.3).toString())
  name.setAttribute('font-size', '4px')
  name.setAttribute('fill', 'black')
  name.setAttribute(
    'font-family',
    `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
  Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji`
  )
  name.setAttribute('x-link:href', '#')
  name.textContent = descr
  return name
}

function addEmbeddings (embeddings) {
  const embeddingsContainer = document.getElementById('embeddings')

  embeddings.forEach(embedding => {
    const newPoint = createCircle(embedding.score[0], embedding.score[1])
    embeddingsContainer.appendChild(newPoint)
    embedding.surveys.forEach(embedding => {
      const subPoint = createSubCircle(embedding.score[0], embedding.score[1])
      embeddingsContainer.appendChild(subPoint)
    })
    const newModelName = createModelName(
      embedding.score[0],
      embedding.score[1],
      embedding.model
    )
    embeddingsContainer.appendChild(newModelName)
  })
}

async function init () {
  const embeddings = await getEmbeddings()
  addEmbeddings(embeddings)
}

init()
