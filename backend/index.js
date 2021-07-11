const express = require('express')
const app = express()
const fs = require('fs')
const cors = require('cors')
app.use(cors({credentials: true, origin: true}))
const port = 5000

app.get('/doctors', (req, res) => {

  // Read from json file and send back object

  let data = fs.readFileSync('./db.json', 'utf8')
  let doctors = JSON.parse(data).doctors

  res.send(doctors)

})

app.get('/patients', (req, res) => {

  // Read from json file and send back object

  let data = fs.readFileSync('./db.json', 'utf8')
  let patients = JSON.parse(data).patients

  res.send(patients)

})

app.get('/appointments/:doctorId/:day', (req, res) => {
  
  let doctorId = req.params.doctorId
  let day = req.params.day

  let data = fs.readFileSync('./db.json', 'utf8')
  let appointments = JSON.parse(data).appointments

  appointments = appointments.filter((apt) => apt.day === day && apt.doctor_id === doctorId)

  res.send(appointments)

})

app.post('/appointments/new/:doctorId/:day/:time', (req, res) => {

  let data = fs.readFileSync('./db.json', 'utf8')
  let currCount

  // If the file is just starting, initialize at 0, and increment to one

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