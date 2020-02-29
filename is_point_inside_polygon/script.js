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
	let consideredX = document.getElementById('pointConsideredX').value*1;
	let consideredY = document.getElementById('pointConsideredY').value*1;
	let considered = new Point(consideredX, consideredY);
	let inputs = document.querySelector('.coords').children;
	for (let i = 1; i < inputs.length; i+=2) {
		let x = inputs[i-1].value*1;
		let y = inputs[i].value*1;
		points.push(new Point(x, y));
	}
	let q = new Point(findMinX(points) - 10, consideredY);
	draw(points, considered, q);
	calculate(points, considered, q);
}

function calculate(points, considered, q){
	if (considered.x < findMinX(points) || considered.x > findMaxX(points)
		|| considered.y < findMinY(points) || considered.y > findMaxY(points)) {
		return alert('Out of polygon');
	}else{
		let count = 0;
		let len = points.length;

		for (let i = 0; i < len; i++) {
			if (considered.equals(points[i])) {
				return alert('Collides with the vertex');
			}

			let more = i == len - 1 ? 0 : i + 1;
			let less = i == 0 ? len - 1 : i - 1;

			if (contains([considered, q], [points[i], points[more]]) || contains([points[i], points[more]], [considered, q])) {
				let muchMore = i == len - 2 ? 0 : (i == len - 1 ? 1 : i + 2);
				if (rotate(considered, q, points[less]) * rotate(considered, q, points[muchMore]) < 0) {
					count++;
				}
				i++;
			}else if (isPointOnLineSegment([considered, q], points[i])) {
				if (rotate(considered, q, points[less]) * rotate(considered, q, points[more]) <= 0) {
					count++;
				}
			}else if (doIntersect(considered, q, points[i], points[more]) && !isPointOnLineSegment([considered, q], points[more])) {
				count++;
			}
		}

		console.log(count);

		if (count % 2 == 0) {
			return alert('Out of polygon');
		}
		return alert('Inside the polygon');
	}
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

function isPointOnLineSegment(segment, point){
	if (rotate(segment[0], segment[1], point) == 0) {
		let minX = findMinX(segment);
		let maxX = findMaxX(segment);
		let minY = findMinY(segment);
		let maxY = findMaxY(segment);
		if (minX <= point.x && point.x <= maxX && minY <= point.y && point.y <= maxY) {
			return t// KILL ME PLZ
		}
	}
	return false;
}

function contains(line1, line2){
	if (isPointOnLineSegment(line1, line2[0]) && isPointOnLineSegment(line1, line2[1])) {
		return true;
	}
	return false;
}

function rotate(p1, p2, p3){
	return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

function draw(points, considered, q){
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
	context.beginPath();
	context.moveTo(considered.x, heigth - considered.y);
	context.lineTo(q.x, heigth - q.y);
	context.stroke();
	context.fillText('P0', considered.x+10, heigth - considered.y-10);
	context.fillText('Q', q.x+10, heigth - q.y-10);
}



function expandedForm(num){
	num = num + '';
	let len = num.length;
	let parts = [];
	for(let i = 0; i < len; i++){
		if (num[i] != '0') {
			let zerosAmount = len - (i + 1);
			let zeros = '0'.repeat(zerosAmount);
			parts.push(num[i] + zeros);
		}
	}
	return parts.join(' + ');
}