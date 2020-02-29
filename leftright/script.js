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
	let p1 = new Point(p1x, p1y);
	let p2 = new Point(p2x, p2y);
	let p3 = new Point(p3x, p3y);
	draw(p1, p2, p3);
	calculate(p1, p2, p3);
}

function calculate(p1, p2, p3){
	let z = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
	if (z > 0) {
		alert('Left');
	}else if(z < 0){
		alert('Right');
	}else{
		alert('On');
	}
}

function draw(p1, p2, p3){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';
	context.beginPath();
	context.moveTo(p1.x, heigth - p1.y);
	context.lineTo(p2.x, heigth - p2.y);
	context.stroke();
	context.beginPath();
	context.arc(p3.x, heigth - p3.y, 1, Math.PI * 2, 0);
	context.fill();
	context.fillText('P1', p1.x+10, heigth - p1.y-10);
	context.fillText('P2', p2.x+10, heigth - p2.y-10);
	context.fillText('P3', p3.x+10, heigth - p3.y-10);
}