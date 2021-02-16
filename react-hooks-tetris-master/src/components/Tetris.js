import React, {useEffect, useState} from 'react';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { createStage, checkCollision } from '../gameHelpers';

// Custom Hooks
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';
import './vapp.css';
import axios from 'axios';
import {Table} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cell from "./Cell";
import {TETROMINOS} from '../tetrominos'

const Tetris = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [stop, setStop] = useState(true);
  const [stopText, setStopText] = useState('Stop');
  const [nextTermino, setnextTermino] = useState('');
  const [gamer, setGamer] = useState((localStorage.getItem('gamer_tetris') == null)? '' : localStorage.getItem('gamer_tetris'));
  const [start, setStart] = useState(false);
  const [error, setError] = useState('');
  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(
    rowsCleared
  );
  const [topUser, setTopUser]  = useState([]);


  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      // Activate the interval again when user releases down arrow.
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1));
      }
    } else {
      console.log(score, 'pont');
    }
  };

  const startGame = () => {

    // Reset everything
    if(gamer !== '') {
      setStage(createStage());
      setDropTime(1000);
      resetPlayer();
      setScore(0);
      setLevel(0);
      setRows(0);
      setStart(true);
      setGameOver(false);
      setError('');
      axios.post("https://vmm.vector.hu/api/games/highscore/get", {game: 'tetris'}, {
        headers: {
          "Authorization" : "JjhFhwXh6SzbjyDHFRmkY5SC77M7qPS3aGJcfsWFzLxArvcAL9BX444PNzXGqgbHDm3NJMqGXTHcDLNKbV7U2EY59knXQhPxdpbWTmTapqZzCZXXYqJH4QBSpLHyV42CdHkesp3UytJ5CXrEHe3zpKhw45TddG8sUJ7Hf2Y5eb5VRkWcJfFUTmjebarHKrgKzU3y8fnjecuS4aBdcmpK2Rd45zQZgk7f8YgjwujhnxS5wJAMRNCFJwv5aBGT2wsY"
        }
      }).then(response => {
        setTopUser(response.data);
      });
      localStorage.setItem('gamer_tetris', gamer);
    }else{
      setError("ADD MEG a NEVED START ELOTT!")
    }
  };

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
      setnextTermino(localStorage.getItem('nextTermino'))
    } else {
      // Game over!
      if (player.pos.y < 1) {
        setGameOver(true);
        if(localStorage.getItem('topscore_tetris') == null)
        {
          localStorage.setItem('topscore_tetris', 0);
        }

        localStorage.setItem('topscore_tetris', score);
        axios.post("https://vmm.vector.hu/api/games/highscore/add", {game: 'tetris', name: gamer, score:score}, {
          headers: {
            "Authorization" : "JjhFhwXh6SzbjyDHFRmkY5SC77M7qPS3aGJcfsWFzLxArvcAL9BX444PNzXGqgbHDm3NJMqGXTHcDLNKbV7U2EY59knXQhPxdpbWTmTapqZzCZXXYqJH4QBSpLHyV42CdHkesp3UytJ5CXrEHe3zpKhw45TddG8sUJ7Hf2Y5eb5VRkWcJfFUTmjebarHKrgKzU3y8fnjecuS4aBdcmpK2Rd45zQZgk7f8YgjwujhnxS5wJAMRNCFJwv5aBGT2wsY"
          }
        })



        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const dropPlayer = () => {
    // We don't need to run the interval when we use the arrow down to
    // move the tetromino downwards. So deactivate it for now.
    setDropTime(null);
    drop();
  };

  const stopGame = () =>{
    setStop(!stop);
    if(stop){
      setStopText('Folytatas');
    }else{
      setStopText('Stop');
    }
  }

  // This one starts the game
  // Custom hook by Dan Abramov
  useInterval(() => {
    if(stop == true){
      drop();
    }
  }, dropTime);

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if(stop == true) {
        if (keyCode === 37) {
          movePlayer(-1);
        } else if (keyCode === 39) {
          movePlayer(1);
        } else if (keyCode === 40) {
          dropPlayer();
        } else if (keyCode === 38) {
          playerRotate(stage, 1);
        }
      }
    }
  };

  return (
    <StyledTetrisWrapper
      role="button"
      tabIndex="0"
      onKeyDown={e => move(e)}
      onKeyUp={keyUp}
    >
      <p className="center p-0" style={{ color: '#10E2AA' }}>Vector Kft. - VAPPRIS V1.6</p>
      <Table striped bordered hover className="max-w" >
        <thead>
        <tr>
          <th>Játékos</th>
          <th>Pont</th>
        </tr>
        </thead>
        <tbody>
        {topUser.map(function (item, i) {
          return (
              <tr>
                <td>
                  {item.name}
                </td>
                <td>
                  {item.score}
                </td>
              </tr>
          )
        })
        }
        </tbody>
      </Table>
    <StyledTetris>
        <Stage stage={stage} />


        <aside>
          {gameOver ? (
            <Display gameOver={gameOver} text={`Vege:${score}`} />
          ) : (
            <div>
              <Display text={`Pont: ${score}`} />
              <Display text={`Sor: ${rows}`} />
              <Display text={`Szin: ${level}`} />
              <Display text={<input className="gamer" placeholder="IDE IRD a NEVED" type="text" value={gamer} disabled={start}  onChange={e => setGamer(e.target.value)}/>} />
              <Display text={<div className={`nextTetrominos ${nextTermino}`}></div>} />


            </div>
          )}
          {error !== '' ? <span className="error" >{error}</span> : null}
          <StartButton callback={startGame} />
          <button className={`vapp-btn ${(stop == true ? 'error' : '')}`} onClick={stopGame} disabled={!start} >{stopText}</button>
        </aside>

      </StyledTetris>

    </StyledTetrisWrapper>
  );
};

export default Tetris;
