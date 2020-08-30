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
  winner: false,
  draw: false,
  maxSize: 13,
  minSize: 1
}

function checkForWinner(state) {
  return checkLeftAndRight() ||
    checkUpAndDown() ||
    checkUpLeftAndDownRight() ||
    checkUpRightAndDownLeft()

  function checkUpAndDown() {
    let winner = false

    for (let j = 0; j < state.gridSize && !winner; j++) {
      const cells = []

      for (let i = 0; i < state.gridSize; i++) {
        cells.push(state.grid[i][j])
      }

      winner = cells.filter(cell => cell === state.currentUser).length === state.gridSize
    }

    return winner
  }

  function checkLeftAndRight() {
    let winner = false

    state.grid.forEach(row => {
      if (!winner) {
        winner = row.filter(cell => cell === state.currentUser).length === state.gridSize
      }
    })

    return winner
  }

  function checkUpLeftAndDownRight() {
    for (let i = 0; i < state.grid[0].length; i++) {
      if (state.grid[i][i] !== state.currentUser) {
        return false
      }
    }

    return true
  }

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
const PROCESS_BOARD = 'process_board'

function reducer(state, action) {
  switch (action.type) {
    case PROCESS_BOARD:
      const winner = checkForWinner(state) && state.currentUser
      return {
        ...state,
        currentUser: state.currentUser === 'X' ? '0' : 'X',
        winner,
        draw: !winner && state.movesMade === Math.pow(state.gridSize, 2)
      }
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
        coordinates: [userI, userJ]
      } = action.payload

      return {
        ...state,
        movesMade: state.movesMade + 1,
        grid: state.grid.map((row, i) => row.map((cell, j) => {
            if (userI === i && userJ === j) {
              return state.currentUser
            }
            return cell
        }))
      }
    default:
      throw new Error('Action not supported.')
  }
}

export default function Home() {
  const [state, dispatch] = useReducerWithLogger(reducer, initialState)
  const cellStyleMapping = {
    '': '',
    'X': styles.x,
    '0': styles.o
  }
  const handleCellClick = (i, j) => () => {
    dispatch({
      type: USER_MOVE,
      payload: { coordinates: [i, j] }
    })

    dispatch({ type: PROCESS_BOARD })
  }

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
        <div className={styles.scoreboard}>
          {state.winner && <span>{`${state.winner} wins!`}</span>}
          {state.draw && <span>Draw 🤬</span>}
        </div>
        <div className={styles.grid}>
          {state.grid.map((row, i) => (
            <div className={styles.row} key={i}>{row.map((cellValue, j) => (
              <div
                className={styles.cell}
                key={j}
                {...(cellValue === '' && { onClick: handleCellClick(i, j) })}
              >
                <div className={cellStyleMapping[cellValue]}/>
              </div>
            ))}</div>
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