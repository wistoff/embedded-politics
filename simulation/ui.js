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
  tags: true,
  scrollback: 100
})

const bl = blessed.text({
  top: t.height + 1,
  left: 0,
  width: '50%',
  height: 1,
  content: '',
  tags: true,
})

const br = blessed.text({
  top: t.height + 1,
  right: 0,
  width: 13 + 1 + 7,
  height: 1,
  content: '',
  tags: true,
  align: 'right',
})

screen.append(t)
screen.append(bl)
screen.append(br)

function ui (c) {
  t.pushLine(`\n${c.answer.question}\n${c.answer.answer}`)
  t.setScrollPerc(100)
  bl.setContent(`Model {bold}${c.model}{/bold}`)
  br.setContent(`${c.date} [{bold}${String(c.index).padStart(2, '0')}{/bold}/64]`)
  screen.render()
}

module.exports = {
  ui
}