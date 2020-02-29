let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';
context.lineWidth = 2;

document.getElementById('points').addEventListener('input', onVerticesAmountChange);
document.getElementById('apply').addEventListener('click', onApply);

let animationProcess = null;
let velocity = null;

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

	reflect(vector){
		let coef = 2 * (scalarProduct(this.direction, vector) / scalarProduct(vector, vector));
		let dir = [vector[0] * coef - this.direction[0], vector[1] * coef - this.direction[1]];
		this.direction = dir;
	}

	polarAngle(){
		let theta = Math.atan2(this.y, this.x);
		theta *= 360 / (2 * Math.PI);
		return theta;
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

function scalarProduct(v1, v2){
	return v1[0]*v2[0] + v1[1]*v2[1];
}

function getRandomlyMovingPoints(amount, polygon){
	let minX = findMinX(polygon);
	let maxX = findMaxX(polygon);
	let minY = findMinY(polygon);
	let maxY = findMaxY(polygon);
	let points = [];
	for (let i = 0; i < amount; i++) {
		let p = null;
		do{
			let direction = [Math.random(), Math.random()];
			normalizeVector(direction);
			for(let i in direction){
				if (!Math.round(Math.random())) {
					direction[i] = -direction[i];
				}
			}
			p = new MovingPoint(getRandomInt(minX, maxX), getRandomInt(minY, maxY), direction);
		}while (!isPointInsideConvexPolygon(polygon, p));
		points.push(p);
	}
	return points;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onVerticesAmountChange(e){
	let container = e.target.parentNode.querySelector('.coords');
	let amount = e.target.value;
	let actual = container.querySelectorAll('input.coord').length / 2;
	if (amount > 2) {
		if (actual < amount) {
			for (let i = 0; i < (amount - actual) * 2; i++) {
				let input = document.createElement('input');
				input.setAttribute('type', 'number');
				input.classList.add('coord');
				container.appendChild(input);
			}
		}else if(actual > amount){
			for (let i = 0; i < (actual - amount) * 2; i++) {
				container.querySelector('.coord:last-child').remove();
			}
		}
	}
}

function onApply(e){
	let points = [];
	let counter = 0;
	let amount = document.getElementById('amount').value*1;
	let inputs = document.querySelector('.coords').children;
	let v = document.getElementById('velocity').value*1;
	for (let i = 1; i < inputs.length; i+=2) {
		let x = inputs[i-1].value*1;
		let y = inputs[i].value*1;
		points.push(new Point(x, y));
	}
	perform(points, amount, v);
}

function perform(points, hole, amount, v){
	velocity = v;
	let movingPoints = getRandomlyMovingPoints(amount, points);
	startRendering(points, hole, movingPoints);
}

function isPointInsideConvexPolygon(polygon, point){
	let len = polygon.length;
	if (rotate(polygon[0], polygon[1], point) < 0 || rotate(polygon[0], polygon[len - 1], point) > 0){
	    return false;
	}
	let p = 1;
	let r = len - 1;
  	while (r - p > 1){
  		let q = Math.floor((p + r) / 2);
    	if (rotate(polygon[0], polygon[q], point) < 0){
    		r = q;
    	}else{
    		p = q;
    	}
  	}
    return !doIntersect(polygon[0], point, polygon[p], polygon[r]);
}

function isPointInsideSimplePolygon(polygon, point){
	let total = 0;
	let len = polygon.length;
	for (let i = 0; i < len; i++) {
		let side = null;
		if (i < len - 1) {
			side = [polygon[i], polygon[i+1]];
		}else{
			side = [polygon[i], polygon[0]];
		}
		let v1 = segmentToVector([point, side[0]]);
		let v2 = segmentToVector([point, side[1]]);
		let ang = toDegrees(angle(v1, v2) * (-sign(rotate(...side, point))));
		total += ang;
	}
	return total < -180;
}

function angle(v1, v2){
	let cos = scalarProduct(v1, v2) / (vectorLength(v1) * vectorLength(v2));
	return Math.acos(cos);
}

function vectorLength(vector){
	return Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
}

function sign(x){
	return x < 0 ? -1 : (x > 0 ? 1 : 0);
}

function toDegrees(angle){
	return angle*(360 / (2 * Math.PI));
}

function findMinX(points){
	let min = points[0].x;
	for (var i = 1; i < points.length; i++) {
		min = points[i].x < min ? points[i].x : min;
	}
	return min;
}

function findMinY(points){
	let min = points[0].y;
	for (var i = 1; i < points.length; i++) {
		min = points[i].y < min ? points[i].y : min;
	}
	return min;
}

function findMaxX(points){
	let max = points[0].x;
	for (var i = 1; i < points.length; i++) {
		max = points[i].x > max ? points[i].x : max;
	}
	return max;
}

function findMaxY(points){
	let max = points[0].y;
	for (var i = 1; i < points.length; i++) {
		max = points[i].y > max ? points[i].y : max;
	}
	return max;
}

function doIntersect(p1, p2, p3, p4){
	let d1 = rotate(p3, p4, p1);
	let d2 = rotate(p3, p4, p2);
	let d3 = rotate(p1, p2, p3);
	let d4 = rotate(p1, p2, p4);
	if (d1 * d2 <= 0 && d3 * d4 <= 0 && Math.abs(d1 * d2) + Math.abs(d3 * d4) > 0) {
		return true;
	}
	return false;
}

function segmentToVector(segment){
	let vector = [segment[1].x - segment[0].x, segment[1].y - segment[0].y];
	normalizeVector(vector);
	return vector;
}

function rotate(p1, p2, p3){
	return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function draw(polygon, hole, points){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';

	context.beginPath();
	context.moveTo(polygon[0].x, heigth - polygon[0].y);
	for (let i = 1; i < polygon.length; i++) {
		context.lineTo(polygon[i].x, heigth - polygon[i].y);
	}
	context.closePath();
	context.stroke();

	context.beginPath();
	context.moveTo(hole[0].x, heigth - hole[0].y);
	for (let i = 1; i < hole.length; i++) {
		context.lineTo(hole[i].x, heigth - hole[i].y);
	}
	context.closePath();
	context.stroke();

	for (let p of points) {
		context.beginPath();
		context.arc(p.x, heigth - p.y, 1, Math.PI * 2, 0);
		context.stroke();
	}
}

function startRendering(polygon, hole, points){
	clearInterval(animationProcess);
	animationProcess = setInterval(() => {
		processPoints(polygon, hole, points);
		points.forEach((el) => {
			el.x += el.direction[0] * velocity;
			el.y += el.direction[1] * velocity;
		})
		draw(polygon, hole, points);
	}, 20);
}

function processPoints(polygon, hole, points){
	let len = polygon.length;
	let hlen = hole.length;
	points.forEach((p, ind) => {
		let nPoint = p.copy();
		nPoint.x += nPoint.direction[0] * velocity;
		nPoint.y += nPoint.direction[1] * velocity;

		for(let i = 0; i < hlen - 1; i++){
			if (isPointInsideSimplePolygon(hole, nPoint)) {
				return points.splice(ind, 1);
			}
		}
		if (isPointInsideSimplePolygon(hole, nPoint)) {
			return points.splice(ind, 1);;
		}

		for(let i = 0; i < len - 1; i++){
			if (rotate(polygon[i], polygon[i+1], nPoint) <= 0) {
				return p.reflect(segmentToVector([polygon[i], polygon[i+1]]));
			}
		}
		if (rotate(polygon[len - 1], polygon[0], nPoint) <= 0) {
			return p.reflect(segmentToVector([polygon[len - 1], polygon[0]]));
		}
	});
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