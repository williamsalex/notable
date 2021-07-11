import React, { useEffect, useState } from "react"
import axios from "axios"

export default function Homepage() {

  const [times, changeTimes] = useState(0)

  async function getClicks () {

    let promise = await axios({
      method: 'GET',
      url: 'http://localhost:5000/',
      headers: {'Content-Type': 'application/json'}
    })

    changeTimes(promise.data.clicks)

  }

  async function incrementClicks () {

    // Incrementing on the frontend and also tracking in database
    // to give instant updates and persist data

    changeTimes(times + 1)

    await axios({
      method: 'POST',
      url: 'http://localhost:5000/',
      headers: {'Content-Type': 'application/json'}
    })

  }

  useEffect(() => {

    getClicks()

  })

  return (
    <div className="homepage">
      <h2>This is a project for Notable Health</h2>
      <button onClick={() => incrementClicks()}> You've Clicked {times} times! </button>
    </div>
  )

}