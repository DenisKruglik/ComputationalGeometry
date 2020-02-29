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

let tri = [];

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

	distanceToLine(l){
		return ((l[0].y - l[1].y)*this.x + (l[1].x - l[0].x)*this.y + (l[0].x*l[1].y - l[1].x*l[0].y)) / Math.sqrt((l[1].x - l[0].x)*(l[1].x - l[0].x) + (l[1].y - l[0].y)*(l[1].y - l[0].y));
	}

	polarAngle(){
		let theta = Math.atan2(this.y, this.x);
		theta *= 360 / (2 * Math.PI);
		return theta;
	}
}

function copyPoints(points){
	return points.map(p => p.copy());
}

function onApply(e){
	tri = [];
	let triangles = [];
	let p = document.getElementById('polygon');
	p = getPointsFromJSON(p.value);
	p = sortByY(p);
	addPositions(p);
	startTriangulation(p);
	triangles = tri.map(t => t.map(pos => p[pos]));
	draw(triangles);
}

function draw(tr){
	context.fillStyle = 'white';
	context.fillRect(0, 0, width, heigth);
	context.fillStyle = 'black';

	tr.forEach( function(t, index) {
		context.beginPath();
		context.moveTo(t[0].x, heigth - t[0].y);
		for (let i = 1; i < t.length; i++) {
			context.lineTo(t[i].x, heigth - t[i].y);
		}
		context.closePath();
		context.stroke();
	});
}

function vector(start, end) {
    return {
        x: end.x - start.x,
        y: end.y - start.y
    }
}

function scalarProduct(vect1, vect2) {
    return vect1.x * vect2.x + vect1.y * vect2.y;
}

function vectLen(vect) {
    return Math.sqrt(scalarProduct(vect, vect));
}

function angleBetweenVectors(vect1, vect2) {
    return Math.acos(scalarProduct(vect1, vect2) / (vectLen(vect1) * vectLen(vect2)));
}

function det(x1, x2, y1, y2) {
    return x1 * y2 - x2 * y1;
}

function sideOfPoint(det) {
    if (det > 0)
        return -1;
    else if (det < 0)
        return 1;
    else
        return 0;
}

function lineMinusPointSide(vect, point) { 
    let determ = det(vect[1].x - vect[0].x, point.x - vect[0].x,
        vect[0].y - vect[1].y, vect[0].y - point.y);
    return sideOfPoint(determ);
}

function addPositions(points) {
    let i = 0;
    points.forEach(function(item) {
        item.pos = i++;
    })
}

function sortByY(points) {
    return points.sort(function(a, b) {
        return b.y - a.y;
    });
}

function sortByAsc(arr) {
    return arr.sort(function(a, b) {
        return a > b;
    })
}

function findNearestPoint(points, point1, point2) {
    let maxAngle = -Infinity;
    let maxPos = -1;
    points.forEach(function(item, i) {
        let angle = angleBetweenVectors(vector(item, point1), vector(item, point2));
        if (angle > maxAngle) {
            maxAngle = angle;
            maxPos = i;
        }
    })
    return maxPos;
}

function startTriangulation(points) {
    let nearestPoint = findNearestPoint(points, points[0], points[1]);
    tri.push(sortByAsc([points[0].pos, points[1].pos, points[nearestPoint].pos]));
    let line = [points[0].copy(), points[1].copy()];
    if (lineMinusPointSide(line, points[nearestPoint]) == 1) { 
        triangulation(points, points[1], points[nearestPoint]);
        triangulation(points, points[nearestPoint], points[0]);
    } else {
        triangulation(points, points[0], points[nearestPoint]);
        triangulation(points, points[nearestPoint], points[1]);
    }
}

function triangleExist(arr) {
    let flag = false;
    tri.forEach(function(item) {
        if (item[0] == arr[0] && item[1] == arr[1] && item[2] == arr[2]) {
            flag = true;
            return;
        }
    })
    return flag;
}

function triangulation(points, point1, point2) {
    let higher = [];
    let line = [point1.copy(), point2.copy()];
    points.forEach(function(item, i, arr) { 
        if (lineMinusPointSide(line, item) == -1) {
            higher.push(item);
        }
    });

    if (higher.length) {
        let point = findNearestPoint(higher, point1, point2);
        let triangle = sortByAsc([point1.pos, point2.pos, higher[point].pos]);
        if (!triangleExist(triangle)) {
            tri.push(triangle);
            triangulation(points, point1, higher[point]);
            triangulation(points, higher[point], point2);
        }
    }
}

function getPointsFromJSON(data){
	data = JSON.parse(data);
	let points = [];
	for(let o of data){
		points.push(new Point(o.x, o.y));
	}
	return points;
}