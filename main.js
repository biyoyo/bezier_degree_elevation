var canvas = document.getElementById("curve")
var ctx = canvas.getContext("2d");
canvas.width = 1080;
canvas.height = 500;
canvas.style.border = "1px solid #000000"

var pointRadius = 5;
var isMoving = false;

var controlPoints = [[canvas.width / 2 - 200, canvas.height / 2 + 100],
[canvas.width / 2, canvas.height / 2 - 200],
[canvas.width / 2 + 200, canvas.height / 2 + 100]];

function init() {
    //draw bounding poligon
    ctx.beginPath();
    for(var i = 0; i < controlPoints.length; i++)
    {
        ctx.lineTo(controlPoints[i][0], controlPoints[i][1]);
    }
    ctx.stroke();

    //draw control points
    ctx.beginPath();
    for (var i = 0; i < controlPoints.length; i++) {
        ctx.beginPath();
        ctx.arc(controlPoints[i][0], controlPoints[i][1], pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.stroke();
    }

    var points = [];
    var t = 0;

    ctx.beginPath();
    var n = controlPoints.length - 1;
    for (var i = 0; i < 100; i++) {
        var x = 0, y = 0;
        for (var j = 0; j <= n; j++) {
            var coef = binomial(n, j) * Math.pow((1 - t), (n - j)) * Math.pow(t, j);
            x += coef * controlPoints[j][0];
            y += coef * controlPoints[j][1];
        }
        t += 0.01;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

}

function binomial(n, k) {

    var result = 1;
    for (var x = n - k + 1; x <= n; x++) {
        result *= x;
    }
    for (var x = 1; x <= k; x++) {
        result /= x;
    }

    return result;
}

var movingPoint;

canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;

    for (var p = 0; p < controlPoints.length; p++) {
        if (cursorOnControlPoint(x, y, controlPoints[p])) {
            movingPoint = p;
            isMoving = true;
            return true;
        }
    }
    return false;
})

canvas.addEventListener('mousemove', e => {
    if (isMoving == true) {
        x = e.offsetX;
        y = e.offsetY;

        controlPoints[movingPoint] = [x, y];
        clearCanvas();
        init();
    }
})

window.addEventListener('mouseup', e => {
    isMoving = false;
})

function cursorOnControlPoint(x, y, point) {
    var epsilon = pointRadius;
    return Math.abs(x - point[0]) <= epsilon && Math.abs(y - point[1]) <= epsilon;
}