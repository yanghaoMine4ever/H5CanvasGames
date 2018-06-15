function SaoLei(grid, count, len) {
    var LEN = len || 25,
        GRID = grid || 16,
        NUMBER = count || 40,
        NONE = 0, BOOM = -1, REVERSE = 100, FLAG = 101, QUESTION = 102,
        data = [], flag = [],
        start = false, over = false;
    var canvas = document.createElement("canvas"),
        context = canvas.getContext('2d');
    canvas.width = LEN * (GRID + 2);
    canvas.height = LEN * (GRID + 2);
    document.body.appendChild(canvas);

    for (var i = 0; i < GRID; i++) {
        var arr = [], arrr = [];
        for (var j = 0; j < GRID; j++) {
            arr.push(NONE);
            arrr.push(NONE);
        }
        data.push(arr);
        flag.push(arrr);
    }

    drawGrid();

    canvas.onmousedown = function (event) {
        if (over) return;
        var cc = toGridCoordinate(event.x, event.y);
        if (cc.x < 0 || cc.x >= GRID || cc.y < 0 || cc.y >= GRID) return;
        !start && (start = true) && plantBoom(cc.x, cc.y);
        if (data[cc.y][cc.x] == REVERSE) return;
        if (!event.button) {
            if (data[cc.y][cc.x] == BOOM) {
                drawBoom();
                over = true;
                alert('you lost!');
            } else if (data[cc.y][cc.x] == NONE) {
                expand(cc.x, cc.y);
            } else {
                fillText(cc.x, cc.y, data[cc.y][cc.x]);
                data[cc.y][cc.x] = REVERSE;
            }
        } else {
            drawFlag(cc.x, cc.y);
        }
        if (checkWin()) over = true && alert('you win!');
    };

    function checkWin() {
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data.length; j++) {
                data[i][j] == REVERSE && count++;
                if (count == GRID * GRID - NUMBER) {
                    drawBoom(); return true;
                }
            }
        }
    }

    function expand(x, y) {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        var check = [],
            unCheck = [];
        unCheck.push(new Point(x, y));
        while (unCheck.length > 0) {
            var _unCheck = set2Arr(unCheck);
            _unCheck.forEach(function (s) {
                if (data[s.y][s.x] == NONE) {
                    s.x > 0 && !check.has(new Point(s.x - 1, s.y)) && unCheck.push(new Point(s.x - 1, s.y));
                    s.x < GRID - 1 && !check.has(new Point(s.x + 1, s.y)) && unCheck.push(new Point(s.x + 1, s.y));
                    s.x > 0 && s.y > 0 && !check.has(new Point(s.x - 1, s.y - 1)) && unCheck.push(new Point(s.x - 1, s.y - 1));
                    s.x < GRID - 1 && s.y > 0 && !check.has(new Point(s.x + 1, s.y - 1)) && unCheck.push(new Point(s.x + 1, s.y - 1));
                    s.x > 0 && s.y < GRID - 1 && !check.has(new Point(s.x - 1, s.y + 1)) && unCheck.push(new Point(s.x - 1, s.y + 1));
                    s.x < GRID - 1 && s.y < GRID - 1 && !check.has(new Point(s.x + 1, s.y + 1)) && unCheck.push(new Point(s.x + 1, s.y + 1));
                    s.y > 0 && !check.has(new Point(s.x, s.y - 1)) && unCheck.push(new Point(s.x, s.y - 1));
                    s.y < GRID - 1 && !check.has(new Point(s.x, s.y + 1)) && unCheck.push(new Point(s.x, s.y + 1));
                }
                !check.has(s) && check.push(s) && data[s.y][s.x] != REVERSE && fillText(s.x, s.y, data[s.y][s.x]) && (data[s.y][s.x] = REVERSE);
                unCheck.remove(s);
            });
        }
    }

    function set2Arr(set) {
        var arr = [];
        set.forEach(function (s) {
            arr[arr.length] = s;
        });
        return arr;
    }

    function plantBoom(x, y) {
        var l = y * GRID + x,
            lup = y > 0 ? l - GRID : -99,
            ldown = y < GRID - 1 ? l + GRID : -99,
            lleft = x > 0 ? l - 1 : -99,
            lright = x < GRID - 1 ? l + 1 : -99;
        var set = new Set();
        var count = NUMBER;
        while(count) {
            var ll = parseInt(Math.random() * GRID * GRID) ;
            if(l == ll || ll == lup || ll == ldown || ll == lleft || ll == lright || ll == lup - 1 
            || ll == lup + 1 || ll == ldown - 1 || ll == ldown + 1 || set.has(ll)) continue;
            else {
                data[parseInt(ll / GRID)][ll % GRID] = BOOM;
                set.add(ll);
                count--;
            }
        }
        for(var x = 0; x < data.length; x++) {
            for(var y = 0; y < data[x].length; y++) {
                if(data[x][y] == BOOM) continue;
                x > 0 && data[x-1][y] == BOOM && data[x][y]++;
                x < GRID - 1 && data[x+1][y] == BOOM && data[x][y]++;
                x > 0 && y > 0 && data[x-1][y-1] == BOOM && data[x][y]++;
                x < GRID - 1 && y > 0 && data[x+1][y-1] == BOOM && data[x][y]++;
                x > 0 && y < GRID - 1 && data[x-1][y+1] == BOOM && data[x][y]++;
                x < GRID - 1 && y < GRID - 1 && data[x+1][y+1] == BOOM && data[x][y]++;
                y > 0 &&data[x][y-1] == BOOM && data[x][y]++;
                y < GRID - 1 && data[x][y+1] == BOOM && data[x][y]++;
            }
        }
    }

    function fillText(x, y, text, style) {
        context.save();
        context.fillStyle = style || "white";
        context.fillRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN)
        context.restore();
        context.strokeRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN)
        if(text) {
            context.font = (LEN - 5) + "px Arial";
            context.fillText(text, (x + 1.3) * LEN, (y + 1.8) * LEN);
        }
        context.restore();
        return true;
    }

    function drawBoom() {
        for(var x = 0; x < data.length; x++) {
            for(var y = 0; y < data[x].length; y++) {
                if(data[x][y] == BOOM) {
                    context.fillStyle = 'red';
                    context.fillText("●", (y + 1.3) * LEN, (x + 1.7) * LEN);
                }
            }
        }
    }

    function drawFlag(x, y) {
        context.save();
        context.beginPath();
        if(flag[y][x] == NONE) {
            context.moveTo((x + 1.3) * LEN, (y + 1.1) * LEN);
            context.lineTo((x + 1.3) * LEN, (y + 1.9) * LEN);
            context.moveTo((x + 1.3) * LEN, (y + 1.1) * LEN);
            context.lineTo((x + 1.8) * LEN, (y + 1.5) * LEN);
            context.lineTo((x + 1.3) * LEN, (y + 1.5) * LEN);
            context.closePath();
            context.fillStyle = "#B4815D";
            context.strokeStyle = "#B4815D";
            context.fill();
            context.stroke();
            flag[y][x] = FLAG;
        } else if (flag[y][x] == FLAG) {
            fillText(x, y, "?", 'lightgrey');
            flag[y][x] = QUESTION;
        } else {
            context.fillStyle = "lightgrey";
            context.fillRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN);
            context.restore();
            context.strokeRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN);
            flag[y][x] = NONE;
        }
        context.restore();
    }

    function drawGrid() {
        context.beginPath();
        for(var i = 1; i < GRID + 2; i++) {
            context.moveTo(i * LEN, LEN);
            context.lineTo(i * LEN, canvas.height - LEN);
            context.moveTo(LEN, i * LEN);
            context.lineTo(canvas.width - LEN, i * LEN);
        }
        context.closePath();
        context.stroke();
    }

    function toCanvasCoordinate(x, y) {
        var rect = canvas.getBoundingClientRect();
        return {x: x - rect.left, y: y - rect.top};
    }

    function toGridCoordinate(x, y) {
        var c = toCanvasCoordinate(x, y);
        return {x: parseInt(c.x / LEN) - 1, y: parseInt(c.y / LEN) - 1};
    }
}

Array.prototype.remove = function (point) {
    for(var i = 0; i < this.length; i++) {
        if(this[i].x == point.x && this[i].y == point.y) {
            this.splice(i, 1);
        }
    }
}

Array.prototype.has = function(point) {
    for(var i = 0; i < this.length; i++) {
        if(this[i].x == point.x && this[i].y == point.y) {
            return true;
        }
    }
}
