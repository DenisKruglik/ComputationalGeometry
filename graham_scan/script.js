let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';

document.getElementById('points').addEventListener('input', onVerticesAmountChange);
document.getElementById('apply').addEventListener('click', onApply);

class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	equals(p){
		return this.x == p.x && this.y == p.y;
	}
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
	let inputs = document.querySelector('.coords').children;
	for (let i = 1; i < inputs.length; i+=2) {
		let x = inputs[i-1].value*1;
		let y = inputs[i].value*1;
		points.push(new Point(x, y));
	}
	perform(points);
}

function perform(v){
	let vertices = v.map(p => p);
	let leftest = findMinXPointIndex(vertices);
	[vertices[leftest], vertices[0]] = [vertices[0], vertices[leftest]];
	vertices.sort((p1, p2) => -rotate(vertices[0], p1, p2));

	// drawverticesOneByOne(vertices);

	// let conv = grahamScan(vertices);
	// grahamScan(vertices);
	// draw(vertices, conv);

	let gen = grahamScan(vertices);
	let a = setInterval(() => {
		let env = gen.next();
		draw(vertices, env.value);
		if (env.done) {
			clearInterval(a);
		}
	}, 1000);
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

function* grahamScan(points){
    let conv = [points[0]];
    yield conv;
    conv.push(points[1]);
    yield conv;
    let left = points.slice(2);
    for(p of left){
    	while (rotate(conv[conv.length - 2], conv[conv.length - 1], p) < 0) {
    		yield [...conv, p];
    		conv.splice(conv.length - 1, 1);
    	}
    	conv.push(p);
		yield conv;
    }
    conv.push(points[0]);
    yield conv;
    return conv;
}

function draw(points, convexEnvelope){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	for (let p of points) {
		context.beginPath();
		context.arc(p.x, heigth - p.y, 1, Math.PI * 2, 0);
		context.stroke();
	}
	if (convexEnvelope.length > 0) {
		context.beginPath();
		context.moveTo(convexEnvelope[0].x, heigth - convexEnvelope[0].y);
		for(let i = 1; i < convexEnvelope.length; i++){
			context.lineTo(convexEnvelope[i].x, heigth - convexEnvelope[i].y);
		}
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