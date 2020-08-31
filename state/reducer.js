import { useReducer, useEffect, useRef, useMemo } from "react";

export const USER_MOVE = "user_move";
export const RESET_GRID = "reset_grid";
export const RESIZE_GRID = "resize_grid";
export const PROCESS_BOARD = "process_board";
export const TOGGLE_AI = 'toggle_ai'
export const AI_MOVE = 'ai_move'

export default () => useReducerWithLogger(reducer, initialState);

const initialState = {
  grid: [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ],
  currentUser: "X",
  movesMade: 0,
  gridSize: 3,
  winner: false,
  draw: false,
  maxSize: 13,
  minSize: 1,
  ai: false
};

function reducer(state, action) {
  switch (action.type) {
    case AI_MOVE:
        let bestScore = -Infinity
        let move

        for (let i = 0; i < state.gridSize; i++) {
          for (let j = 0; j < state.gridSize; j++) {
            const theoreticalGrid = state.grid.map(row => row.map(cell => cell))

            if (theoreticalGrid[i][j] === '') {
              let score = minimax({
                grid: theoreticalGrid,
                depth: 0,
                isMaximizing: false,
                currentUser: state.currentUser
              })

              theoreticalGrid[i][j] = state.currentUser

              if (score > bestScore) {
                bestScore = score
                move = { i, j }
              }
            }
          }
        }

        return {
            ...state,
            currentUser: state.currentUser === "X" ? "0" : "X",
            grid: state.grid.map((row, i) => row.map((cell, j) => {
              if (i === move.i && j === move.j) {
                return state.currentUser
              }
              return cell
            }))
        }
    case TOGGLE_AI:
        return {
            ...state,
            ai: !state.ai
        }
    case PROCESS_BOARD:
      const winner = checkForWinner(state) && state.currentUser;
      return {
        ...state,
        currentUser: state.currentUser === "X" ? "0" : "X",
        winner,
        draw: !winner && state.movesMade === Math.pow(state.gridSize, 2),
      };
    case RESIZE_GRID:
      const { newSize } = action.payload;
      return {
        ...state,
        gridSize: newSize,
        grid: new Array(newSize).fill(new Array(newSize).fill("")),
      };
    case RESET_GRID:
      return initialState;
    case USER_MOVE:
      const {
        coordinates: [userI, userJ],
      } = action.payload;

      return {
        ...state,
        movesMade: state.movesMade + 1,
        grid: state.grid.map((row, i) =>
          row.map((cell, j) => {
            if (userI === i && userJ === j) {
              return state.currentUser;
            }
            return cell;
          })
        ),
      };
    default:
      throw new Error("Action not supported.");
  }
}

function minimax({ grid, currentUser, depth, isMaximizing }) {
  // 🤬
  return Math.floor(Math.random() * 3) - 1;
  // const won = checkForWinner({
  //   grid,
  //   currentUser,
  //   gridSize: grid[0].length
  // });

  // if (won) {
  //   return currentUser === 'X' ? -1 : 1
  // }

  // // if draw
  // if (depth === Math.pow(grid[0].length, 2)) {
  //   return 0;
  // }

  // if (isMaximizing) {
  //   let bestScore = -Infinity;

  //   grid.forEach((row, i) => row.forEach((cell, j) => {
  //     const nextTheoreticalGrid = grid.map(row => row.map(cell => cell))

  //     // is the spot available?
  //     if (cell === '') {
  //       nextTheoreticalGrid[i][j] === 'X';
        
  //       const nextScore = minimax({
  //         grid: nextTheoreticalGrid,
  //         currentUser: currentUser === 'X' ? '0' : 'X',
  //         depth: depth + 1,
  //         isMaximizing: false
  //       });
  
  //       bestScore = Math.max(nextScore, bestScore);
  //     }
  //   }))

  //   return bestScore;
  // } else {
  //   let bestScore = Infinity;

  //   grid.forEach((row, i) => row.forEach((cell, j) => {
  //     const nextTheoreticalGrid = grid.map(row => row.map(cell => cell))
  //     // is the spot available?
  //     if (cell === '') {
  //       nextTheoreticalGrid[i][j] === 'X';
        
  //       const nextScore = minimax({
  //         grid: nextTheoreticalGrid,
  //         currentUser: currentUser === 'X' ? '0' : 'X',
  //         depth: depth + 1,
  //         isMaximizing: true
  //       });
  
  //       bestScore = Math.min(nextScore, bestScore);
  //     }
  //   }))
  //   return bestScore
  // }
}

function checkForWinner(state) {
  return (
    checkLeftAndRight() ||
    checkUpAndDown() ||
    checkUpLeftAndDownRight() ||
    checkUpRightAndDownLeft()
  );

  function checkUpAndDown() {
    let winner = false;

    for (let j = 0; j < state.gridSize && !winner; j++) {
      const cells = [];

      for (let i = 0; i < state.gridSize; i++) {
        cells.push(state.grid[i][j]);
      }

      winner =
        cells.filter((cell) => cell === state.currentUser).length ===
        state.gridSize;
    }

    return winner;
  }

  function checkLeftAndRight() {
    let winner = false;

    state.grid.forEach((row) => {
      if (!winner) {
        winner =
          row.filter((cell) => cell === state.currentUser).length ===
          state.gridSize;
      }
    });

    return winner;
  }

  function checkUpLeftAndDownRight() {
    for (let i = 0; i < state.grid[0].length; i++) {
      if (state.grid[i][i] !== state.currentUser) {
        return false;
      }
    }

    return true;
  }

  function checkUpRightAndDownLeft() {
    for (let i = 0; i < state.grid[0].length; i++) {
      if (state.grid[i][state.grid.length - 1 - i] !== state.currentUser) {
        return false;
      }
    }

    return true;
  }
}

function withLogger(dispatch) {
  return (action) => {
    console.log("Action type:", action.type);
    return dispatch(action);
  };
}

function useReducerWithLogger(...args) {
  let prevState = useRef(initialState);
  const [state, dispatch] = useReducer(...args);
  const dispatchWithLogger = useMemo(() => withLogger(dispatch), [dispatch]);

  useEffect(() => {
    console.log("Prev state:", prevState.current);
    console.log("Next state:", state);
    prevState.current = state;
  }, [state]);

  return [state, dispatchWithLogger];
}
