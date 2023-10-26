const blessed = require('blessed')

const screen = blessed.screen({
  smartCSR: true
})
screen.title = 'Embedded Politics'

const t = blessed.text({
  top: 0,
  left: 0,
  width: '100%',
  height: screen.height - 2,
  content: '',
  scrollable: true,
  tags: true
})

const b = blessed.text({
  top: t.height + 1,
  left: 0,
  width: '100%',
  height: '1',
  content: '',
  tags: true
})

screen.append(t)
screen.append(b)

function ui (c) {
  t.pushLine(`${c.answer.question}\n${c.answer.answer}\n`)
  t.setScrollPerc(100)
  b.setContent(`Model {bold}${c.model}{/bold}`)
  screen.render()
}

module.exports = {
  ui
}