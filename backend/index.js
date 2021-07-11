const express = require('express')
const app = express()
const fs = require('fs')
const cors = require('cors')
app.use(cors({credentials: true, origin: true}))
const port = 5000

app.get('/', (req, res) => {

  // Read from json file and send back object

  let data = fs.readFileSync('./db.json', 'utf8')
  let currCount = JSON.parse(data)

  res.send(currCount)

})

app.post('/', (req, res) => {

  let data = fs.readFileSync('./db.json', 'utf8')
  let currCount

  // If the file is just starting, initialize at 0

  if (data === '') {

    currCount = {clicks: 0}

  } else {

    currCount = JSON.parse(data)

  }

  currCount.clicks ++

  let content = JSON.stringify(currCount)

  fs.writeFileSync('./db.json', content)
  res.sendStatus(200)

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})