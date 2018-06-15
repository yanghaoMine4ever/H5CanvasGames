function SnakeGame() {
    var DIR = {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
    };
    var len = 20, w = 66, h = 38;
    var canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.width = len * w;
    canvas.height = len * h;
    var context = canvas.getContext('2d');
    var egg = 999;
    var snake = new Snake();

    var update = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "aliceblue";
        context.fillRect(len, len, (w - 2) * len, (h - 2) * len);
        context.fillStyle = 'red';
        context.fillRect(egg % w * len,  ~~(egg / w) * len, len, len);
        context.fillStyle = 'black';
        for(var i = 0; i < snake.body.length; i++) {
            context.fillRect(snake.body[i] % w * len,  ~~(snake.body[i] / w) * len, len, len);
        }
        if(snake.body[snake.body.length - 1] == egg) {
            newEgg();
            snake.eat();
            clearInterval(timer);
            timer = setInterval(update, 1000 / ++snake.speed);
        }
        if(checkDie()) {
            alert('game over!');
            clearInterval(timer);
            return;
        }
        snake.move();
    };

    var newEgg = function() {
        while(true) {
            egg = ~~(Math.random() * w * h);
            if(checkInWall(egg)) continue;
            for(var i = 0; i < snake.body.length; i++) {
                if(snake.body[i] == egg) {
                    break;
                }
            }
            if(i >= snake.body.length) break;
        }
    };

    var checkDie = function() {
        if(checkInWall(snake.body[snake.body.length - 1])) {
            return true;
        }
        var head = snake.body[snake.body.length - 1];
        for(var i = 0; i < snake.body.length - 1; i++) {
            if(snake.body[i] == head) {
                return true;
            }
        }
    }

    var checkInWall = function(index) {
        if(index % w == w - 1
            || index % w == 0 || index < 66
            || index > w * (h - 1)) {
            return true;
        }
    };

    document.body.onkeydown = function(event) {
        switch(event.keyCode) {
            case 37: snake.direction = snake.direction == DIR.RIGHT ? DIR.RIGHT : DIR.LEFT; break;
            case 38: snake.direction = snake.direction == DIR.DOWN ? DIR.DOWN : DIR.UP; break;
            case 39: snake.direction = snake.direction == DIR.LEFT ? DIR.LEFT : DIR.RIGHT; break;
            case 40: snake.direction = snake.direction == DIR.UP ? DIR.UP : DIR.DOWN; break;
            default: return;
        }
    };

    var timer = setInterval(update, 1000 / snake.speed);

    function Snake() {
        this.body = [100, 101, 102];
        this.speed = 10;
        this.direction = DIR.RIGHT;
        this.move = function() {
            this.body.shift();
            var oldHead = this.body[this.body.length - 1];
            var newHead;
            switch(this.direction) {
                case DIR.UP:
                    newHead = oldHead - w; break;
                case DIR.DOWN:
                    newHead = oldHead + w; break;
                case DIR.LEFT:
                    newHead = oldHead - 1; break;
                case DIR.RIGHT:
                    newHead = oldHead + 1; break;
                default: break;
            }
            this.body.push(newHead);
        };
        this.eat = function() {
            var tail = this.body[0];
            switch(this.direction) {
                case DIR.UP:
                    this.body.unshift(tail + w); break;
                case DIR.DOWN:
                    this.body.unshift(tail - w); break;
                case DIR.LEFT:
                    this.body.unshift(tail + 1); break;
                case DIR.RIGHT:
                    this.body.unshift(tail - 1); break;
                default: break;
            }
        };
    }
}
