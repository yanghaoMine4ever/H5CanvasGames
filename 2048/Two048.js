function Two048() {
    this.data = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    this.cells = [];
}

Two048.prototype = {
    new: function() {

    },
    left: function() {

    },
    up: function() {

    },
    right: function() {

    },
    down: function() {

    },
    gameOver: function() {
        return false;
    }
};

function Cell (option) {
    this.len = 105;
    this.number = option.number;
    this.x = option.x;
    this.y = option.y;
    this.bgColor = option.bgColor;
    this.color = option.color;
}

Cell.prototype = {
    update: function(dt) {
        
    },
    animate: function(option) {

    }
};
