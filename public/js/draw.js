document.addEventListener('DOMContentLoaded', () => {
    const checkerboard = document.querySelector('.checkerboard');
    const cols = Math.ceil(window.innerWidth / squareSize);
    const rows = Math.ceil(window.innerHeight / squareSize);
    
    // Function to create the checkerboard pattern
    function createCheckerboard() {
        checkerboard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        checkerboard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        checkerboard.innerHTML = ''; // Clear any existing squares
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const square = document.createElement('div');
                
                // Store x and y as data attributes
                square.dataset.x = col;
                square.dataset.y = row;

                // Determine if the square should be black or white
                if ((row + col) % 2 === 0) {
                    square.style.backgroundColor = 'var(--cw)';
                } else {
                    square.style.backgroundColor = 'var(--cb)';
                }

                square.classList.add("square");
                
                checkerboard.appendChild(square);
            }
        }
    }

    // Function to change the color of a square based on x, y coordinates
    function changeColorByCoordinates(x, y, color) {
        const square = document.querySelector(`.checkerboard div[data-x='${x}'][data-y='${y}']`);
        if (square) {
            square.style.backgroundColor = color;
        }
    }

    // Create the checkerboard initially
    createCheckerboard();

    // Redraw the checkerboard on window resize to adjust to new dimensions
    window.addEventListener('resize', createCheckerboard);

    let x = x_start;
    let y = y_start;

    let directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1], [0, 0]];

    function move() {
        let randomInt = Math.floor(Math.random() * directions.length);
        let dxy = directions[randomInt];
        // let dy = directions[randomInt][1];
        x += dxy[0];
        y += dxy[1];
        
        if (x > cols) {
            x = 0;
        }
        if (y > rows) {
            y = 0;
        }
        if (x < 0) {
            x = cols;
        }
        if (y < 0) {
            y = rows;
        }


        // for (let i = 0; i < x.length - 1; i++) {
        //     x[i+1] = x[i];
        //     y[i+1] = y[i];
        // }
        // x[0] += dx;
        // y[0] += dy;

        changeColorByCoordinates(x, y, 'var(--mint)');
    }

    function move_n(n) {
        if (n<=0) {
            return;
        } else {
            move();
            move_n(n - 1);
        }
    }

    function move_2() {
        move();
    }
    function move_3() {
        move();
        move_2();
    }
    function move_5() {
        move_2();
        move_3();
    }
    function move_10() {
        move_5();
        move_5();
    }

    // window.setInterval(move, 15);
    window.setInterval(move_3, 20);
    window.setInterval(move, 30);
    // window.setInterval(move_5, 50);
    window.setInterval(move_5, 70);
    window.setInterval(move_10, 100);
});

