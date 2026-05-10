import { useState } from 'react';

// Стили прямо здесь, ничего скачивать не нужно
const styles = `
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5;
  }
  
  .game {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    font-size: 48px;
    color: #333;
    margin: 20px 0 40px 0;
  }
  
  /* Основная раскладка: поле слева, история справа */
  .game-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 40px;
  }
  
  .board-wrapper {
    background: white;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  
  .history-wrapper {
    background: white;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    min-width: 220px;
  }
  
  .history-wrapper h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 20px;
  }
  
  .status {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: #555;
    padding: 10px;
    background: #f0f0f0;
    border-radius: 12px;
  }
  
  .board-row {
    display: flex;
  }
  
  .square {
    width: 80px;
    height: 80px;
    font-size: 40px;
    font-weight: bold;
    border: 2px solid #ddd;
    cursor: pointer;
    background: white;
    transition: all 0.2s ease;
  }
  
  .square:hover {
    background: #f9f9f9;
    transform: scale(1.02);
  }
  
  .history-wrapper ol {
    padding-left: 20px;
    margin: 0 0 20px 0;
  }
  
  .history-wrapper li {
    margin: 10px 0;
  }
  
  .history-wrapper button {
    padding: 6px 14px;
    cursor: pointer;
    background: #e8e8e8;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .history-wrapper button:hover {
    background: #d0d0d0;
    transform: scale(1.02);
  }
  
  .current-move button {
    background: #667eea;
    color: white;
  }
  
  /* Кнопка "Начать заново" */
  .reset-btn {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .reset-btn:hover {
    background: #dc2626;
    transform: scale(1.02);
  }
  
  /* Для телефонов */
  @media (max-width: 600px) {
    .square {
      width: 70px;
      height: 70px;
      font-size: 32px;
    }
    h1 {
      font-size: 32px;
    }
  }
`;

// Компонент одной клетки
function Square({ value, onSquareClick, isWinning }) {
  // Цвета для крестиков и ноликов
  let textColor = 'black';
  if (value === 'X') textColor = '#e74c3c'; // красный
  if (value === 'O') textColor = '#2ecc71'; // зелёный

  return (
    <button
      className="square"
      style={{
        backgroundColor: isWinning ? '#f9e74d' : 'white',
        color: textColor
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

// Компонент игрового поля
function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    const winnerInfo = calculateWinner(squares);
    if (winnerInfo.winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo.winner;
  const winningLine = winnerInfo.line;

  let status;
  if (winner) {
    status = 'Победитель: ' + winner;
  } else {
    status = 'Следующий игрок: ' + (xIsNext ? 'X' : 'O');
  }

  // Рисуем поле 3x3
  const renderSquare = (i) => {
    const isWinning = winningLine && winningLine.includes(i);
    return (
      <Square
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinning={isWinning}
      />
    );
  };

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}

// ГЛАВНЫЙ КОМПОНЕНТ - всё начинается здесь
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // Функция "Начать заново" - сбрасывает всё в начало
  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  // Список ходов (история)
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Перейти к ходу №' + move;
    } else {
      description = 'К началу игры';
    }
    const isCurrent = move === currentMove;
    
    return (
      <li key={move} className={isCurrent ? 'current-move' : ''}>
        <button onClick={() => jumpTo(move)}>
          {description}
        </button>
      </li>
    );
  });

  return (
    <>
      {/* Вставляем стили в head */}
      <style>{styles}</style>
      
      <div className="game">
        {/* Большой красивый заголовок */}
        <h1>🎮 Крестики-Нолики</h1>
        
        <div className="game-container">
          {/* Игровое поле - слева */}
          <div className="board-wrapper">
            <Board 
              xIsNext={xIsNext} 
              squares={currentSquares} 
              onPlay={handlePlay} 
            />
          </div>
          
          {/* История ходов - справа */}
          <div className="history-wrapper">
            <h3>📜 История ходов</h3>
            <ol>{moves}</ol>
            {/* Новая кнопка "Начать заново" */}
            <button className="reset-btn" onClick={resetGame}>
              🔄 Начать заново
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Функция для определения победителя
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: [] };
}