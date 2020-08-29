import Head from 'next/head'
import { useReducer, useEffect, useRef, useMemo } from 'react'

import styles from '../styles/Home.module.css'

const initialState = {
  grid: [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ],
  currentUser: 'X',
  // remove movesMade in favor of currentUser
  movesMade: 0,
  ai: false,
  gridSize: 3,
  winner: null
}

function checkForWinner(state, [userI, userJ]) {
  return checkUpAndDown() ||
    checkLeftAndRight() ||
    checkUpLeftAndDownRight() ||
    checkUpRightAndDownLeft()

  function checkUpAndDown() {
    let winner = true;
    
    state.grid.forEach(row => {
      if (row[userI] !== state.currentUser) {
        winner = false
      }
    })

    return winner
  }

  // check left and right
  function checkLeftAndRight() {
    let winner = true;

    state.grid[userI].forEach(cell => {
      if (cell !== state.currentUser) {
        winner = false
      }
    })

    return winner
  }

  // check up/left and down/right
  function checkUpLeftAndDownRight() {
    for (let i = 0; i < state.grid[0].length; i++) {
      if (state.grid[i][i] !== state.currentUser) {
        return false
      }
    }

    return true
  }

  // check up/right and down/left
  function checkUpRightAndDownLeft() {
    for (let i = 0; i < state.grid[0].length; i++) {
      if (state.grid[i][state.grid.length - 1 - i] !== state.currentUser) {
        return false
      }
    }

    return true
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'move':
      const {
        currentUser,
        coordinates: [userI, userJ]
      } = action.payload

      const newState = {
        ...state,
        movesMade: state.movesMade + 1,
        grid: state.grid.map((row, i) => row.map((cell, j) => {
            if (userI === i && userJ === j) {
              return currentUser
            }
            return cell
        }))
      }

      if (checkForWinner(newState, [userI, userJ])) {
        alert('winner!')
        return {
          ...newState,
          winner: state.currentUser
        }
      }

      return newState
    default:
      throw new Error()
  }
}

export default function Home() {
  const [state, dispatch] = useReducerWithLogger(reducer, initialState)

  return (
    <div className={styles.container}>
      <Head>
        <title>Tic Tac Toe</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Tic Tac Toe
        </h1>

        <div className={styles.grid}>
          {state.grid.map((row, i) => (
            <div className={styles.row} key={i}>{row.map((cellValue, j) => {
              const onClick = () => dispatch({
                type: 'move',
                payload: {
                  coordinates: [i, j],
                  currentUser: state.movesMade % 2 === 0 ? 'X' : '0'
                }
              })

              return (<div
                className={styles.cell}
                key={j}
                {...(cellValue === '' && { onClick })}
              >
                {cellValue}
              </div>)
            })}</div>
          ))}
        </div>
      </main>
    </div>
  )
}

function withLogger(dispatch) {
  return (action) => {
    console.log('Action type:', action.type)
    return dispatch(action)
  }
}

function useReducerWithLogger(...args) {
  let prevState = useRef(initialState)
  const [state, dispatch] = useReducer(...args)
  const dispatchWithLogger = useMemo(() => withLogger(dispatch), [dispatch])

  useEffect(() => {
    console.log('Prev state:', prevState.current)
    console.log('Next state:', state)
    prevState.current = state
  }, [state])

  return [state, dispatchWithLogger]
}