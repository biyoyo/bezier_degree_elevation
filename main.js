var canvas = document.getElementById("curve")
var ctx = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 500;

var pointRadius = 5;
var isMoving = false;

var controlPoints = [[canvas.width / 2 - 200, canvas.height / 2 + 120],
[canvas.width / 2, canvas.height / 2 - 200],
[canvas.width / 2 + 200, canvas.height / 2 + 120]];

function init() {
    //draw bounding polygon
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1;
    for(var i = 0; i < controlPoints.length; i++)
    {
        ctx.lineTo(controlPoints[i][0], controlPoints[i][1]);
    }
    ctx.stroke();

    //draw bezier curve
    //drawBezierCurve();
    drawBezierCurveCasteljau();

    //draw control points
    ctx.beginPath();
    for (var i = 0; i < controlPoints.length; i++) {
        ctx.beginPath();
        ctx.arc(controlPoints[i][0], controlPoints[i][1], pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.font = "30px Arial"
    ctx.fillText("Degree: " + (controlPoints.length - 1), 10, 30);
}

function drawBezierCurveCasteljau() {
    var t = 0.0;
    var curveDegree = controlPoints.length - 1;
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;

    for (var i = 0; i <= 100; i++) {
        var controlArr = [...controlPoints];
        for(var j = 0; j < curveDegree; j++) {
            for(var r = 0; r < curveDegree - j; r++) {
                var newX = (1 - t) * controlArr[r][0] + t * controlArr[r + 1][0];
                var newY = (1 - t) * controlArr[r][1] + t * controlArr[r + 1][1];
                controlArr[r] = [newX, newY];
            }
        }
        t += 0.01;
        ctx.lineTo(controlArr[0][0], controlArr[0][1]);
    }
    ctx.stroke();
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

window.addEventListener('mouseup', _ => {
    isMoving = false;
})

function cursorOnControlPoint(x, y, point) {
    var epsilon = pointRadius + 1;
    return Math.abs(x - point[0]) <= epsilon && Math.abs(y - point[1]) <= epsilon;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function increaseDegree() {
    var newControlPoints = [];
    newControlPoints.push(controlPoints[0]);
    var n = controlPoints.length;

    for(var i = 1; i < n; i++)
    {
        newX = (i / n) * controlPoints[i - 1][0] + ((n - i) / n) * controlPoints[i][0];
        newY = (i / n) * controlPoints[i - 1][1] + ((n - i) / n) * controlPoints[i][1];
        newControlPoints.push([newX, newY]);
    }

    newControlPoints.push(controlPoints[n - 1]);
    controlPoints = newControlPoints;

    clearCanvas();
    init();
}

function decreaseDegree() {
    var n = controlPoints.length;
    var matrix = [];

    if (n === 3) return;

    for (var i = 0; i < n; i++) {
        matrix[i] = (new Array(n - 1)).fill(0);
        if (i === 0) { matrix[i][0] = 1; }
        else if (i === n - 1) {
            matrix[i][i - 1] = 1;
        }
        else {
            matrix[i][i - 1] = i / n;
            matrix[i][i] = 1 - matrix[i][i - 1];
        }
    }

    var transposed = transpose(matrix);

    var coef = multiply(inverse(multiply(transposed, matrix)), transposed);

    var newControlPoints = multiply(coef, controlPoints);

    controlPoints = newControlPoints.map(p => p.splice(0, 2));

    clearCanvas();
    init();
}

function transpose(matrix) {
    var tr = [];

    for(var i = 0; i < matrix[0].length; i++) {
        tr[i] = (new Array(matrix.length)).fill(0);
        for(var j = 0; j < matrix.length; j++)
        {
            tr[i][j] = matrix[j][i];
        }
    }

    return tr;
}

function multiply(A, B) {
    var product = [];

    for(var  i = 0; i < A.length; i++)
    {
        product[i] = (new Array(B[0].length)).fill(0);
        for(var j = 0; j < B[0].length; j++)
        {
            product[i][j] = 0;
            for(var k = 0; k < A[i].length; k++)
            {
                product[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return product;
}

function cofactor(A, rowToGo, colToGo) {
    var i = 0, j = 0;
    var dimension = A.length - 1;
    var cofactor = [];

    for(var row = 0; row < A.length; row++)
    {
        for(var col = 0; col < A[row].length; col++)
        {
            if(row != rowToGo && col != colToGo)
            {
                if(cofactor.length <= i)
                {
                    cofactor.push((new Array(dimension)).fill(0));
                }
                cofactor[i][j++] = A[row][col];

                if(j == dimension)
                {
                    j = 0;
                    i++;
                }
            }
        }
    }

    return cofactor;
}

function determinant(A)
{
    var det = 0;

    if(A.length == 1)
    {
        return A[0][0];
    }

    var sign = 1;

    for(var col = 0; col < A.length; col++)
    {
        var cof = cofactor(A, 0, col);

        det += sign * A[0][col] * determinant(cof);

        sign = -sign;
    }

    return det;
}

function adjoint(A) {
    var sign = 1;
    var dimension = A.length;
    var adj = [];

    for (var i = 0; i < dimension; i++) {
        adj[i] = (new Array(A.length)).fill(0);
        for (var j = 0; j < dimension; j++) {
            var cof = cofactor(A, i, j);
            sign = (i + j) % 2 == 0 ? 1 : -1;
            adj[i][j] = sign * determinant(cof);
        }
    }
    return adj;
}

function inverse(A) {
    var det = determinant(A);

    if(det == 0) {
        console.log("Matrix does not have inverse");
        return;
    }

    var adj = transpose(adjoint(A));

    var inv = adj.map(row => row.map(elem => elem/det));

    return inv;
}