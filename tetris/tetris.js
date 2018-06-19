function Tetris(id, w, h, len) {
    var w = w || 18;
    var h = h || 24;
    var LEN = len || 30;
    var fallingBlock = new Block(w / 2 - 2, 1, null, true), nextBlock = new Block(w / 2, 1, null, true);
    var speed = 1;
    var score = 0;
    var data = [];
    var dots = [];
    for (var i = 0; i < (w + 2) * (h + 2); i++) {
        if (i < w + 2 || i > (w + 2) * (h + 1) || i % (w + 2) == 0 || i % (w + 2) == w + 1) { //墙
            data[i] = { element: W };
        } else {
            data[i] = { element: N };
        }
    }

    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');
    var bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    var ctx = bufferCanvas.getContext('2d');
    ctx.strokeStyle = 'black';
    var lastTime = 0;
    var callback = function (t) {
        var dt = t - lastTime;
        lastTime = t;
        update(dt);
        requestAnimationFrame(callback);
    };

    requestAnimationFrame(callback);

    var update = function (dt) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        updateBufferCanvas(dt);
        context.drawImage(bufferCanvas, 0, 0);
    }

    var updateBufferCanvas = function (dt) {
        ctx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        ctx.fillStyle = "#292323";
        ctx.fillRect(2 * LEN, 2 * LEN, LEN * w, LEN * h);
        drawBlock();
        dots.forEach(dot => dot.paint());
        for (var i = 0; i < dots.length; i++) {
            if (dots[i].y - dots[i].sy >= 100) {
                dots.splice(i, 1);
            } else {
                dots[i].update(dt);
            }
        }
    };

    var updateData = function () {
        if (canFall()) {
            fallingBlock.fall();
        } else {
            fallingBlock = nextBlock;
            nextBlock = new Block(w / 2 - 2, 1, null, true);
        }
        clear();
        if(over()) {
            clearInterval(timer);
            alert('game over');
        } 
    };

    var drawBlock = function () {
        //画正在下落的方块
        ctx.fillStyle = fallingBlock.type.color;
        for (var i = 0; i < fallingBlock.data.length; i++) {
            for (var j = 0; j < fallingBlock.data[i].length; j++) {
                if (fallingBlock.data[i][j] == 1) {
                    var index = toMapCoordinate(i, j);
                    ctx.strokeRect((index % (w + 2) + 1) * LEN + 1, (~~(index / (w + 2)) + 1) * LEN + 1, LEN - 2, LEN - 2);
                    ctx.fillRect((index % (w + 2) + 1) * LEN + 1, (~~(index / (w + 2)) + 1) * LEN + 1, LEN - 2, LEN - 2);
                }
            }
        }
        //画地图上的方块
        for (var i = 0; i < data.length; i++) {
            if (data[i].element == Y) {
                ctx.fillStyle = data[i].color;
                ctx.fillRect((i % (w + 2) + 1) * LEN + 1, (~~(i / (w + 2)) + 1) * LEN + 1, LEN - 2, LEN - 2);
                ctx.strokeRect((i % (w + 2) + 1) * LEN + 1, (~~(i / (w + 2)) + 1) * LEN + 1, LEN - 2, LEN- 2);
            }
        }
        //下一个方块
        ctx.fillStyle = nextBlock.type.color;
        for (var i = 0; i < nextBlock.data.length; i++) {
            for (var j = 0; j < nextBlock.data[i].length; j++) {
                if (nextBlock.data[i][j] == Y) {
                    ctx.strokeRect((w + 3 + j) * LEN + 1, (5 + i) * LEN + 1, LEN - 2, LEN- 2);
                    ctx.fillRect((w + 3 + j) * LEN + 1, (5 + i) * LEN + 1, LEN - 2, LEN - 2);
                }
            }
        }
        ctx.font = "40px Arial";
        ctx.fillText(score, (w + 5) * LEN, 10 * LEN);
    };

    /**方块是否还能下落，遍历当前下落方块中为1的点在地图中的下一格是否为空 */
    var canFall = function () {
        var arr = [], canFall = true;
        for (var i = 0; i < fallingBlock.data.length; i++) {
            for (var j = 0; j < fallingBlock.data[i].length; j++) {
                var index = toMapCoordinate(i, j);
                if (fallingBlock.data[i][j] == Y) {
                    arr.push(index);
                    if (fallingBlock.y + i >= h || data[index + w + 2].element == Y) {
                        canFall = false;
                    }
                }
            }
        }
        if (!canFall) { //不能下落时，固定再地图上
            arr.forEach(e => data[e] = { element: Y, color: fallingBlock.type.color });
            fallingBlock.isFall = false;
        }
        return canFall;
    };

    /**通过拿到旋转后的矩阵，遍历其中为1的方块再地图上是否为空来判断是否可以旋转 */
    var canRotate = function () {
        var tempData = rotate90(fallingBlock.data);
        for (var i = 0; i < tempData.length; i++) {
            for (var j = 0; j < tempData[i].length; j++) {
                if (tempData[i][j] == Y) {
                    var index = toMapCoordinate(i, j);
                    if (data[index].element != N) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    /**是否可以左右移动 */
    var canLeftOrRight = function (offset) {
        for (var i = 0; i < fallingBlock.data.length; i++) {
            for (var j = 0; j < fallingBlock.data[i].length; j++) {
                var index = toMapCoordinate(i, j);
                if (fallingBlock.data[i][j] == Y) {
                    if (data[index + offset].element != N) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    /**判断是否可以消除 */
    var clear = function () {
        var row = []; //用于存放可消除行的头元素节点
        for (var i = w + 3; i <= (w + 2) * (h + 1) - 1; i += w + 2) { //每一行
            var j = i;
            while (j <= i + w - 1) {
                if (data[j].element != Y) {
                    break;
                }
                j++;
            }
            if (j == i + w) {
                row.push(i);
            }
        }
        if (row.length > 0) {
            row.forEach(e => {
                for (var i = e; i < e + w; i++) {
                    data[i] = { element: N };
                }
            });
            packData(row[0] - 1, row[row.length - 1] + w);
            shatter(2 * LEN, (~~(row[0] / (w + 2) + 1)) * LEN, w * LEN, row.length * LEN);
            score += row.length * 10 * row.length;
            clearInterval(timer);
            speed += 0.25;
            timer = setInterval(function () {
                updateData();
            }, 1000 / speed);
        }
    }

    /**通过消除的其实位置，调整地图数据（全部方块往下落） */
    var packData = function (start, end) {
        var arr = [], offset = end - start + 1;
        for (var i = 0; i < data.length; i++) {
            if (data[i].element == W) {
                arr.push(data[i]);
                continue;
            }
            if (i - (w + 2) < offset) {
                arr.push(data[i - (w + 2) + start]);
            } else if (i > end) {
                arr.push(data[i]);
            } else {
                arr.push(data[i - offset]);
            }
        }
        data = arr;
    }

    var over = function() {
        for(var i = w + 3; i < 2 * (w + 2) - 1; i++) {
            if(data[i].element == Y) {
                return true;
            }
        }
    };

    var shatter = function (x, y, w, h) {
        var imageData = ctx.getImageData(x, y, w, h);
        for (var i = 0; i < imageData.width; i += 5) {
            for (var j = 0; j < imageData.height; j += 5) {
                var index = (i + ~~(5 / 2)) * 4 + j * imageData.width * 4;
                dots.push(new Dot(ctx, x + i, y + j, 5, imageData.data[index], imageData.data[index + 1],
                    imageData.data[index + 2], imageData.data[index + 3]));
            }
        }
    }

    var toMapCoordinate = function (i, j) {
        return (fallingBlock.y + i) * (w + 2) + fallingBlock.x + j;
    };

    var timer = window.setInterval(function () {
        updateData();
    }, 1000 / speed);

    window.document.onkeydown = function (e) {
        var keyCode = e.keyCode;
        switch (keyCode) {
            case 38:
                if (canRotate()) {
                    fallingBlock.rotate();
                }
                break;
            case 37:
                if (canLeftOrRight(-1)) {
                    fallingBlock.x--;
                }
                break;
            case 39:
                if (canLeftOrRight(1)) {
                    fallingBlock.x++;
                }
                break;
            case 40:
                if (canFall()) {
                    fallingBlock.fall();
                    clear();
                }
                break;
            default:
                break;
        }
    };

}

function Dot(ctx, x, y, l, r, g, b, a) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.sx = x;
    this.sy = y;
    this.ySpeed = -250;
    this.xSpeed = 0;
    this.g = 980 + ~~(Math.random() * 200);
    this.xa = (Math.random() > 0.5 ? 1 : -1) * 50;
    this.l = l - 1;
    this.color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

Dot.prototype = {
    update: function (dt) {
        this.ySpeed += dt / 1000 * this.g;
        this.y += this.ySpeed * dt / 1000;
        this.xSpeed += dt / 1000 * this.xa;
        this.x += this.xSpeed * dt / 1000;
    },
    paint: function () {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.l, this.l);
    }
};