import React from 'react';
import { StyledDisplay } from './styles/StyledDisplay';

const DisplayInput = ({ gameOver, gamer, onchange }) => (
  <StyledDisplay gameOver={gameOver}><input type="text" value={gamer} onChange={onchange}/></StyledDisplay>
);

export default DisplayInput;
