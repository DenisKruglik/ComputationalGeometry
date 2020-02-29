let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';
context.lineWidth = 2;

document.querySelectorAll('#data-input input[type=number], #data-input textarea').forEach(input => {
	input.value = localStorage[input.id] !== undefined ? localStorage[input.id] : '';
});

document.querySelectorAll('#data-input input, #data-input textarea').forEach(input => {
	input.addEventListener('input', e => {
		localStorage[e.target.id] = e.target.value;
	});
});
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

	reflect(vector){
		let coef = 2 * (scalarProduct(this.direction, vector) / scalarProduct(vector, vector));
		let dir = [vector[0] * coef - this.direction[0], vector[1] * coef - this.direction[1]];
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onApply(e){
	let fIn = document.getElementById('first-polygon');
	let sIn = document.getElementById('second-polygon');
	let firstPolygon = getPointsFromJSON(fIn.value);
	let secondPolygon = getPointsFromJSON(sIn.value);
	let v = document.getElementById('velocity').value*1;
	perform(firstPolygon, secondPolygon, v);
}

function perform(firstPolygon, secondPolygon, v){
	velocity = v;
	startRendering(firstPolygon, secondPolygon);
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

// function intersectionPoint(s1, s2){
// 	let x1 = s1[0].x;
// 	let y1 = s1[0].y;
// 	let x2 = s1[1].x;
// 	let y2 = s1[1].y;
// 	let x3 = s2[0].x;
// 	let y3 = s2[0].y;
// 	let x4 = s2[1].x;
// 	let y4 = s2[1].y;
// 	let x = -((x1*y2-x2*y1)*(x4-x3)-(x3*y4-x4*y3)*(x2-x1))/((y1-y2)*(x4-x3)-(y3-y4)*(x2-x1));
// 	let y = -((y3-y4)*x-(x3*y4-x4*y3))/(x4-x3);
// 	return new Point(x, y);
// }

function intersectionPoint(s1, s2){
	let a = s1[0];
	let b = s1[1];
	let c = s2[0];
	let d = s2[1];
	let n = new Point(d.y - c.y, c.x - d.x);
	let denom = dotProduct(n, new Point(b.x - a.x, b.y - a.y));
	let num = dotProduct(n, new Point(a.x - c.x, a.y - c.y));
	let t = -num / denom;
	return new Point(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
}

function dotProduct(p, q){
	return p.x * q.x + p.y * q.y;
}

function segmentToVector(segment){
	let vector = [segment[1].x - segment[0].x, segment[1].y - segment[0].y];
	normalizeVector(vector);
	return vector;
}

function rotate(p1, p2, p3){
	return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function draw(p1, p2, intersection){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';

	console.log(intersection);

	context.beginPath();
	context.moveTo(p1[0].x, heigth - p1[0].y);
	for (let i = 1; i < p1.length; i++) {
		context.lineTo(p1[i].x, heigth - p1[i].y);
	}
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(p2[0].x, heigth - p2[0].y);
	for (let i = 1; i < p2.length; i++) {
		context.lineTo(p2[i].x, heigth - p2[i].y);
	}
	context.closePath();
	context.fill();

	if (intersection.length > 0) {
		context.fillStyle = 'white';
		context.beginPath();
		context.moveTo(intersection[0].x, heigth - intersection[0].y);
		for (let i = 1; i < intersection.length; i++) {
			context.lineTo(intersection[i].x, heigth - intersection[i].y);
		}
		context.closePath();
		context.fill();
	}
}

function startRendering(p1, p2){
	clearInterval(animationProcess);
	animationProcess = setInterval(() => {
		p1.forEach((el) => {
			el.x += velocity;
		})
		p2.forEach((el) => {
			el.x -= velocity;
		})
		let intersection = clipPolygon(p1, p2);
		draw(p1, p2, intersection);
	}, 20);
}

function getPointsFromJSON(data){
	data = JSON.parse(data);
	let points = data.map(d => new Point(d.x, d.y));
	return points;
}

function clipPolygon(s, p){
	let q = s.map(e => e.copy());
	let r = [];
	let flag = true;
	let len = p.length;
	for(let i = 0; i < len; i++){
		let next = i < len - 1 ? i + 1 : 0;
		let e = [p[i], p[next]];
		r = clipPolygonToEdge(q, e);
		if (r.length > 0) {
			q = r;
		}else{
			flag = false;
			break;
		}
	}
	if (flag) {
		return q;
	}
	return [];
}

function clipPolygonToEdge(s, e){
	let p = [];
	let crossingPt = null;
	let len = s.length;
	for(let i = 0; i < len; i++){
		let org = s[i];
		let next = i < len - 1 ? i+1 : 0;
		let dest = s[next];
		let orgIsInside = rotate(...e, org) <= 0;
		let destIsInside = rotate(...e, dest) <= 0;
		if (orgIsInside != destIsInside) {
			crossingPt = intersectionPoint(e, [org, dest]);
		}
		if(orgIsInside && destIsInside){
			p.push(dest);
		}else if (orgIsInside && !destIsInside) {
			if (!org.equals(crossingPt)) {
				p.push(crossingPt);
			}
		}else if (!orgIsInside && !destIsInside) {
			
		}else{
			p.push(crossingPt);
			if (!dest.equals(crossingPt)) {
				p.push(dest);
			}
		}
	}
	return p;
}