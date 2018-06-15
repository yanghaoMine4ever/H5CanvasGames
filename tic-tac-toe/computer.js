var count = 0;
function aiPutDown() {
    if(I >= 9) {
        return;
    }
    var value = search(0, AI, MIN, MAX);
    console.log(count);
    count = 0;
    putDown(AI, parseInt(value % 3), parseInt(value / 3));
}

function search(depth, player, alpha, beta) {
    count++;
    if(checkWin(data)) { //没毛病
        return player == PLAYER ? MAX : MIN;
    }
    if(I >= 9 || depth >= intelligence) {
        return evaluate();
    }
    var i = 9, next, value, max, min;
    while(i--) {
        if(data[i] != NONE) continue;
        data[i] = player;
        I++;
        value = search(depth + 1, -player, alpha, beta);
        data[i] = NONE;
        I--;
        if(player == PLAYER) { // 极小值层 > beta 剪枝
            if(min == undefined || value <= min) {
                min = value;
                next = i;
            }
            if(value <= beta) beta = value;
            if(alpha > beta) return depth ? beta : next;
        }else if(player == AI){ //极大值层  < alpha 剪枝
            if(max == undefined || value >= max) {
                max = value;
                next = i;
            }
            if(value >= alpha) alpha = value;
            if(alpha > beta) return depth ? alpha : next;
        }
    }
    return depth ? (player == PLAYER ? min : max) : next;
}

function checkWin(data, player) {
    var O = 0, X = 0;
    for(i in win) {
        var j = 3;
        var o = 3, x = 3;
        while(j--) {
            var k = win[i][j];
            if(data[k] == PLAYER) o--;
            if(data[k] == AI) x--;
        }
        if(!o) O++;
        if(!x) X++;
    }
    if(!player && (O || X)) return 1;
    return (player && player == PLAYER) ? O : X;
}

//估值函数
function evaluate() {
    var X = 0, O = 0;
    var cdata = arrCopy(data);
    for(var i = 0; i < cdata.length; i++) {
        if(cdata[i] == NONE) {
            cdata[i] = AI;
        }
    }
    X = checkWin(cdata, AI);
    var cdata = arrCopy(data);
    for(var i = 0; i < cdata.length; i++) {
        if(cdata[i] == NONE) {
            cdata[i] = PLAYER;
        }
    }
    O = checkWin(cdata, PLAYER);
    return X - O;
}

function arrCopy(src) {
    let des = [];
    for(let i = 0; i < src.length; i++) {
        des[i] = src[i];
    }
    return des;
}