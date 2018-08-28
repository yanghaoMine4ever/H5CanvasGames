function Two048() {
    this.data = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    this.cells = [];
    this.newCell();
    this.newCell();
}

Two048.prototype = {
    newCell: function() {
        var index = ~~(Math.random() * 16);
        var x = index % 4;
        var y = ~~(index / 4);
        if(this.data[y][x] == 0) {
            this.data[y][x] = 2;
            var cell = new Cell({
                number: 2,
                x: x + 0.5,
                y: y + 0.5,
                bgColor: '#eee4da',
                color: '#776e65',
                len: 0
            });
            this.cells.push(cell);
            cell.animate_new();
            return;
        }
        this.newCell();
    },
    left: function() {

    },
    up: function() {
        this.cells.forEach(cell => {
            cell.animate_move({
                destination: 0,
                direction: 1
            });
        });
    },
    right: function() {
        this.cells.forEach(cell => {
            cell.animate_move({
                destination: 3,
                direction: 0
            });
        });
    },
    down: function() {

    },
    gameOver: function() {
        return false;
    }
};

function Cell (option) {
    this.len = option.len;
    this.number = option.number;
    this.x = option.x;
    this.y = option.y;
    this.bgColor = option.bgColor;
    this.color = option.color;
}

Cell.prototype = {
    update: function(dt) {
        
    },
    animate_new: function() {
        var timer = setInterval(function() {
            this.x -= 0.05;
            this.y -= 0.05;
            this.len += 105 / 10;
            if(this.len >= 105) {
                clearInterval(timer);
            }
        }.bind(this), 1000 / 50);
    },
    animate_move: function(option) {
        var ds = option.direction == 0 ? this.x : this.y;
        var dx = option.destination - ds;
        var timer = setInterval(function() {
            ds += dx / 5;
            option.direction == 0 ? this.x = ds: this.y = ds
            if(Math.abs(ds - option.destination) <= Math.abs(dx / 5)) {
                option.direction == 0 ? this.x = option.destination : this.y = option.destination;
                if(option.disappear) {
                    this.dead = true;
                }
                clearInterval(timer);
            }
        }.bind(this), 1000 / 50);
    }
};
