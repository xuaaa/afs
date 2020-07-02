
var sw = 20, //方块宽
    sh = 20,//方块高
    tr = 30,//行数
    td = 30;//列数
var snake = null,//
    food = null,
    game = null;
//方块构造函数
function Square(x, y, classname) {
    //0,0  0,0

    //20,0   1,0
    //40,0    2,0
    this.x = x * sw;
    this.y = y * sh;
    this.class = classname;

    this.viewContent = document.createElement('div');	//方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');
}
Square.prototype.create = function () {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + "px";

    this.parent.appendChild(this.viewContent);

};
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};

//蛇
function Snake() {
    this.head = null;//存一下蛇头信息
    this.tail = null;//存一下蛇尾信息
    this.pos = [];//存储蛇身上的每一个方块信息

    this.directionNum = {
        //存储蛇的走向，用一个对象表示
        left: {
            x: -1,
            y: 0,
            rotate: 180 //由蛇头在不同的方向应该进行旋转，要不始终向右
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90

        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }

    }
}
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    //创建蛇身体
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    //身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;//把蛇尾信息存起来
    this.pos.push([0, 0]);

    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;


    //给蛇添加一条属性，用来表示蛇走的方向
    // this.directionNum = this.directionNum.right;
    this.direction = this.directionNum.right;
};
Snake.prototype.getNextPos = function () {
    var nextPos = [	//蛇头要走的下一个点的坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]
    //下个点是自己，代表撞到了自己，游戏结束
    var selfCollied = false;	//是否撞到了自己
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到自己了
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log("你撞到了自己");
        this.strategies.die.call(this);
        return;
    }
    //下个点是，围墙，游戏结束。
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        console.log("撞墙了！！！");
        this.strategies.die.call(this);
        return;
    }
    //下个点是食物，吃。
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //如果这个条件成立说明现在蛇头要走的下一个点是食物的那个点
        console.log('撞到食物了！');
        this.strategies.eat.call(this);

        return;
    }
    // this.strategies.eat.call(this);
    //下个点没有，走
    this.strategies.move.call(this);
};
//处理撞后的事
Snake.prototype.strategies = {
	move: function (format) {	//这个参数用于决定要不要删除最后一个方块（蛇尾）。当传了这个参数后就表示要做的事情是吃
		//创建新身体（在旧蛇头的位置）
		var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');
		//更新链表的关系
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;

		this.head.remove();	//把旧蛇头从原来的位置删除
		newBody.create();

		//创建一个新蛇头(蛇头下一个要走到的点nextPos)
		var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');
		//更新链表的关系
		newHead.next = newBody;
		newHead.last = null;
		newBody.last = newHead;
		newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
		newHead.create();

		//蛇身上的每一个方块的坐标也要更新
		this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
		this.head = newHead;	//还要把this.head的信息更新一下


		if (!format) {	//如果fromat的值为false，表示需要删除（除了吃之外的操作）
			this.tail.remove();
			this.tail = this.tail.last;

			this.pos.pop();
		}
	},
    eat: function () {
        this.strategies.move.call(this, true);
        creteFood();
        game.score++;
    },
    die: function () {
        game.over();
    }
}
snake = new Snake();


//创建食物
function creteFood() {
    var x = null;
    var y = null;

    var include = true;
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));

        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {

                include = false;
            }
        });
    }

    food = new Square(x, y, 'food');
    food.pos = [x, y];//
    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    } else {
        food.create();
    }
}


// // 
function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    creteFood();

    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {	//用户按下左键的时候，这条蛇不能是正下往右走
            snake.direction = snake.directionNum.left;
        } else if (ev.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        } else if (ev.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        } else if (ev.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }

    this.start();
}
Game.prototype.start = function () {	//开始游戏
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200);
}
Game.prototype.pause = function () {
    clearInterval(this.timer);
}
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert("你的得分为：" + this.score);

    //游戏回到最初状态、
    var snakeWarp = document.getElementById('snakeWrap');
    snakeWarp.innerHTML = '';

    snake = new Snake();
    game = new Game();
    var starBtnWarp = document.querySelector('.startBtn');
    starBtnWarp.style.display = 'block';
}
// 开始游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
	startBtn.parentNode.style.display = 'none';
	game.init();
};

//
var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function () {
    game.pause();

    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function () {
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}



