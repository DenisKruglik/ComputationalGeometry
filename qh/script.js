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
let maxPerimiter = null;

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
	maxPerimiter = document.querySelector('#maxPerimiter').value;
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

function findMaxXPointIndex(points){
	let max = 0;
	for (var i = 1; i < points.length; i++) {
		max = points[i].x > points[max].x ? i : max;
	}
	return max;
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

function qh(points){
	let leftest = findMinXPointIndex(points);
	let rightest = findMaxXPointIndex(points);
	let leftPoints = points.filter(p => rotate(points[leftest], points[rightest], p) > 0);
	let rightPoints = points.filter(p => rotate(points[rightest], points[leftest], p) > 0);
	let leftConv = [];
	let rightConv = [];
	addMostDistant(leftConv, [points[leftest], points[rightest]], leftPoints);
	addMostDistant(rightConv, [points[rightest], points[leftest]], rightPoints);
	let conv = [...leftConv, points[leftest], ...rightConv, points[rightest]];
	return conv;
}

function addMostDistant(conv, segment, points){
	if (points.length == 0) {
		return;
	}
	let maxS = 0;
	let maxSP = 0;
	points.forEach((p, ind) => {
		if (Math.abs(rotate(...segment, p)) > maxS) {
			maxS = Math.abs(rotate(...segment, p));
			maxSP = ind;
		}
	})
	let s1 = [segment[1], points[maxSP]];
	let ps1 = points.filter(p => rotate(...s1, p) < 0);
	if (ps1.length > 0) {
		addMostDistant(conv, s1, ps1);
	}
	
	conv.push(points[maxSP]);
	
	let s2 = [points[maxSP], segment[0]];
	let ps2 = points.filter(p => rotate(...s2, p) < 0);
	if (ps2.length > 0) {
		addMostDistant(conv, s2, ps2);
	}
}

function segmentToVector(segment){
	let vector = [segment[1].x - segment[0].x, segment[1].y - segment[0].y];
	normalizeVector(vector);
	return vector;
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

function getPerimiter(points){
	let len = points.length;
	let perimiter = 0;
	for(let i = 0; i < len - 1; i++){
		perimiter += points[i].distance(points[i+1]);
	}
	perimiter += points[len - 1].distance(points[0]);
	return perimiter;
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
	let conv = qh(cPoints);
	let perimiter = getPerimiter(conv);
	if (perimiter >= maxPerimiter) {
		let mostDistant = findMostDistant(points);
		let p1 = points.find(p => p.equals(mostDistant[0]));
		let p2 = points.find(p => p.equals(mostDistant[1]));
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