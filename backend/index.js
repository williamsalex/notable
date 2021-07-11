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

  Object.keys(appointments).forEach((id) => console.log(appointments[id].day, day, appointments[id].doctor_id, appointments[id].day === day, appointments[id].doctor_id === doctorId))

  let appointmentsOnDay = Object.keys(appointments).filter((id) => appointments[id].day === day && appointments[id].doctor_id === doctorId)
  appointmentsOnDay = appointmentsOnDay.map((apt) => appointments[apt])

  res.send(appointmentsOnDay)

})

app.post('/appointments/new/:doctorId/:patientId/:day/:time/:kind', async (req, res) => {

  let doctorId = req.params.doctorId
  let patientId = req.params.patientId
  let day = req.params.day
  let time = req.params.time
  let kind = req.params.kind

  // Checking if the appointment is on a 15 minute interval before we load the database

  if (parseInt(time.split(':')[1]) % 15 !== 0) { res.sendStatus(422) }

  await checkOutFile()

  let data = fs.readFileSync('./db.json', 'utf8')

  let currentState = JSON.parse(data)

  let doctorExists = currentState.doctors[doctorId]

  let patientExists = currentState.patients[patientId]

  if (!doctorExists || !patientExists) { res.sendStatus(422) }

  // Checking that the doctor doesn't have too many appointments at the desired time

  let appointmentsByDay = currentState.appointments_by_day[day]
  let doctorAppointmentsByDay
  let appointmentsAtDesiredTime
  
  if (appointmentsByDay && appointmentsByDay.length) {

    doctorAppointmentsByDay = appointmentsByDay.map((apt) => currentState.appointments[apt])

    appointmentsAtDesiredTime = doctorAppointmentsByDay.filter((apt) => apt.time === time)

  }

  if (appointmentsAtDesiredTime > 2) { res.sendStatus(422) }

  // This is a horrible but fast way of creating ids - need to at least implement a semaphore for race conditions

  let appointmentId = currentState.appointments_curr_max_id + 1

  while (appointmentId in currentState.appointments) { appointmentId += 1 }

  currentState.appointments[appointmentId] = {"doctor_id": doctorId, "patient_id": patientId, "day": day, "time": time, "kind": kind}
  
  // Adding to day index

  if (appointmentsByDay) {

    currentState.appointments_by_day[day][appointmentId] = "1"

  } else {

    currentState.appointments_by_day[day] = [appointmentId]

  }

  currentState.appointments_curr_max_id = appointmentId

  currentState.data_is_checked_out = 0

  fs.writeFileSync('./db.json', JSON.stringify(currentState))
  res.sendStatus(200)

})

app.delete('/appointments/:id', async (req, res) => {

  await checkOutFile()

  let appointmentId = req.params.id

  let data = fs.readFileSync('./db.json', 'utf8')

  let currentState = JSON.parse(data)

  let appointmentExists = currentState.appointments[appointmentId]

  if (!appointmentExists) { res.sendStatus(422) }

  let day = currentState.appointments[appointmentId].day

  delete currentState.appointments[appointmentId]
  delete currentState.appointments_by_day[day][appointmentId]
  
  currentState.data_is_checked_out = 0

  fs.writeFileSync('./db.json', JSON.stringify(currentState))
  res.sendStatus(200)

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

async function checkOutFile () {

  // This is bad semaphore and I would make it more robust if I had time

  let goAhead = false

  while (!goAhead) {

    let data = JSON.parse(fs.readFileSync('./db.json', 'utf8'))
    
    if (data.data_is_checked_out === 0) {

      data.data_is_checked_out = 1

      fs.writeFileSync('./db.json', JSON.stringify(data))

      goAhead = true

    }

    await new Promise(resolve => setTimeout(resolve, 50))

  }

}
