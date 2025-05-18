let nextWindowTop = 100;
let nextWindowLeft = 200;
let topZ = 200;
const windowOffset = 30;

// Open window on double-clicking an icon
document.querySelectorAll('.icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const win = document.getElementById('window-' + icon.dataset.window);
    if (win) showWindow(win);
  });
  icon.addEventListener('dblclick', () => {
    const win = document.getElementById('window-' + icon.dataset.window);
    if (win) showWindow(win);
  });
});

// Close window when clicking the close button
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.window').style.display = 'none';
  });
});

// Make windows draggable
document.querySelectorAll('.window').forEach(win => {
  const titlebar = win.querySelector('.window-titlebar');
  let isDragging = false, offsetX, offsetY;

  titlebar.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - win.offsetLeft;
  offsetY = e.clientY - win.offsetTop;
  topZ++;
  win.style.zIndex = topZ; // Bring to front when dragging starts
});

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      win.style.left = (e.clientX - offsetX) + 'px';
      win.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    win.style.zIndex = 100;
  });
});

// Taskbar clock
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  if (m < 10) m = '0' + m;
  document.getElementById('clock').textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// Start menu toggle
const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
});

// Hide start menu when clicking elsewhere
document.addEventListener('click', () => {
  startMenu.style.display = 'none';
});

// Open window from start menu
document.querySelectorAll('#start-menu li').forEach(item => {
  item.addEventListener('click', (e) => {
    const win = document.getElementById('window-' + item.dataset.window);
    if (win) showWindow(win);
    startMenu.style.display = 'none';
    e.stopPropagation();
  });
});

// Minimize button
document.querySelectorAll('.min-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const win = e.target.closest('.window');
    win.classList.add('minimized');
  });
});

// Maximize/Restore button
document.querySelectorAll('.max-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const win = e.target.closest('.window');
    topZ++;
    win.style.zIndex = topZ; // Bring to front
    if (win.classList.contains('maximized')) {
      // Restore previous position and size
      win.classList.remove('maximized');
      win.style.top = win.dataset.prevTop || '';
      win.style.left = win.dataset.prevLeft || '';
      win.style.width = win.dataset.prevWidth || '';
      win.style.height = win.dataset.prevHeight || '';
    } else {
      // Save current position and size
      win.dataset.prevTop = win.style.top;
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevWidth = win.style.width;
      win.dataset.prevHeight = win.style.height;
      // Maximize
      win.classList.add('maximized');
      win.style.top = '0';
      win.style.left = '0';
      win.style.width = '100vw';
      win.style.height = 'calc(100vh - 40px)';
    }
  });
});

// Restore minimized window when opened again
function showWindow(win) {
  win.style.display = 'block';
  win.classList.remove('minimized');
  // Only set position if the window has never been opened before
  if (!win.dataset.opened) {
    let baseTop = nextWindowTop;
    let baseLeft = nextWindowLeft;
    let randomTop = baseTop + Math.floor(Math.random() * 41) - 20;
    let randomLeft = baseLeft + Math.floor(Math.random() * 41) - 20;
    win.style.top = randomTop + 'px';
    win.style.left = randomLeft + 'px';
    let randomStep = 20 + Math.floor(Math.random() * 41); // 20 to 60
    nextWindowTop += randomStep;
    nextWindowLeft += randomStep;
    if (nextWindowTop > window.innerHeight - 200) nextWindowTop = 100;
    if (nextWindowLeft > window.innerWidth - 300) nextWindowLeft = 200;
    win.dataset.opened = 'true';
    // Create taskbar button
    const winId = win.id.replace('window-', '');
    if (!document.getElementById('taskbar-btn-' + winId)) {
      createTaskbarBtn(winId);
    }
  }
  // Set taskbar button active
  const winId = win.id.replace('window-', '');
  setOnlyActiveTaskbarBtn(winId);
  // Bring to front
  topZ++;
  win.style.zIndex = topZ;

  // Minesweeper: create board when window is opened
  if (win.id === 'window-minesweeper') {
    setTimeout(() => createMinesweeper(), 10);
  }
}

document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => {
    topZ++;
    win.style.zIndex = topZ;
    const winId = win.id.replace('window-', '');
    setOnlyActiveTaskbarBtn(winId);
  });
});

const windowTitles = {
  about: "About Me",
  projects: "Projects",
  contact: "Contact",
  blog: "Blog",
  links: "Links",
  cv: "CV"
};

const taskbar = document.getElementById('taskbar-windows');

// Helper to create a taskbar button for a window
function createTaskbarBtn(winId) {
  let btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'taskbar-btn-' + winId;
  btn.textContent = windowTitles[winId] || winId;
  btn.addEventListener('click', () => {
    const win = document.getElementById('window-' + winId);
    if (win.classList.contains('minimized')) {
      showWindow(win);
    }
    // Bring to front
    topZ++;
    win.style.zIndex = topZ;
    win.style.display = 'block';
    win.classList.remove('minimized');
    setOnlyActiveTaskbarBtn(winId);
  });
  taskbar.appendChild(btn);
}

// Helper to set active/inactive state
function setTaskbarBtnActive(winId, active) {
  const btn = document.getElementById('taskbar-btn-' + winId);
  if (btn) {
    if (active) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

// When minimizing, set taskbar button inactive
document.querySelectorAll('.min-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const win = e.target.closest('.window');
    win.classList.add('minimized');
    const winId = win.id.replace('window-', '');
    setTaskbarBtnActive(winId, false);
  });
});

// When closing, remove taskbar button
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const win = e.target.closest('.window');
    win.style.display = 'none';
    const winId = win.id.replace('window-', '');
    const taskBtn = document.getElementById('taskbar-btn-' + winId);
    if (taskBtn) taskBtn.remove();
    win.dataset.opened = '';
  });
});

// When window is brought to front, set taskbar button active
document.querySelectorAll('.window').forEach(win => {
  win.addEventListener('mousedown', () => {
    const winId = win.id.replace('window-', '');
    setOnlyActiveTaskbarBtn(winId);
  });
});

// Minesweeper
function createMinesweeper(rows = 9, cols = 9, mines = 10) {
  const container = document.getElementById('minesweeper-game');
  container.innerHTML = '';
  let board = [];
  let revealed = [];
  let flagged = [];
  let gameOver = false;

  // Create board
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    revealed[r] = [];
    flagged[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = 0;
      revealed[r][c] = false;
      flagged[r][c] = false;
    }
  }

  // Place mines
  let placed = 0;
  while (placed < mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (board[r][c] === 'M') continue;
    board[r][c] = 'M';
    placed++;
  }

  // Calculate numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === 'M') count++;
        }
      }
      board[r][c] = count;
    }
  }

  // Render board
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.margin = 'auto';
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const td = document.createElement('td');
      td.style.width = '24px';
      td.style.height = '24px';
      td.style.border = '1px solid #888';
      td.style.background = '#c0c0c0';
      td.style.textAlign = 'center';
      td.style.fontFamily = 'monospace';
      td.style.fontWeight = 'bold';
      td.style.cursor = 'pointer';
      td.oncontextmenu = e => { e.preventDefault(); return false; };

      td.addEventListener('click', () => {
        if (gameOver || revealed[r][c] || flagged[r][c]) return;
        reveal(r, c);
      });

      td.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameOver || revealed[r][c]) return;
        flagged[r][c] = !flagged[r][c];
        td.textContent = flagged[r][c] ? '🚩' : '';
      });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);

  function reveal(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || revealed[r][c] || flagged[r][c]) return;
    const td = table.rows[r].cells[c];
    revealed[r][c] = true;
    td.style.background = '#e0e0e0';
    if (board[r][c] === 'M') {
      td.textContent = '💣';
      td.style.background = '#f88';
      gameOver = true;
      revealAll();
      setTimeout(() => alert('Game Over!'), 100);
      return;
    } else if (board[r][c] > 0) {
      td.textContent = board[r][c];
      td.style.color = ['#0000FF','#008200','#FF0000','#000084','#840000','#008284','#840084','#000000'][board[r][c]-1];
    } else {
      td.textContent = '';
      // Reveal neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          reveal(r + dr, c + dc);
        }
      }
    }
    checkWin();
  }

  function revealAll() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!revealed[r][c]) {
          const td = table.rows[r].cells[c];
          if (board[r][c] === 'M') {
            td.textContent = '💣';
            td.style.background = '#f88';
          }
        }
      }
    }
  }

  function checkWin() {
    let safe = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!revealed[r][c] && board[r][c] !== 'M') safe++;
      }
    }
    if (safe === 0 && !gameOver) {
      gameOver = true;
      setTimeout(() => alert('You Win!'), 100);
    }
  }
}

function setOnlyActiveTaskbarBtn(winId) {
  document.querySelectorAll('.taskbar-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const btn = document.getElementById('taskbar-btn-' + winId);
  if (btn) btn.classList.add('active');
}

document.querySelectorAll('.window').forEach(win => {
  const handle = win.querySelector('.resize-handle.se');
  if (!handle) return;
  let isResizing = false, startX, startY, startWidth, startHeight;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    let newWidth = startWidth + (e.clientX - startX);
    let newHeight = startHeight + (e.clientY - startY);
    // Set minimum size
    newWidth = Math.max(newWidth, 200);
    newHeight = Math.max(newHeight, 100);
    win.style.width = newWidth + 'px';
    win.style.height = newHeight + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.userSelect = '';
    }
  });
});
