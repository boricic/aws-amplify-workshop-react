// src/App.js
import React, { useEffect, useState } from 'react'

// imports from Amplify library
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'

// import query
import { listPets } from './graphql/queries'

function App() {
  const [pets, updatePets] = useState([])

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const petData = await API.graphql(graphqlOperation(listPets))
      console.log('data from API: ', petData)
      updatePets(petData.data.listPets.items)
    } catch (err) {
      console.log('error fetching data..', err)
    }
  }

  return (
    <div>
      {
        pets.map((p, i) => (
          <div key={i}>
            <h2>{p.name}</h2>
            <h4>{p.age}</h4>
            <p>{p.breed}</p>
          </div>
        ))
      }
    </div>
  )
}

export default withAuthenticator(App, { includeGreetings: true })