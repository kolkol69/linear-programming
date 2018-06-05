let aParams;
let bParams;
let limits;
let fcjaCelu;
let pdParams = [];
let pdFcjaCelu = [];
let pdTraces = [];
let traces = [];
let pdLinesCoords = [];
let pointsToCheck = [];
let minimum;
let pdIntersectionPoints = [];
let finalResult = [];
var layout = {
    xaxis: {
        range: [0, 8]
    },
    yaxis: {
        range: [0, 6]
    },
    title: 'Rozwiazanie PD'
};

(function () {

    $('#my-form').submit(function () {
        // get all the inputs into an array.
        var $inputs = $('#my-form :input');

        // not sure if you wanted this, but I thought I'd add it.
        // get an associative array of just the values.
        var values = {};
        $inputs.each(function () {
            values[this.name] = $(this).val();
        });
        aParams = $inputs[0].value.split(',');
        bParams = $inputs[1].value.split(',');
        fcjaCelu = $inputs[2].value.split(',');
        limits = $inputs[3].value.split(',');
        return false;
    });
})();

function findXnY(a, b, y3) {
    let y1, y2;
    if (a !== 0) {
        y1 = y3 / a;
    } else y1 = 0;
    if (b !== 0) {
        y2 = y3 / b;
    } else y2 = 0;

    return {
        y1,
        y2
    }
}

function PPtoPD() {
    console.log("Problem Dualny")
    let paramLen = aParams.length > bParams.length ? aParams.length : bParams.length;
    for (let i = 0; i < paramLen; i++) {
        if (aParams[i] === undefined) {
            aParams[i] = 0;
        } if (bParams[i] === undefined) {
            bParams[i] = 0;
        }
        pdParams[i] = {
            y1: aParams[i],
            y2: bParams[i],
            y3: fcjaCelu[i],
        }
        if (i < limits.length)
            pdFcjaCelu[i] = limits[i];
        console.log(
            `${i + 1}) ${aParams[i]}*y1 + ${bParams[i]}*y2 >= ${fcjaCelu[i]}`
        );
    }
    console.log(
        `G(y1,y2) = ${limits[0]}*y1 + ${limits[1]}*y2 -> min
        `
    );
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function createPlot() {
    PPtoPD(aParams, bParams, limits, fcjaCelu);
    let newParams;
    for (let i = 0; i < aParams.length; i++) {

        newParams = findXnY(pdParams[i].y1, pdParams[i].y2, pdParams[i].y3);
        pdLinesCoords[i] = {
            startX: 0,
            startY: newParams.y2,
            endX: newParams.y1,
            endY: 0,
        }
        traces[i] = {
            x: [0, newParams.y1],
            y: [newParams.y2, 0],
            name: `${i + 1}) ${pdParams[i].y1}*y1 + ${pdParams[i].y2}*y2 >= ${pdParams[i].y3}`,
            mode: 'lines'
        }
    }
}

function findLinesIntersections() {
    let isLineInter, counter = 0;
    for (let i = 0; i < pdLinesCoords.length; i++) {
        for (let j = i + 1; j < pdLinesCoords.length; j++) {
            isLineInter = checkLineIntersection(
                pdLinesCoords[i].startX,
                pdLinesCoords[i].startY,
                pdLinesCoords[i].endX,
                pdLinesCoords[i].endY,
                pdLinesCoords[j].startX,
                pdLinesCoords[j].startY,
                pdLinesCoords[j].endX,
                pdLinesCoords[j].endY
            );

            if (isLineInter.x !== null || isLineInter.y !== null)
                pdIntersectionPoints[counter++] = isLineInter;
        }
    }
}
function isOnLine(point, line) {
    // pdParams;
    return line.y3 === (point.x * line.y1 + point.y * line.y2);
}

function topPoint(point) {
    let baseDist = 0;
    let countDist = 0;
    let midX, midY;
    for (let i = 0; i < pdParams.length; i++) {
        // baseDist=getDistance()
        if (!isOnLine(point, pdParams[i])) {
            // провіряємо чи її відстань до інших прямих 
            // в сторону нуля чи в сторону від нуля
            // якщо в сторону нуля то не беремо її
            // якщо знайшли ту шо треба то ретурн тру
            // НА ДАНОМУ ЕТАПІ в нас є точка яку треба провірити
            // і пряма на якій вона не лежить
            // дивимось де вона відносно точки

            baseDist = getDistance(0, 0, point.x, point.y);
            midX = (pdLinesCoords[i].startX + pdLinesCoords[i].endX) / 2;
            midY = (pdLinesCoords[i].startY + pdLinesCoords[i].endY) / 2;
            countedDist = getDistance(0, 0, midX, midY);
            if (countedDist > baseDist) return false;
        }
    }
    return true;
}

function getDistance(startX, startY, endX, endY) {
    let dist = 0;
    dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    return dist;
}

function getPointsToCheck() {

    let counter = 0;
    let maxY = 0, maxX = 0;

    for (let i = 0; i < pdLinesCoords.length; i++) {
        if (maxX < pdLinesCoords[i].endX) maxX = pdLinesCoords[i].endX;
        if (maxY < pdLinesCoords[i].startY) maxY = pdLinesCoords[i].startY;
    }
    pointsToCheck[counter] = {
        x: maxX,
        y: 0,
    }
    pointsToCheck[++counter] = {
        x: 0,
        y: maxY,
    }
    for (let j = 0; j < pdIntersectionPoints.length; j++) {
        if (pdIntersectionPoints[j].onLine1 === true && pdIntersectionPoints[j].onLine2 === true) {
            if (topPoint(pdIntersectionPoints[j])) {
                pointsToCheck[++counter] = {
                    x: pdIntersectionPoints[j].x,
                    y: pdIntersectionPoints[j].y,
                }
            }
        }
    }

    let traceLen = traces.length;
    for (let k = 0; k < pointsToCheck.length; k++) {
        traces[traceLen + k] = {
            x: [pointsToCheck[k].x],
            y: [pointsToCheck[k].y],
            marker: {
                size: 12,
            },
            name: `(${pointsToCheck[k].x},${pointsToCheck[k].y})`,
            mode: 'markers'
        }
    }
    Plotly.newPlot('myDiv', traces, layout);

    return pointsToCheck;
}

function findMinFunction(points) {
    let min = 99999999999999999, tmp;
    let result;
    for (let i = 0; i < points.length; i++) {
        tmp = pdFcjaCelu[0] * points[i].x + pdFcjaCelu[1] * points[i].y;
        if (min > tmp) {
            min = tmp;
            result = {
                x: points[i].x,
                y: points[i].y,
                min: min,
            }
        }
    }
    return result;
}

function checkForConditions(minPoint) {
    let conditionResult = 0;
    let passCondition = [];
    let counter = 0;
    for (let i = 0; i < pdParams.length; i++) {
        conditionResult = minPoint.x * pdParams[i].y1 + minPoint.y * pdParams[i].y2;
        if (conditionResult === pdParams[i].y3) {
            passCondition.push({
                y1: pdParams[i].y1,
                y2: pdParams[i].y2,
                y3: pdFcjaCelu[counter++]
            });
        }
        else
            finalResult[`x${i + 1}`] = 0;
    }
    return passCondition;
}
function gauss(passCond) {
    var A = new Array(passCond.length);
    for (var i = 0; i < passCond.length; i++) {
        A[i] = new Array(passCond.length + 1);
    }
    for (let i = 0; i < passCond.length; i++) {
        for (let j = 0; j < passCond.length + 1; j++) {
            if (i < passCond.length && j < passCond.length + 1) {
                A[i][j] = passCond[i][`y${j + 1}`];
            } else {
                A[i][j] = 0;
            }
        }
    }
    var n = A.length;

    for (var i = 0; i < n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for (var k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k = i; k < n + 1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k = i + 1; k < n; k++) {
            var c = -A[k][i] / A[i][i];
            for (var j = i; j < n + 1; j++) {
                if (i == j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }
    // Solve equation Ax=b for an upper triangular matrix A
    var x = new Array(n);
    for (var i = n - 1; i > -1; i--) {
        x[i] = A[i][n] / A[i][i];
        for (var k = i - 1; k > -1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
}

function getfinalData() {
    minimum = findMinFunction(getPointsToCheck());
    let partRes = gauss(checkForConditions(minimum));
    let ctr = 0;
    for (let i = 0; i < pdParams.length; i++) {
        if (finalResult[`x${i + 1}`] !== 0) {
            finalResult[`x${i + 1}`] = partRes[ctr++];
        }
    }
}
function strArrToInt(){
    // aParams
    // bParams
    // limits
    for (let i = 0; i < aParams.length; i++) {
        aParams[i] = +aParams[i];        
    }
    for (let i = 0; i < bParams.length; i++) {
        bParams[i] = +bParams[i];        
    }
    for (let i = 0; i < limits.length; i++) {
        limits[i] = +limits[i];        
    }
    for (let i = 0; i < fcjaCelu.length; i++) {
        fcjaCelu[i] = +fcjaCelu[i];        
    }
}
function printToConsole() {
    console.log(`========================================================================`);
    console.log('Lista punktów ograniczających zbiór rozwiązań dopuszczalnych dla PD');
    let iter = 0;
    for (const iterator of pointsToCheck) {
        console.log(`${++iter}) (${iterator.x},${iterator.y})`);
    }
    console.log(`========================================================================`);
    console.log('Punkt V = (x1, x2, ... , xn) realizujący optimum PP');
    for (const key in finalResult) {
        const element = finalResult[key];
        console.log(`${key} = ${element}`);
    }
    console.log(`========================================================================`);
    console.log('Wartość maksymalną: F(V)');
    console.log(`F(V) = ${minimum.min}`);
    console.log(`========================================================================`);

}
function start() {
    setTimeout(`
    strArrToInt(),
    createPlot();
    findLinesIntersections();
    getfinalData();
    printToConsole();`, 
    1000);
    
}


// let inData = `
// <h3>Input:</h3><br>

//  ${aParams[0]}*x1 + ${aParams[1]}*x2 + ${aParams[2]}*x3 + ${aParams[3]}*x4 <= ${limits[0]} <br>
//  ${bParams[0]}*x1 + ${bParams[1]}*x2 + ${bParams[2]}*x3 + ${bParams[3]}*x4 <= ${limits[1]} <br>
//  F(x1,x2,..xn) = ${fcjaCelu[0]}*x1 + ${fcjaCelu[1]}*x1 + ${fcjaCelu[2]}*x1 + ${fcjaCelu[3]}*x4 -> max  <br>
//  `

// let outData = `
//     ${pointsToCheck}
// `
// var $inDataHtml = $( "#in-data" ),
//  html = $.parseHTML( inData );
//  $inDataHtml.append( html );






