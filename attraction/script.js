let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';
context.lineWidth = 2;

document.getElementById('apply').addEventListener('click', onApply);

let animationProcess = null;
let velocity = null;
let maxDistance = null;

class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	equals(p){
		return this.x == p.x && this.y == p.y;
	}

	copy(){
		return new Point(this.x, this.y);
	}

	distance(p){
		let x = this.x - p.x;
		let y = this.y - p.y;
		return Math.sqrt(x*x + y*y);
	}
}

class MovingPoint extends Point{
	constructor(x, y, direction){
		super(x, y);
		this.direction = direction;
	}

	copy(){
		return new MovingPoint(this.x, this.y, this.direction);
	}

	headTo(p){
		let dir = [p.x - this.x, p.y - this.y];
		normalizeVector(dir);
		this.direction = dir;
	}
}

function copyPoints(points){
	return points.map(p => p.copy());
}

function normalizeVector(vector){
	let vectLen = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
	vector[0] /= vectLen;
	vector[1] /= vectLen;
}

function getRandomlyMovingPoints(amount){
	let points = [];
	for (let i = 0; i < amount; i++) {
		let direction = [Math.random(), Math.random()];
		normalizeVector(direction);
		for(let i in direction){
			if (!Math.round(Math.random())) {
				direction[i] = -direction[i];
			}
		}
		points.push(new MovingPoint(getRandomInt(0, width), getRandomInt(0, heigth), direction));
	}
	return points;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onApply(e){
	let pointsAmount = document.querySelector('#points').value;
	velocity = document.querySelector('#velocity').value;
	maxDistance = document.querySelector('#maxDistance').value;
	let points = getRandomlyMovingPoints(pointsAmount);
	startRendering(points);
}

function findMinXPointIndex(points){
	let min = 0;
	for (var i = 1; i < points.length; i++) {
		min = points[i].x < points[min].x ? i : min;
	}
	return min;
}

function getPointsFromJSON(data){
	data = JSON.parse(data);
	let points = [];
	for(let o of data){
		points.push(new Point(o.x, o.y));
	}
	return points;
}

function pointsToJSON(){
	let c = document.querySelectorAll('input.coord');
	let arr = [];
	for(let i = 0; i < c.length; i+=2){
		let obj = {
			x: c[i].value*1,
			y: c[i+1].value*1
		}
		arr.push(obj);
	}
	return JSON.stringify(arr);
}

function rotate(p1, p2, p3){
	return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function jarvisMarch(points){
	let leftest = findMinXPointIndex(points);
	[points[leftest], points[0]] = [points[0], points[leftest]];
	let conv = points.splice(0, 1);
	points.push(conv[0]);

	while (true) {
		let right = 0;
		for (let i = 1; i < points.length; i++) {
			if (rotate(conv[conv.length - 1], points[right], points[i]) < 0) {
				right = i;
			}
		}
		if (points[right].equals(conv[0])) {
			break;
		}else{
			conv.push(...points.splice(right, 1));
		}
	}
	return conv;
}

function draw(points){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	for (let p of points) {
		context.beginPath();
		context.arc(p.x, heigth - p.y, 1, Math.PI * 2, 0);
		context.stroke();
	}
}

function drawPointsOneByOne(points){
	let considered = [];
	let ind = 0;
	let flag = true;

	let interval = setInterval(() => {
		if (!flag) {
			clearInterval(interval);
		}

		if (ind == points.length) {
			ind = 0;
			flag = false;
		}
		considered.push(points[ind]);
		ind++;

		context.fillStyle = 'white';
		context.fillRect(0, 0, width, heigth);
		context.fillStyle = 'black';

		context.beginPath();
		context.moveTo(considered[0].x, heigth - considered[0].y);
		for(let i = 1; i < considered.length; i++){
			context.lineTo(considered[i].x, heigth - considered[i].y);
		}
		context.stroke();

	}, 3000);
}

function findMostDistant(points){
	let len = points.length;
	let p1 = 0;
	let p2 = 1;
	let resP1 = p1;
	let resP2 = p2;
	let max = 0;
	while (p1 < len) {
		let d = points[p1].distance(points[p2]);
		if (max <= d) {
			max = d;
			resP1 = p1;
			resP2 = p2;
			if (p2 < len - 1) {
				p2++;
			}else{
				p2 = 0;
			}
		}else{
			p1++;
		}
	}
	return [points[resP1], points[resP2]];
}

function processPoints(points){
	let cPoints = copyPoints(points);
	let conv = jarvisMarch(cPoints);
	let distant = findMostDistant(conv);
	let p1 = points.find(p => p.equals(distant[0]));
	let p2 = points.find(p => p.equals(distant[1]));
	if (p1.distance(p2) >= maxDistance) {
		p1.headTo(p2);
		p2.headTo(p1);
	}
}

function startRendering(points){
	clearInterval(animationProcess);
	animationProcess = setInterval(() => {
		points.forEach((el) => {
			el.x += el.direction[0] * velocity;
			el.y += el.direction[1] * velocity;
		})
		processPoints(points);
		draw(points);
	}, 20);
}