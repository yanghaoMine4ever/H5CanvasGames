function Block(x, y, type, random) {
    if (random) {
        var i = ~~(Math.random() * 7);
        this.type = i == 0 ? BLOCK.LL : i == 1 ? BLOCK.RL : i == 2 ? BLOCK.LS : i == 3 ? BLOCK.RS :
            i == 4 ? BLOCK.I : i == 5 ? BLOCK.O : BLOCK.T;
    } else {
        this.type = type;
    }
    this.data = this.type.data;
    this.x = x;
    this.y = y;
    if (this.type == BLOCK.I) {
        this.y -= 2;
    }
    this.isFall = true;
}

Block.prototype = {
    rotate: function () {
        this.data = rotate90(this.data);
    },
    fall: function () {
        this.y++;
    }
};

var N = 0, Y = 1, W = 2;
/**七种方块矩阵及其颜色 */
var BLOCK = {
    LL: {
        color: '#ea4708',
        data: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ]
    },
    RL: {
        color: '#3e97cc',
        data: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ]
    },
    LS: {
        color: '#efbf67',
        data: [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0]
        ]
    },
    RS: {
        color: '#47b334',
        data: [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ]
    },
    T: {
        color: "#ff9900",
        data: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ]
    },
    O: {
        color: "#ec74ec",
        data: [
            [1, 1],
            [1, 1]
        ]
    },
    I: {
        color: "pink",
        data: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    }
};

/**矩阵旋转 */
function rotate90(matrix) {
    var temp = [], row = matrix.length, col = matrix[0].length;
    for (var j = 0; j < col; j++) {
        temp[j] = [];
        for (var i = 0; i < row; i++) {
            temp[j][i] = matrix[row - i - 1][j];
        }
    }
    return temp;
}
