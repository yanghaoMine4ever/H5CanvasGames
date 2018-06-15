var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

canvas.width = 420;
canvas.height = 420;

var data = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0
];
var win = [     //所有赢的组合
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
var I = 0;
var PLAYER = -1,
    AI = 1,
    NONE = 0;
var intelligence = 6;
var MAX = 100, MIN = -100;
var isTurn = false;
var tcbox = document.getElementById("tt");
var btn = document.getElementById('btn');

drawBackground();

canvas.onmousedown= function(e) {
    if(isTurn) {
        var coordinate = toCanvasCoordinate(e.pageX, e.pageY);
        let x = parseInt(coordinate.x/(canvas.width/3)),
            y = parseInt(coordinate.y/(canvas.height/3));
        putDown(PLAYER, x, y);
        if(checkWin(data, PLAYER)) {alert('You Win!'); return;}
        aiPutDown();
        if(checkWin(data, AI)) {alert('You Lost!'); return;}
        if(I == 9) {alert('draw...'); return;}
    }
};

function putDown(id, x, y) {
    if(data[y * 3 + x] != 0) {
        return;
    }
    isTurn = !isTurn;
    data[y * 3 + x] = id;
    draw(id, x, y);
    I++;
}

function draw(id, x, y) {
    if(id === PLAYER) {
        drawO(x, y);
    }else {
        drawX(x, y);
    }
}

function drawX(x, y) {
    context.strokeStyle = "green";
    context.beginPath();
    context.moveTo(x * canvas.width/3 + 10, y * canvas.height/3 + 10);
    context.lineTo((x + 1) * canvas.width/3 - 10, (y + 1) * canvas.height/3 - 10);
    context.stroke();
    context.beginPath();
    context.moveTo((x + 1) * canvas.width/3 - 10, y * canvas.height/3 + 10);
    context.lineTo(x * canvas.width/3 + 10,  (y + 1) * canvas.height/3 - 10);
    context.stroke();
}

function drawO(x, y) {
    context.strokeStyle = "red";
    context.beginPath();
    context.arc((x + 0.5) * canvas.width/3, (y + 0.5 ) * canvas.height/3, canvas.width/6 - 10, 0, 2*Math.PI, true);
    context.stroke();
}

function drawBackground() {
    context.strokeStyle = "#666";    
    context.lineWidth = 1.5;
    for(let i = 1; i <= 2; i++) {
        context.beginPath();
        context.moveTo(i * canvas.width/3, 0);
        context.lineTo(i * canvas.width/3, canvas.height);
        context.moveTo(0, i * canvas.height/3);
        context.lineTo(canvas.width, i * canvas.height/3);
        context.stroke();
    }
}

function toCanvasCoordinate(x, y) {
    var bbox =canvas.getBoundingClientRect();
    return { x: x- bbox.left *(canvas.width / bbox.width),
        y:y - bbox.top  * (canvas.height / bbox.height)
    };
}

function start() {
   if(btn.innerHTML == "开始") {
       btn.innerHTML = "重新开始";
   }else {
        data = [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ];
        I = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
   }
   if(tcbox.checked) {
       isTurn = true;
   }else {
       isTurn = false;
       aiPutDown();
   }                         
}
