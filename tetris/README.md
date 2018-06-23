# 总体设计
俄罗斯方块的逻辑不难，经过分析，做出如下总体设计：

在一般的俄罗斯方块游戏中，通常会有七种类型的方块，而每一种方块都是由相同的更小的小方块组成，所以可以用二维数组（矩阵）来表示方块，通过对这个矩阵进行操作实现对方块的下落，旋转操作。

在地图中，用二维数组记录每个位置的信息，当方块下落停止，或者消除方块时，更新数组数据。

用定时器定时 `window.setInterval` 定时更新游戏数据，包括方块下落，方块消除，碰撞检测等；利用 `window.requestAnimationFrame` 函数在每一帧绘制游戏画面。

# 详细设计
## 方块实现
定义一个`Block`类型，表示方块，`Block`的属性包括方块的类型，方块的坐标。`Block`的方法包括旋转，下落。
```javascript
function Block(x, y, type, random) {
    this.type = type;
    this.data = this.type.data; //方块的矩阵
    this.x = x;
    this.y = y;
    if (this.type == BLOCK.I) {
        this.y -= 2;
    }
    this.isFall = true;
}

Block.prototype = {
    rotate: function () { //旋转矩阵
        this.data = rotate90(this.data);
    },
    fall: function () { //下落
        this.y++;
    }
};
```
方块的类型包含一个二维数组和方块颜色属性，旋转就是对二维数组做90度的旋转，为了保持旋转后方块位置的不变，所以二维数组设计成等宽高的。部分实现如下：
```javascript
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

/**七种方块矩阵及其颜色，用1表示有方块的部分*/
var BLOCK = {
    LL: {
        color: '#ea4708',
        data: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
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
    },
    //...剩下还有四种类似
};
```
## 地图实现
可以用二维数组表示，为了方便做边界检测，所以长和宽都比游戏画面多出两格，这样可以免去边界检测的代码，减少了代码的复杂性。也可以用一维数组表示，其实就是把二维数组展开。这里用一维数组实现，下面 `w` 和 `h` 表示游戏区域的宽高：
```javascript
var N = 0, Y = 1, W = 2; //N表示没方块，Y表示有方块，W表示墙
var data = []; //取名当然是万能的data啦...
for (var i = 0; i < (w + 2) * (h + 2); i++) {
    if (i < w + 2 || i > (w + 2) * (h + 1) || i % (w + 2) == 0 || i % (w + 2) == w + 1) { //墙
        data[i] = { element: W };
    } else {
        data[i] = { element: N };
    }
}
```
## 落地检测，旋转检测，水平移动检测
游戏进行时，始终有一个方块会一直下落，用户也可以操作方块加速下落，方块到底时就不能下落了，并且得有新的方块出现在顶部。检测方块是否能下落，旋转，水平移动的思路都是一样的。就是根据当前下落方块的矩阵(或者经过旋转，横移后的矩阵)和方块的坐标`x`和`y`，计算出矩阵中每个小方块在地图数组`data`中对应的位置`index`，如果`data[index]`内容为`Y`(方块)或`W`(墙)，则不能进行相应的操作。

以旋转为例，具体操作如下(其他操作类似)：

1. 拿到当前下落矩阵经过旋转后的矩阵`tempMatrix`
2. 遍历tempMatrix，当元素值为`1`时，计算出此元素在地图中的位置`index`
3. 判断`data[index]`是否为`N`(空)，是的话重复第二步，否的话则不能旋转

具体代码实现如下：
```javascript
/**通过拿到旋转后的矩阵，遍历其中为1的方块再地图上是否为空来判断是否可以旋转 */
var canRotate = function () {
    var tempData = rotate90(fallingBlock.data);
    for (var i = 0; i < tempData.length; i++) {
        for (var j = 0; j < tempData[i].length; j++) {
            if (tempData[i][j] == Y) {
                var index = toMapCoordinate(i, j); //这个函数计算出矩阵中元素在地图中的坐标
                if (data[index].element != N) {
                    return false;
                }
            }
        }
    }
    return true;
};
```
## 方块消除
每次下落之后，都要判断是否有可以消除的方块。每次我们从地图每一行的开始处开始遍历，如果连着一行都是方块，那么这一行就是可以消除的，接着遍历下一行。对于可以消除的那一行，把地图数据置为`N`，即0，并且上面的方块应该往下落，所以我记录了消除的行数的起始坐标。消除完所有方块之后，我们根据消除的起始坐标(如果有)来进一步更新地图数据，形成下落效果。

假设消除的方块的开始位置为`start`，结束位置为`end`，则消除的总方块数`offset` = end - start + 1，对地图的更新，分为三种情况：

1. 对于地图中下标`offset`之前的数据，置为`N`(可以理解为消除的那几行从上面冒出来了)
2. 对于地图中下标`end`之后的数据，保持不变
3. 其余的数据，等于他上一行的数据

这样就实现了方块消除后所有方块下落的效果，当然，实际实现中，因为有墙的缘故，所以会有些不一样，代码实现如下：

```javascript
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
        row.forEach(e => { //把消除的元素置为空
            for (var i = e; i < e + w; i++) {
                data[i] = { element: N };
            }
        });
        packData(row[0] - 1, row[row.length - 1] + w);
    }
}

/**通过消除的起始位置，调整地图数据（全部方块往下落） */
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
```
## 绘制画面
因为每个小方块都是矩形，那么根据地图数据，和下落ing的方块坐标，利用`canvas`的`getContext`函数，取得画笔`ctx`，用画笔`ctx`的`fillRect`函数，就可以把矩形画出来了。

在每一帧中，都用`ctx.clearRect`函数，清除画面，进行不断的重绘，这也是游戏开发中的常用方法。

```javascript
/**
 * 下面代码中，LEN的加一，减二，是为了让方块之间出现距离...
 * */
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
```
## 粉粹效果
在消除方块时，加点效果，增加游戏的趣味性。消除方块时，被消除的那几行会呈现出被粉粹的效果。主要时利用了`canvas`的`getImageData`方法和`fillRect`方法。其中，`getImageData`可以取得特定区域的像素数据`rgba`，然后粉粹出来的粒子其实就是一个矩形。我们根据取出的像素颜色，填充相应的矩形，在对这个进行一定规则的位移，就能实现这个爆炸效果啦。

首先，需要一个`Dot`类，表示一个粒子，其实就是矩形。他具有以下属性：
```javascript
function Dot(ctx, x, y, l, r, g, b, a) {
    this.ctx = ctx; //画笔
    this.x = x; //x坐标
    this.y = y; //y坐标
    this.sx = x; //出生时的x坐标
    this.sy = y; //出生时的y坐标
    this.ySpeed = -250; //垂直方向的初速度
    this.xSpeed = 0; //水平方向的初速度
    this.g = 980 + ~~(Math.random() * 200); //垂直方向的加速度
    this.xa = (Math.random() > 0.5 ? 1 : -1) * 50; //水平方向的加速度
    this.l = l - 1; //长度
    this.color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
```
以及以下方法，其中`update`方法传入一个`dt`表示的是距离上一帧的时间间隔毫秒数，是由游戏绘制主循环传过来的，而update方法在每一帧都会被调用，更新粒子的`x`和`y`坐标位置。
```javascript
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
```
每次消除方块时，根据之前的坐标，转换成`canvas`的坐标，生成粒子：
```javascript
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
```
在每一帧绘制时，顺便更新并绘制粒子：
```javascript
dots.forEach(dot => dot.paint());
for (var i = 0; i < dots.length; i++) {
    if (dots[i].y - dots[i].sy >= 100) { //当粒子的位置离原来太远时就丢掉了
        dots.splice(i, 1);
    } else {
        dots[i].update(dt);
    }
}
```

# 结论
这个俄罗斯方块比较简单，当然我的代码也比较凌乱，界面也不美观。
