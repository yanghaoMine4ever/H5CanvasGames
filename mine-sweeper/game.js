function SaoLei(grid, count, len) {
    var LEN = len || 25, // 单元格长度
        GRID = grid || 16, // 每行(列)单元格个数，eg: 16 * 16
        NUMBER = count || 40, // 地雷个数
        // 常量标记，NONE：无东西，BOOM：炸弹，REVERSE：已被反转，FLAG：右键标记🚩，QUESTION：右键标记？
        NONE = 0, BOOM = -1, REVERSE = 100, FLAG = 101, QUESTION = 102,
        data = [], flag = [], // 二维数组表示地图上每个格子的情况
        start = false, over = false; // start：是否已开始游戏（第一次点击格子），over：游戏是否结束
    var canvas = document.createElement("canvas"),
        context = canvas.getContext('2d');
    canvas.width = LEN * (GRID + 2);
    canvas.height = LEN * (GRID + 2);
    document.body.appendChild(canvas);

    /**
     * 初始化状态为全无
     */
    for (var i = 0; i < GRID; i++) {
        var arr = [], arrr = [];
        for (var j = 0; j < GRID; j++) {
            arr.push(NONE);
            arrr.push(NONE);
        }
        data.push(arr);
        flag.push(arrr);
    }

    // 画格子
    drawGrid();

    /**
     * 响应鼠标点击事件
     */
    canvas.onmousedown = function (event) {
        if (over) return; // 游戏已结束，直接返回
        var cc = toGridCoordinate(event.x, event.y); // 取得鼠标坐标
        if (cc.x < 0 || cc.x >= GRID || cc.y < 0 || cc.y >= GRID) return; // 在格子外，直接返回
        !start && (start = true) && plantBoom(cc.x, cc.y); // 如果是第一次点击格子，则根据当前坐标，生成全图的地雷
        if (data[cc.y][cc.x] == REVERSE) return; // 如果当前格子已被正确反转，直接返回
        if (!event.button) { // 鼠标左键
            if (data[cc.y][cc.x] == BOOM) { // 点击到地雷的位置，游戏结束
                drawBoom();
                over = true;
                alert('you lost!');
            } else if (data[cc.y][cc.x] == NONE) { // 点击到空白位置，地图展开
                expand(cc.x, cc.y);
            } else {
                // 点击到安全位置，显示当前格子数字（周围地雷个数），并标记为已翻转
                fillText(cc.x, cc.y, data[cc.y][cc.x]); 
                data[cc.y][cc.x] = REVERSE;
            }
        } else { // 鼠标右键，打标记
            drawFlag(cc.x, cc.y);
        }
        // 检查是否结束游戏
        if (checkWin()) over = true && alert('you win!');
    };

    /**
     * 检查是否赢下游戏：所有非地雷的格子已被翻转
     */
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

    /**
     * 点到空白的位置，向外展开一圈数字
     */
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

    /**
     * 随机生成count个数的地雷
     */
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

    /**
     * 在对应坐标的单元格填充数字
     */
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

    /**
     * 右键时，画对应的标记
     */
    function drawFlag(x, y) {
        context.save();
        context.beginPath();
        if(flag[y][x] == NONE) { // 未打过标的画旗子
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
        } else if (flag[y][x] == FLAG) { // 旗子变问号
            fillText(x, y, "?", 'lightgrey');
            flag[y][x] = QUESTION;
        } else { // 恢复未打标状态
            context.fillStyle = "lightgrey";
            context.fillRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN);
            context.restore();
            context.strokeRect((x + 1) * LEN, (y + 1) * LEN, LEN, LEN);
            flag[y][x] = NONE;
        }
        context.restore();
    }

    /**
     * 画格子
     */
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

    /**
     * 将网页里的鼠标坐标转换为canvas画布里的坐标
     */
    function toCanvasCoordinate(x, y) {
        var rect = canvas.getBoundingClientRect();
        return {x: x - rect.left, y: y - rect.top};
    }

    /**
     * 将网页里的鼠标坐标转换为网格的坐标
     */
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
