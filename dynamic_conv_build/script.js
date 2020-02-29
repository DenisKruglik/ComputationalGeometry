let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';
context.lineWidth = 2;

canvas.addEventListener('click', e => {
	let p = new Point(e.clientX, heigth - e.clientY);
	apply(p);
});

document.getElementById('apply').addEventListener('click', onApplyRandom);

document.getElementById('clear').addEventListener('click', e => {
	currentConv.splice(0);
	currentPoints.splice(0);
	draw();
});

let animationProcess = null;
let currentPoints = [];
let currentConv = [];

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

function copyPoints(points){
	return points.map(p => p.copy());
}

function getRandomPoint(){
	return new Point(getRandomInt(0, width), getRandomInt(0, heigth));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function apply(point){
	currentPoints.push(point);
	processPoints(point);
	draw();
}

function onApplyRandom(e){
	let pointsAmount = document.querySelector('#points').value;
	currentPoints = [];
	currentConv = [];
	let counter = 0;
	animationProcess = setInterval(() => {
		if (counter == pointsAmount) {
			return clearInterval(animationProcess);
		}

		let newPoint = getRandomPoint();
		apply(newPoint);
		counter++;
	}, 1000);
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

function segmentToVector(segment){
	let vector = [segment[1].x - segment[0].x, segment[1].y - segment[0].y];
	normalizeVector(vector);
	return vector;
}

function draw(){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	for (let p of currentPoints) {
		context.beginPath();
		context.arc(p.x, heigth - p.y, 1, Math.PI * 2, 0);
		context.stroke();
	}
	let len = currentConv.length;
	if (len == 2) {
		context.beginPath();
		context.moveTo(currentConv[0].x, heigth - currentConv[0].y);
		context.lineTo(currentConv[1].x, heigth - currentConv[1].y);
		context.stroke();
	}else if (len > 2) {
		context.beginPath();
		context.moveTo(currentConv[0].x, heigth - currentConv[0].y);
		for(let i = 1; i < len; i++){
			context.lineTo(currentConv[i].x, heigth - currentConv[i].y);
		}
		context.closePath();
		context.stroke();
	}
}

function processPoints(point){
	switch (currentConv.length) {
		case 0:
			currentConv.push(point);
			break;
		case 1:
			if (!currentConv[0].equals(point)) {
				currentConv.push(point);
			}
			break;
		case 2:
			if (rotate(currentConv[0], currentConv[1], point) < 0) {
				currentConv = [currentConv[0], point, currentConv[1]];
			}else{
				currentConv.push(point);
			}
			break;
		default:
			let len = currentConv.length;
			let firstVisiblePoint = null;
			let visiblePointsAmount = 0;
			let isChainOver = false;
			for(let i = 0; i < len; i++){
				let next = i < len - 1 ? i + 1 : 0;
				if (rotate(currentConv[i], currentConv[next], point) < 0) {
					if (isChainOver) {
						currentConv.splice(i+1);
						return currentConv.splice(0, visiblePointsAmount - 1, point);
					}
					if (firstVisiblePoint === null) {
						firstVisiblePoint = i;
						visiblePointsAmount++;
					}
					visiblePointsAmount++;
				}else if(firstVisiblePoint !== null){
					if (firstVisiblePoint > 0) {
						return currentConv.splice(firstVisiblePoint + 1, visiblePointsAmount - 2, point);
					}else{
						isChainOver = true;
					}
				}
			}
			if (isChainOver) {
				currentConv.splice(1, visiblePointsAmount - 2, point);
			}else if(firstVisiblePoint !== null){
				currentConv.splice(firstVisiblePoint + 1, visiblePointsAmount - 2, point);
			}
			break;
	}
}