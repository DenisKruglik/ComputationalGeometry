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
	draw(points);
	calculate(points);
}

function calculate(points){
	for (let i = 0; i < points.length; i++) {
		for (let j = 2; j < points.length - 1; j++) {
			if (doIntersect(points[0], points[1], points[j], points[j+1])) {
				return alert('Not simple');
			}
		}
		let p = points.shift();
		points.push(p);
	}
	alert('Simple');
}

function doIntersect(p1, p2, p3, p4){
	let d1 = (p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y);
	let d2 = (p4.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p4.y - p3.y);
	let d3 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
	let d4 = (p2.x - p1.x) * (p4.y - p1.y) - (p4.x - p1.x) * (p2.y - p1.y);
	if (d1 * d2 <= 0 && d3 * d4 <= 0) {
		return true;
	}
	return false;
}

function draw(points){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	context.beginPath();
	context.moveTo(points[0].x, heigth - points[0].y);
	for (let i = 1; i < points.length; i++) {
		context.lineTo(points[i].x, heigth - points[i].y);
		context.fillText('P' + (i+1), points[i].x+10, heigth - points[i].y-10);
	}
	context.lineTo(points[0].x, heigth - points[0].y);
	context.fillText('P1', points[0].x+10, heigth - points[0].y-10);
	context.stroke();
}