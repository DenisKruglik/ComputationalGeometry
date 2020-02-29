let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let width = window.innerWidth;
let heigth = window.innerHeight;
canvas.setAttribute('width', width);
canvas.setAttribute('height', heigth);

context.font = '14px Arial';

document.getElementById('apply').addEventListener('click', onApply);

class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}

function onApply(e){
	let p1x = document.getElementById('p1x').value*1;
	let p1y = document.getElementById('p1y').value*1;
	let p2x = document.getElementById('p2x').value*1;
	let p2y = document.getElementById('p2y').value*1;
	let p3x = document.getElementById('p3x').value*1;
	let p3y = document.getElementById('p3y').value*1;
	let p4x = document.getElementById('p4x').value*1;
	let p4y = document.getElementById('p4y').value*1;
	let p1 = new Point(p1x, p1y);
	let p2 = new Point(p2x, p2y);
	let p3 = new Point(p3x, p3y);
	let p4 = new Point(p4x, p4y);
	draw(p1, p2, p3, p4);
	calculate(p1, p2, p3, p4);
}

function calculate(p1, p2, p3, p4){
	let d1 = (p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y);
	let d2 = (p4.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p4.y - p3.y);
	let d3 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
	let d4 = (p2.x - p1.x) * (p4.y - p1.y) - (p4.x - p1.x) * (p2.y - p1.y);
	if (d1 * d2 <= 0 && d3 * d4 <= 0) {
		alert('Intersect');
	}else{
		alert('Don\'t intersect');
	}
}

function draw(p1, p2, p3, p4){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	context.beginPath();
	context.moveTo(p1.x, heigth - p1.y);
	context.lineTo(p2.x, heigth - p2.y);
	context.moveTo(p3.x, heigth - p3.y);
	context.lineTo(p4.x, heigth - p4.y);
	context.stroke();
	context.fillText('P1', p1.x+10, heigth - p1.y-10);
	context.fillText('P2', p2.x+10, heigth - p2.y-10);
	context.fillText('P3', p3.x+10, heigth - p3.y-10);
	context.fillText('P4', p4.x+10, heigth - p4.y-10);
}