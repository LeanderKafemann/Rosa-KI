(() => {
  const root = document.createElement("div");
  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent = `
    #ttt { font-family: Arial; display: flex; flex-direction: column; gap: 12px; align-items: center; }
    .boards { display: flex; gap: 20px; }
    .board { display: grid; grid-template-columns: repeat(3, 60px); gap: 4px; }
    .cell { width: 60px; height: 60px; border: 2px solid #333;
      display: flex; justify-content: center; align-items: center; font-size: 32px; cursor: pointer; }
    .cell:hover { background: #eee; }
    .panel { font-size: 12px; line-height: 1.4; }
    select, button { margin-top: 6px; width: 100%; }
    .legend { display: flex; gap: 8px; margin-top: 8px; align-items: center; font-size: 12px; }
    .color-box { width: 16px; height: 16px; display: inline-block; border: 1px solid #333; }
    .good { background: #a0e6a0; }
    .neutral { background: #ffffff; }
    .bad { background: #f4a0a0; }
  `;
  document.head.appendChild(style);

  root.innerHTML = `
    <div class="panel">
      <select id="level"></select>
      <button id="restart">Neustart</button>
      <div id="levelName" class="title"></div>
      <div id="levelDesc"></div>
      <div id="moveExplain"></div>
    </div>
    <div class="boards">
      <div>
        <div class="title">Spiel</div>
        <div class="board" id="mainBoard"></div>
      </div>
      <div>
        <div class="title">KI-Bewertung</div>
        <div class="board" id="evalBoard"></div>
      </div>
    </div>
    <div class="legend">
      <div><div class="color-box good"></div> Gewinn möglich / gut</div>
      <div><div class="color-box neutral"></div> Neutral / Unentschieden</div>
      <div><div class="color-box bad"></div> Verlust / schlecht</div>
      <div>? = unbewertetes Feld / zufälliger Zug</div>
    </div>
  `;

  const mainBoardEl = root.querySelector("#mainBoard");
  const evalBoardEl = root.querySelector("#evalBoard");
  const levelEl = root.querySelector("#level");
  const levelNameEl = root.querySelector("#levelName");
  const levelDescEl = root.querySelector("#levelDesc");
  const moveExplainEl = root.querySelector("#moveExplain");
  const restartBtn = root.querySelector("#restart");

  let board = Array(9).fill(null);
  let gameOver = false;

  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const levels = [
    { name: "1 – Random", desc: "Zufälliger Zug." },
    { name: "2 – Reaktion auf letzten Zug", desc: "Reagiert nur auf deinen letzten Zug." },
    { name: "3 – Blockieren", desc: "Blockiert mögliche Spieler-Gewinne." },
    { name: "4 – Gewinnen / Blockieren", desc: "Versucht zu gewinnen, sonst blockieren." },
    { name: "5 – Regelbasiert", desc: "Regeln: Gewinnen → Blockieren → Mitte → Ecken → Kanten." },
    { name: "6 – Menschlich", desc: "Regelbasiert mit 20% bewusst schlechterem Zug." },
    { name: "7 – Minimax (perfekt)", desc: "Berechnet alle Spielverläufe, wählt optimal." },
    { name: "8 – Minimax + Zufall", desc: "Wie Minimax, bei gleich guten Zügen zufällig." }
  ];

  levels.forEach((l,i)=>{
    const o=document.createElement("option");
    o.value=i+1; o.textContent=l.name;
    levelEl.appendChild(o);
  });

  const createBoard = (el) => {
    const cells = [];
    for(let i=0;i<9;i++){
      const c = document.createElement("div");
      c.className="cell";
      el.appendChild(c);
      cells.push(c);
    }
    return cells;
  }

  const mainCells = createBoard(mainBoardEl);
  const evalCells = createBoard(evalBoardEl);

  const coord = i => `Feld ${i} (Zeile ${Math.floor(i/3)+1}, Spalte ${i%3+1})`;

  function render(){
    mainCells.forEach((c,i)=>c.textContent=board[i]||"");
  }

  function renderEval(level){
    evalCells.forEach((c,i)=>{
      if(board[i]!==null){c.textContent=board[i]; c.style.background="#fff"; return;}
      let score = null;
      if(level>=3){
        board[i]="O";
        if(checkWin("O")) score=1;
        else if(playerCanWinNext()) score=-1;
        else score=0;
        board[i]=null;
      }
      c.textContent = score===null?"?":"O";
      c.style.background = score===1?"#a0e6a0":score===-1?"#f4a0a0":"#fff";
    });
  }

  function playerCanWinNext() {
    return board.some((v,i)=>{
      if(v!==null) return false;
      board[i]="X";
      const win = checkWin("X");
      board[i]=null;
      return win;
    });
  }

  function playerMove(i){
    if(board[i]||gameOver) return;
    board[i]="X"; 
    render();
    checkGameEnd("X");
    renderEval(+levelEl.value);
    if(!gameOver) setTimeout(()=>computerMove(i),300);
  }

  function computerMove(last){
    if(gameOver) return;
    const lvl = +levelEl.value;
    levelNameEl.textContent = levels[lvl-1].name;
    levelDescEl.textContent = levels[lvl-1].desc;

    let move;
    const free = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);

    if(lvl===1||lvl===2){ move=random(free); }
    else if(lvl===3){ move=block()??random(free); }
    else if(lvl===4){ move=win()??block()??random(free); }
    else if(lvl===5){ move=strategy()??random(free); }
    else if(lvl===6){ move=Math.random()<0.2?random(free):strategy()??random(free); }
    else if(lvl>=7){
      const mmScores = board.map((v,i)=>{
        if(v!==null) return null;
        board[i]="O";
        const s=mm(false);
        board[i]=null;
        return s;
      });
      const max = Math.max(...mmScores.filter(v=>v!==null));
      const best = [];
      mmScores.forEach((s,i)=>{if(s===max) best.push(i)});
      move = (lvl===8)?best[Math.floor(Math.random()*best.length)]:best[0];
    }

    board[move]="O";
    render();
    checkGameEnd("O");
    renderEval(lvl);
    moveExplainEl.textContent = `Letzter Spielerzug: ${coord(last)}\nComputerzug: ${coord(move)}`;
  }

  function checkGameEnd(p){
    if(checkWin(p)){
      gameOver=true;
      moveExplainEl.textContent += `\n${p==="O"?"Computer":"Spieler"} gewinnt!`;
    } else if(board.every(v=>v!==null)){
      gameOver=true;
      moveExplainEl.textContent += "\nUnentschieden!";
    }
  }

  const random = free => free[Math.floor(Math.random()*free.length)];
  const line=p=>wins.find(w=>w.filter(i=>board[i]===p).length===2 && w.some(i=>board[i]===null))?.find(i=>board[i]===null)??null;
  const block=()=>line("X");
  const win=()=>line("O");
  const strategy=()=>win()??block()??(board[4]===null?4:null)??[0,2,6,8].find(i=>board[i]===null)??board.map((v,i)=>v===null?i:null).filter(v=>v!==null)[0];

  function mm(max){
    if(checkWin("O")) return 1;
    if(checkWin("X")) return -1;
    if(board.every(v=>v!==null)) return 0;
    const scores=[];
    board.forEach((v,i)=>{
      if(!v){ board[i]=max?"O":"X"; scores.push(mm(!max)); board[i]=null; }
    });
    return max?Math.max(...scores):Math.min(...scores);
  }

  const checkWin=p=>wins.some(w=>w.every(i=>board[i]===p));

  restartBtn.onclick=()=>{
    board=Array(9).fill(null);
    gameOver=false;
    render();
    renderEval(+levelEl.value);
    moveExplainEl.textContent="";
  }

  mainCells.forEach((c,i)=>c.addEventListener("click",()=>playerMove(i)));
})();
