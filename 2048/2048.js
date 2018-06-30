function _2048(x, y) {

    var width = 530; //窗口宽高
    var height = 700;
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    canvas.className = 'window'
    canvas.style.zIndex = 100;
    canvas.style.left = x + 'px';
    canvas.style.top = y + 'px';
    canvas.draggable = true;
    setDragable('.window');
    var ctx = canvas.getContext('2d');

    initWindowFrame();
    initHead();
    initIntro();
    drawBackground();

    canvas.onmousedown = function(e) {
        var c = toCanvasCoordinate(e.pageX, e.pageY);
        if(c.x >= canvas.width - 30 && c.y <= 40) {
            closeWindow();
        }
    };

    function drawBackground() {
        ctx.fillStyle = '#bbada0';
        ctx.lineJoin = 'round';
        ctx.fillRect(15, 158 + 35, 500, 500);
        ctx.fillStyle = 'rgba(238, 228, 218, 0.35)';
        for(var i = 0; i < 16; i++) {
            var x = (i % 4 + 1) * 16 + (i % 4) * 105;
            var y = (~~(i / 4) + 1) * 16 + (~~(i / 4)) * 105;
            ctx.fillRect(x + 15, y + 158 + 35, 105, 105);
        }
    }

    function initWindowFrame() {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, 40);
        ctx.drawImage(getIcon(30, 30), 10, 5);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.font = '15px Arial';
        ctx.fillText('2048小游戏', 90, 20);
        ctx.drawImage(getIconX(15, 15), canvas.width - 30, 12.5);
        ctx.restore();
    }

    function initHead() {
        ctx.save();
        ctx.textBaseline = 'top';
        ctx.font = 'bold 74px Arial';
        ctx.fillStyle = '#776e65';
        ctx.fillText('2048', 10, 40);
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#bbada0';
        ctx.textAlign = 'center';
        ctx.fillRect(canvas.width - 137, 55, 126, 55);
        ctx.fillRect(canvas.width - 137 - 65 - 10, 55, 65, 55);
        ctx.fillStyle = '#eee4da';
        ctx.font = '14px Arial';
        ctx.fillText('BEST', canvas.width - 137 + 127 / 2, 65);
        ctx.fillText('SCORE', canvas.width - 137 - 65 -10  + 65 / 2, 65);
        ctx.restore();
    }

    function initIntro() {
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#8f7a66';
        ctx.fillRect(canvas.width - 147, 130, 136, 40);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('New Game', canvas.width - 147 + 137 / 2, 130 + 40 - 40 / 2);
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#8b6e65';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText('Play 2048 Game Online', 10, 130);
        ctx.font = '18px Arial';
        ctx.fillText('Join the numbers and get to the ', 10, 158);
        ctx.font = 'bold 18px Arial';
        ctx.fillText('2048 tile!', 270, 158);
        ctx.restore();
    }

    function closeWindow() {
        document.body.removeChild(canvas);
    }

    function toCanvasCoordinate(x, y) {
        var bbox =canvas.getBoundingClientRect();
        return { x: x- bbox.left *(canvas.width / bbox.width),
            y:y - bbox.top  * (canvas.height / bbox.height)
        };
    }

}

