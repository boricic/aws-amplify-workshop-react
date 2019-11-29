// src/App.js
import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { listPets } from './graphql/queries'
import { createPet as CreatePet } from './graphql/mutations'

// import uuid to create a unique client ID
import uuid from 'uuid/v4'

const CLIENT_ID = uuid()

// create initial state
const initialState = {
  name: '', breed: '', age: 0, pets: []
}

// create reducer to update state
function reducer(state, action) {
  switch (action.type) {
    case 'SETPETS':
      return { ...state, pets: action.pets }
    case 'SETINPUT':
      return { ...state, [action.key]: action.value }
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const petData = await API.graphql(graphqlOperation(listPets))
      console.log('data from API: ', petData)
      dispatch({ type: 'SETPETS', pets: petData.data.listPets.items })
    } catch (err) {
      console.log('error fetching data..', err)
    }
  }

  async function createPet() {
    const { name, breed, age } = state
    if (name === '' || breed === '' || age === 0) return
    const pet = {
      name, breed, age: parseInt(age)
    }
    const pets = [...state.pets, pet]
    dispatch({ type: 'SETPETS', pets })
    console.log('pet:', pet)

    try {
      await API.graphql(graphqlOperation(CreatePet, { input: pet }))
      console.log('item created!')
    } catch (err) {
      console.log('error creating pet...', err)
    }
  }

  // change state then user types into input
  function onChange(e) {
    dispatch({ type: 'SETINPUT', key: e.target.name, value: e.target.value })
  }

  // add UI with event handlers to manage user input
  return (
    <div>
      <input
        name='name'
        placeholder='name'
        onChange={onChange}
        value={state.name}
      />
      <input
        name='breed'
        placeholder='breed'
        onChange={onChange}
        value={state.breed}
      />
      <input
        name='age'
        placeholder='age'
        onChange={onChange}
        value={state.age}
      />
      <button onClick={createPet}>Create Pet</button>
      {
        state.pets.map((p, i) => (
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