import Head from "next/head";

import reducer, {
  USER_MOVE,
  RESET_GRID,
  RESIZE_GRID,
  PROCESS_BOARD,
  TOGGLE_AI,
  AI_MOVE
} from "../state/reducer";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [state, dispatch] = reducer();
  const cellStyleMapping = {
    "": "",
    X: styles.x,
    0: styles.o,
  };
  const handleCellClick = (i, j) => () => {
    dispatch({
      type: USER_MOVE,
      payload: { coordinates: [i, j] },
    });

    dispatch({ type: PROCESS_BOARD });
  };
  const handleSlider = ({ target: { value } }) => dispatch({
    type: RESIZE_GRID,
    payload: { newSize: parseInt(value) },
  });
  const handleAIClick = () => dispatch({ type: TOGGLE_AI })

  if (!state.winner && !state.draw && state.ai && state.currentUser === '0') {
    dispatch({ type: AI_MOVE })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Tic Tac Toe</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>T - T - T</h1>
        <div className={styles.scoreboard}>
          {state.winner && <span>{`${state.winner} wins!`}</span>}
          {state.draw && <span>Draw 🤬</span>}
        </div>
        <div className={styles.grid}>
          {state.grid.map((row, i) => (
            <div className={styles.row} key={i}>
              {row.map((cellValue, j) => (
                <div
                  className={styles.cell}
                  key={j}
                  {...(!state.winner && cellValue === "" && (!state.ai || state.currentUser === 'X') && { onClick: handleCellClick(i, j) })}
                >
                  <div className={cellStyleMapping[cellValue]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.settings}>
          <input
            type="range"
            disabled={state.movesMade > 0}
            onChange={handleSlider}
            value={state.gridSize}
            min={state.minSize}
            max={state.maxSize}
          />
          {(state.draw || state.winner) && (
            <div
              className={styles.reset}
              onClick={() => dispatch({ type: RESET_GRID })}
            >
              Reset?
            </div>
          )}
          <div
            className={[styles.ai, state.ai && styles.active,  state.movesMade === 0 && styles.pointer].join(' ')}
            {...(state.movesMade === 0 && { onClick: handleAIClick })}
          >
            vs ai
          </div>
        </div>
      </main>
    </div>
  );
}
