const socket = new WebSocket('ws://localhost:4441')
const state = {
  models: new Set(),
  history: []
}

socket.addEventListener('message', event => {
  const msg = JSON.parse(event.data)
  console.log(msg)

  if (msg.hasOwnProperty('clear')) return clear()
  handle(msg)
})

function handle (s) {
  state.history.push(s)

  log(s)
  ui(s)
}

function log (s) {
  const style = `background: blue; color: white; font-size: 2em;`
  console.clear()
  Object.keys(s.survey.model).map(d => {
    console.log('\n'.repeat('1'))
    console.log(`%c${d}`, `${style} font-weight: bold;`)
    console.log(`%c${s.survey.model[d]}`, style)
  })
}

function ui (s) {
  addDot(s.survey.score)
  if (state.models.has(s.survey.model.name)) {
    const dot = document.getElementById(s.survey.model.name)
    const score = avg(s.survey.model.name)
    dot.style = `left: ${map(score[0])}px; top: ${map(score[1]) * -1}px;`
  } else {
    state.models.add(s.survey.model.name)
    addDot(
      avg(s.survey.model.name),
      s.survey.model.name,
      s.survey.model.displayname
    )
  }
}

function avg (model) {
  const surveys = state.history
    .filter(h => h.survey.model.name === model)
    .map(s => s.survey)
  return surveys
    .reduce(
      (sum, s) => {
        sum[0] += s.score[0]
        sum[1] += s.score[1]
        return sum
      },
      [0, 0]
    )
    .map(sum => sum / surveys.length)
}

function addDot (score, model, displayname) {
  const a = document.getElementById('answers')
  const dot = document.createElement('div')
  dot.classList.add('dot')
  if (model) {
    dot.classList.add('model')
    dot.id = model
    dot.setAttribute('data-model', displayname)
  }
  dot.style = `left: ${map(score[0])}px; top: ${map(score[1]) * -1}px;`
  dot.setAttribute('data-score', score.toString())
  a.appendChild(dot)
}

function map (v) {
  const w = Number(
    getComputedStyle(document.body)
      .getPropertyValue('--compass-size')
      .replace('px', '')
  )
  return v * (w / 2 / 10)
}

function clear () {
  const a = document.getElementById('answers')
  a.innerHTML = ''

  state.models = new Set()
  state.history = []
}
