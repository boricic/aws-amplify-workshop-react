// src/App.js
import React, { useEffect, useReducer } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { S3Album, withAuthenticator } from 'aws-amplify-react'
import { listPets } from './graphql/queries'
import { createPet as CreatePet } from './graphql/mutations'

// import uuid to create a unique client ID
import uuid from 'uuid/v4'

const CLIENT_ID = uuid()

// create initial state
const initialState = {
  name: '', breed: '', age: 0, pets: [], breeds: [], showCreatePet: false, activePet: 0
}

// create reducer to update state
function reducer(state, action) {
  switch (action.type) {
    case 'SETPETS':
      return { ...state, pets: action.pets }
    case 'SETBREEDS':
      return { ...state, breeds: action.breeds }
    case 'SETINPUT':
      return { ...state, [action.key]: action.value }
    case 'CREATEPET':
      return { ...state, showCreatePet: true }
    case 'ACTIVEPET':
      return { ...state, activePet: action.pet }
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
      const breedsData = await API.get('breedsapi', '/breeds')
      console.log('data from REST API: ', breedsData)
      dispatch({ type: 'SETBREEDS', breeds: breedsData })

      const petData = await API.graphql(graphqlOperation(listPets))
      console.log('data from GRAPHQL: ', petData)
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

  function makeOption(option) {
    return <option>{option}</option>
  }

  // add UI with event handlers to manage user input
  return (
    <div>
      <span onClick={() => dispatch({ type: 'CREATEPET' })} className="create-pet-title">CREATE PET</span>
      <div className={'create-pet' + (!state.showCreatePet ? ' disable' : '')}>
        <input
          name='name'
          placeholder='name'
          onChange={onChange}
          value={state.name}
        />
        <select
          name='breed'
          placeholder='breed'
          onChange={onChange}
          value={state.breed}
        >{state.breeds.map(makeOption)}</select>
        <input
          name='age'
          placeholder='age'
          onChange={onChange}
          value={state.age}
        />
        <button onClick={createPet}>Create Pet</button>
      </div>
      <div className="pet-tabs">
        {state.pets.map((p, i) => (
          <div className="pet-tab" key={i} onClick={() => dispatch({ type: 'ACTIVEPET', pet: i })}>{p.name}</div>
        ))}
      </div>
      <div>
        {state.pets.map((p, i) => (
          <div className={'pet' + (state.activePet !== i ? ' disable' : '')} key={i}>
            <h2>{p.name}</h2>
            <h4>{p.age}</h4>
            <p>{p.breed}</p>
            <div className="upload">
              <S3Album level="private" path={`/${p.name}`} picker pickerTitle={`Upload ${p.name}'s photos`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAuthenticator(App, { includeGreetings: true })