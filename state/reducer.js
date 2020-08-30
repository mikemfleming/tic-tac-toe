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
        return {
            ...state,
            currentUser: state.currentUser === "X" ? "0" : "X"
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
