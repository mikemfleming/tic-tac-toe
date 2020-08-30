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
  movesMade: 0,
  gridSize: 3,
  winner: null,
  maxSize: 13,
  minSize: 1
}

function checkForWinner(state, [userI, userJ]) {
  return checkUpAndDown() ||
    checkLeftAndRight() ||
    checkUpLeftAndDownRight() ||
    checkUpRightAndDownLeft()

    // TODO something sucks here
  function checkUpAndDown() {
    let winner = true;
    
    state.grid.forEach(row => {
      if (row[userJ] !== state.currentUser) {
        winner = false
      }
    })
    console.log('should be a winner')
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

const USER_MOVE = 'user_move'
const RESET_GRID = 'reset_grid'
const RESIZE_GRID = 'resize_grid'

function reducer(state, action) {
  switch (action.type) {
    case RESIZE_GRID:
      const { newSize } = action.payload

      return {
        ...state,
        gridSize: newSize,
        grid: new Array(newSize).fill(
          new Array(newSize).fill('')
        )
      }
    case RESET_GRID:
      return initialState
    case USER_MOVE:
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

      const won = checkForWinner(newState, [userI, userJ])

      // handle draws
      if (newState.movesMade === newState.grid[0].length * newState.grid[0].length && !won) {
        console.log('draw!')
        return {
          ...newState,
          winner: state.currentUser
        }
      }

      if (checkForWinner(newState, [userI, userJ])) {
        console.log('winner!')
        return {
          ...newState,
          winner: state.currentUser
        }
      }

      return {
        ...newState,
        currentUser: currentUser === 'X' ? '0' : 'X'
      }
    default:
      throw new Error('Action not supported.')
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
          T - T - T
        </h1>

        <div className={styles.grid}>
          {state.grid.map((row, i) => (
            <div className={styles.row} key={i}>{row.map((cellValue, j) => {
              const onClick = () => dispatch({
                type: USER_MOVE,
                payload: {
                  coordinates: [i, j],
                  currentUser: state.movesMade % 2 === 0 ? 'X' : '0'
                }
              })
              const cellStyleMapping = {
                '': '',
                'X': styles.x,
                '0': styles.o
              }

              return (<div
                className={styles.cell}
                key={j}
                {...(cellValue === '' && { onClick })}
              >
                <div className={cellStyleMapping[cellValue]}/>
              </div>)
            })}</div>
          ))}
        </div>

        <div className={styles.settings}>
            <input
              type="range" 
              disabled={state.movesMade > 0}
              onChange={({ target: { value } }) => dispatch({
                type: RESIZE_GRID,
                payload: { newSize: parseInt(value) }
              })}
              value={state.gridSize}
              min={state.minSize}
              max={state.maxSize}
            />
            {state.winner && (
              <div className={styles.reset} onClick={() => dispatch({ type: RESET_GRID })}>Reset?</div>
            )}
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