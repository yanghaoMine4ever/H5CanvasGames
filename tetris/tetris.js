function Tetris(id, w, h, len) {
    var w = w || 18;
    var h = h || 24;
    var LEN = len || 30;
    var fallingBlock = new Block(w / 2 - 2, 1, null, true), nextBlock = new Block(w / 2, 1, null, true);
    var speed = 1;
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
            clear();
        } else {
            fallingBlock = new Block(w / 2 - 2, 1, null, true);
        }
    };

    var drawBlock = function () {
        ctx.fillStyle = fallingBlock.type.color;
        for (var i = 0; i < fallingBlock.data.length; i++) {
            for (var j = 0; j < fallingBlock.data[i].length; j++) {
                if (fallingBlock.data[i][j] == 1) {
                    var index = toMapCoordinate(i, j);
                    ctx.fillRect((index % (w + 2) + 1) * LEN, (~~(index / (w + 2)) + 1) * LEN, LEN, LEN);
                }
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].element == Y) {
                ctx.fillStyle = data[i].color;
                ctx.fillRect((i % (w + 2) + 1) * LEN, (~~(i / (w + 2)) + 1) * LEN, LEN, LEN);
            }
        }
    };


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
        if (!canFall) {
            arr.forEach(e => data[e] = { element: Y, color: fallingBlock.type.color });
            fallingBlock.isFall = false;
        }
        return canFall;
    };

    var canRotate = function () {
        var tempData = rotate90(fallingBlock.data);
        for (var i = 0; i < tempData.length; i++) {
            for (var j = 0; j < tempData[i].length; j++) {
                if (tempData[i][j] == 0) {
                    var index = toMapCoordinate(i, j);
                    if (data[index].element != N) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

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

    var clear = function () {
        for (var i = (w + 2) * (h + 1) - 2; ; i--) {
            if (data[i].element == N) {
                break;
            }
        }
        var row = ~~(i / (w + 2)) + 1;
        if (row <= h) {
            var index = row * (w + 2);
            for (var i = index; i <= (w + 2) * (h + 1) - 2; i++) {
                if (data[i].element != W) {
                    data[i] = { element: N };
                }
            }
            packData(index);
            shatter((index % (w + 2) + 2) * LEN, (~~(index / (w + 2) + 1)) * LEN, w * LEN, (h + 1 - row) * LEN);
            clearInterval(timer);
            speed += 0.5;
            timer = setInterval(function () {
                updateData();
            }, 1000 / speed);
        }
    }

    var packData = function (index) {
        var arr = [], offset = (w + 2) * (h + 1) - index;
        for (var i = 0; i < data.length; i++) {
            if (data[i].element == W) {
                arr.push(data[i]);
                continue;
            }
            if (i - (w + 2) < offset) {
                if (data[i - (w + 2) + index].element == W) {
                    console.log();
                }
                arr.push(data[i - (w + 2) + index]);
            } else {
                arr.push(data[i - offset]);
            }
        }
        data = arr;
    }

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