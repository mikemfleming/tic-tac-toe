import Head from "next/head";

import reducer, {
  USER_MOVE,
  RESET_GRID,
  RESIZE_GRID,
  PROCESS_BOARD,
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
                  {...(cellValue === "" && { onClick: handleCellClick(i, j) })}
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
            onChange={({ target: { value } }) =>
              dispatch({
                type: RESIZE_GRID,
                payload: { newSize: parseInt(value) },
              })
            }
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
        </div>
      </main>
    </div>
  );
}
