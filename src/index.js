import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button className={props.className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}
  
  class Board extends React.Component {
    renderSquare(i) {
      let className = 'square';
      if (
        this.props.line !== null
        && this.props.line.indexOf(i) !== -1
      ) {
        className += ' win';
      }
      return (
        <Square 
          className={className}
          value={this.props.squares[i]} 
          onClick={() => this.props.onClick(i)}
          key={i}
        />
      );
    }
  
    render() {
      const rows = [0, 1, 2];
      const cols = [0, 1, 2];
      return (
        <div>
          {rows.map(row => {
            return (
              <div className="board-row" key={row}>
                {cols.map(col => this.renderSquare(row * 3 + col))}
              </div>
            );
          })}
        </div>
      );
    }
  }

  class Toggle extends React.Component {
    render() {
      return (
            <div className="game-toggle">
              <span>History order:&nbsp;</span>
              <input type="radio" name="order" id="asc" value="asc" checked={this.props.order === 'asc'}
                    onChange={() => this.props.onChange()}/>
              <label htmlFor="asc" className="switch-on">ASC</label>
              <input type="radio" name="order" id="desc" value="desc" checked={this.props.order === 'desc'}
                    onChange={() => this.props.onChange()}/>
              <label htmlFor="desc" className="switch-off">DESC</label>
            </div>
      )
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          location: {
            col: null,
            row: null,
          },
        }],
        stepNumber: 0,
        xIsNext: true,
        order: 'asc',
      };
    }

    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares).winner || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          location: {
            col: i % 3 + 1,
            row: Math.trunc(i / 3) + 1,
          },
        }]),
        stepNumber: history.length,
        xIsNext:  !this.state.xIsNext,
      });
    }

    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0
      });
    }

    handleChange(){
      const order = this.state.order === 'asc' ? 'desc' : 'asc';
      this.setState({
        order: order
      });
    }

    render() {
      const history  = this.state.history;
      const current = history[this.state.stepNumber];
      const win = calculateWinner(current.squares);
      const winner = win.winner;
      const line = win.line;
      let moves = history.map((step, move)  => {
        const desc =  move ?
          'Go to move #' + move + ' (' + step.location.col + ', ' + step.location.row + ')':
          'Go to game start';
        const className  = move === this.state.stepNumber ? 'current' : '';
          return (
            <li key={move} className={className}>
              <button onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
          );
      });

      if (this.state.order === 'desc') {
        moves = moves.reverse();
      }

      let status;
      if (winner) {
        status = 'Winner: ' + winner;
      } else {
        if(this.state.stepNumber === 9){
          status = 'Draw';
        } else {
          status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board
              line={line}
              squares={current.squares}
              onClick={(i) => this.handleClick(i)} 
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <Toggle 
              order={this.state.order}
              onChange={() => this.handleChange()}
            />
            <ol>{moves}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Game />);
  
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
        return {
          'winner': squares[a],
          'line': lines[i]
        };
      }
    }
    return{
      'winner': null,
      'line': null
    };
  }
