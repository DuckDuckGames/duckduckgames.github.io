buildNum = "0.1.0";

var c = document.getElementById("canvas");
var g = c.getContext("2d");
var w;
var h;
var mx = 0;
var my = 0;
var mouse = 0;
var player;
var playerSpeed = 4;
var speed = 5;
var score = 0 
var highScore = 0
var move = 0;

var empTimer;

var playing = false;

var bullets = [];
var spamToggle = false;
var emp = false;

var boats = [];
var speedOfEnemies = 5;
var spawnTime = 500;
var reloadTime = 300;

var print = function(text) {
	console.log(text);
};

var timeOfEmpEnd = Date.now()-8000;

var gebid = function(id) {
	return document.getElementById(id);
};

var elements = {
	menu: gebid("menu"),
	play: gebid("play")
};

var resize = function() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	w = c.width;
	h = c.height;
};
window.onresize = resize;
resize();

//Function: angle from points
var afp = function(x1,y1,x2,y2) {
	return Math.atan2(y2-y1,x2-x1);
};

//Function: point from angle
var pfa = function(x,y,a,d) {
	return [Math.cos(a)*d+x,Math.sin(a)*d+y];
};

//Function: distance from points
var dfp = function(x1,y1,x2,y2) {
	return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
};

var lerp = function(a,b,f) {
	return a+f*(b-a);
};

var spawnBoat = function() {
	if (playing) {
		if (!emp) {
			d = 0;
			x = 0;
			y = 0;
			while (d < 500) {
				x = Math.random()*w;
				y = Math.random()*h;
				d = dfp(player.x,player.y,x,y);
			};
			boats.push(new Boat(x,y,5,"#6600ff"));
		};
	};
};

var die = function() {
	player.x = w/2;
	player.y = w/2;
	boats = [];
	bullets = [];
	score = 0;
	timeOfEmpEnd = Date.now()-8001;
	clearTimeout(empTimer);
	empShockWave.visible = 0;
	empShockWave.radius = 0;
	empShockWave.alpha = 0;
	emp = false;
	elements.menu.style.display = "block";
	playing = 0;
};

var Boat = function(x,y,speed,fill) {
	this.x = x;
	this.y = y;
	this.r = 0;
	this.speed = speed;
	this.fw = 33;
	this.bw = 26;
	this.l = 35;
	this.fillColor = fill;
	this.strokeColor = "#cccccc";
	this.strokeWidth = 5;
	this.lastShot = Date.now();
	this.updateAsPlayer = function() {
		player.r = afp(this.x,this.y,mx,my);
		p = pfa(this.x,this.y,this.r,this.speed);
		this.x = p[0];
		this.y = p[1];
		if (mouse && Date.now()-this.lastShot > reloadTime) {
			p = pfa(this.x,this.y,this.r,this.l);
			bullets.push(new Bullet(p[0],p[1],this.r));
			this.lastShot = Date.now();
		};
		for (j in boats) {
			if (this.x < boats[j].x+50 && this.x > boats[j].x-50 && this.y < boats[j].y+50 && this.y > boats[j].y-50) {
				die();
				break;
			};
		};
	};
	this.updateAsShooter = function() {
		a = afp(this.x,this.y,player.x,player.y);
		p = pfa(this.x,this.y,a,this.speed);
		this.r = a;
		this.x = p[0];
		this.y = p[1];
		for (j in bullets) {
			if (this.x < bullets[j].x+this.l/2 && this.x > bullets[j].x-this.l/2 && this.y < bullets[j].y+this.l/2 && this.y > bullets[j].y-this.l/2) {
				boats.splice(boats.indexOf(this),1);
				bullets.splice(j,1);
				score++;
				if (score > highScore) {
					highScore = score;
					localStorage.highScore = highScore;
				};
			};
		};
	};
	this.render = function() {
		g.fillStyle = this.fillColor;
		g.strokeStyle = this.strokeColor;
		g.lineWidth = this.strokeWidth;
		g.translate(this.x,this.y);
		g.rotate(this.r-Math.PI/2);
		g.beginPath();
		g.moveTo(-this.fw/2,0);
		g.lineTo(this.fw/2,0);
		g.lineTo(this.bw/2,this.l);
		g.lineTo(-this.bw/2,this.l);
		g.lineTo(-this.fw/2,0);
		g.fill();
		g.closePath();
		g.stroke();
		g.rotate(-this.r+Math.PI/2);
		g.translate(-this.x,-this.y);
	};
};

var Bullet = function(x,y,r) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.speed = 6;
	this.update = function() {
		p = pfa(this.x,this.y,this.r,this.speed);
		this.x = p[0];
		this.y = p[1];
		if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
			bullets.splice(bullets.indexOf(this),1);
		};
	};
	this.render = function() {
		g.fillStyle = "#6600ff";
		g.beginPath();
		g.arc(this.x,this.y,10,0,2*Math.PI);
		g.closePath();
		g.fill();
	};
};

var empShockWave = {
	x: 0,
	y: 0,
	radius: 0,
	visible: 0,
	alpha: 0,
	radiusSpeed: 5,
	alphaSpeed: 0.008,
	update: function() {
		this.radius += this.radiusSpeed;
		this.alpha -= this.alphaSpeed;
		for (j in boats) {
			if (dfp(this.x,this.y,boats[j].x,boats[j].y) < this.radius+boats[j].l) {
				boats[j].speed = 0;
			};
		};
		if (this.alpha <= this.alphaSpeed) this.visible = 0;
	},
	render: function() {
		g.fillStyle = "#ff0000";
		g.globalAlpha = this.alpha;
		g.arc(this.x,this.y,this.radius,0,Math.PI*2);
		g.fill();
		g.globalAlpha = 1;
	}
};

window.onmousemove = function(e) {
	mx = e.pageX;
	my = e.pageY;
};

window.onmousedown = function() {
	mouse = 1;
};

window.onmouseup = function() {
	mouse = 0;
};

window.onkeydown = function(e) {
	if (e.keyCode == 69 && !emp && Date.now() - timeOfEmpEnd > 8000) {
		emp = true;
		empShockWave.x = player.x;
		empShockWave.y = player.y;
		empShockWave.radius = 0;
		empShockWave.alpha = 1;
		empShockWave.visible = 1;
		speedOfEnemies = 0;
		timeOfEmp = Date.now();
		empTimer = setTimeout(function() {
			emp = false;
			speedOfEnemies = 5; 
			timeOfEmpEnd = Date.now();
			for (j in boats) {
				boats[j].speed = 5;
			};
		},4000);
	};
	if (e.keyCode == 69) {
		if (spamToggle == false) {
			spamToggle = true;
		};
		if (spamToggle == true) {
			spamToggle = false;
		};
	};
};

window.onkeyup = function(e) {
	if (e.keyCode == 83) {
		move += 1;
		SJustDown = 0;
	};
};
player = new Boat(w/2,h/2,3,"#ffffff");

var play = function() {
	elements.menu.style.display = "none";
	playing = 1;
};
elements.play.onclick = play;

if (localStorage.highScore) {
	highScore = Number(localStorage.highScore);
} else {
	localStorage.highScore = 0;
};

var update = function() {
	g.fillStyle = "#0099ff";
	g.fillRect(0,0,w,h);
	for (i in bullets) {
		bullets[i].update();
	};
	for (i in bullets) {
		bullets[i].render();
	};
	for (i in boats) {
		boats[i].updateAsShooter();
	};
	for (i in boats) {
		boats[i].render();
	};
	if (playing) {
		player.updateAsPlayer();
		player.render();
		g.font = "30px Kumar One";
		g.textAlign = "left";
		g.fillText("Score: "+score,10,30);
		g.fillText("Highscore: "+highScore,10,65);
		g.textAlign = "right";
		g.fillText("BUILD "+buildNum,w-10,30);
		if (emp == true) {
			t = 4-Math.floor((Date.now()-timeOfEmp)/1000);
			if (t > 0) {
				g.textAlign = "center";
				g.fillStyle = "#cccccc";
				g.fillText(t,w/2,65);
			};
		};
		g.textAlign = "center";
		if (Date.now() - timeOfEmpEnd > 8000) {
			g.fillStyle = "#ffffff";
			t = "EMP Charge";
		} else {
			g.fillStyle = "#cccccc";
			t = "EMP Charge  "+(8-Math.floor((Date.now() - timeOfEmpEnd)/1000));
		};
		g.fillText(t,w/2,30);
	};
	if (empShockWave.visible) {
		empShockWave.update();
		empShockWave.render();
	};
	requestAnimationFrame(update);
};
setInterval(spawnBoat,spawnTime);

requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
update();