/**
 * 
    0.5*x1 + 0.4*x2 + 0.4*x3 + 0.2*x4 <= 2000
    0.4*x1 + 0.2*x2 + 0.5*x4 <= 2800
    F(x1,x2,x3,x4) = 10*x1 + 14*x2 + 8*x3 + 11*x4 -> max
 * зробити то так щоб можна було вчитати ті дані з джейсона
 * або ше звідкісь
 * 
 */


// PD - program dualny
let aParams = [1, 2, 1.5, 6];
let bParams = [2, 2, 1.5, 4];
let limits = [90000, 120000];
let fcjaCelu = [4, 6, 3, 12];
let pdParams = [];
let pdFcjaCelu = [];
let pdTraces = [];
let traces = [];
let pdLinesCoords = [];
let pdIntersectionPoints = [];
var layout = {
    xaxis: {
        range: [0, 8.5]
    },
    yaxis: {
        range: [0, 6.5]
    },
    title: 'Rozwiazanie PD'
};

// PL - program liniowy 
function findXnY(a, b, res) {
    let y1, y2;
    if (a !== 0) {
        y1 = res / a;
    } else y1 = 0;
    if (b !== 0) {
        y2 = res / b;
    } else y2 = 0;

    return {
        y1,
        y2
    }
}

function PPtoPD() {
    console.log("Problem Dualny")
    for (let i = 0; i < aParams.length, i < bParams.length; i++) {
        pdParams[i] = {
            y1: aParams[i],
            y2: bParams[i],
            res: fcjaCelu[i],
        }
        pdFcjaCelu[i] = limits[i];
        console.log(
            `${i + 1}) ${aParams[i]}*y1 + ${bParams[i]}*y2 >= ${fcjaCelu[i]}`
        );
    }
    console.log(
        `
         G(y1,y2) = ${limits[0]}*y1 + ${limits[1]}*y2 -> min`
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

        newParams = findXnY(pdParams[i].y1, pdParams[i].y2, pdParams[i].res);
        pdLinesCoords[i] = {
            startX: 0,
            startY: newParams.y2,
            endX: newParams.y1,
            endY: 0,
        }
        traces[i] = {
            x: [0, newParams.y1],
            y: [newParams.y2, 0],
            name: `${i + 1}) ${pdParams[i].y1}*y1 + ${pdParams[i].y2}*y2 >= ${pdParams[i].res}`,
            mode: 'lines'
        }
    }
    // Plotly.newPlot('myDiv', traces, layout);
}

function findLinesIntersections() {
    let tmp, counter = 0;
    for (let i = 0; i < pdLinesCoords.length; i++) {
        for (let j = i + 1; j < pdLinesCoords.length; j++) {
            tmp = checkLineIntersection(
                pdLinesCoords[i].startX,
                pdLinesCoords[i].startY,
                pdLinesCoords[i].endX,
                pdLinesCoords[i].endY,
                pdLinesCoords[j].startX,
                pdLinesCoords[j].startY,
                pdLinesCoords[j].endX,
                pdLinesCoords[j].endY
            );
            
            if (tmp.x !== null || tmp.y !== null) {
                pdIntersectionPoints[counter] = tmp;
                counter++;
            }
        }
    }
}
function isOnLine(point,line){
    // pdParams;
    return line.res === (point.x*line.y1 + point.y*line.y2);
}

function topPoint(point) {
    let baseDist = 0;
    let countDist = 0;
    let midX,midY;    
    for (let i = 0; i < pdParams.length; i++) {
        // baseDist=getDistance()
        if(!isOnLine(point,pdParams[i])){
            // провіряємо чи її відстань до інших прямих 
            // в сторону нуля чи в сторону від нуля
            // якщо в сторону нуля то не беремо її
            // якщо знайшли ту шо треба то ретурн тру
            // НА ДАНОМУ ЕТАПІ в нас є точка яку треба провірити
            // і пряма на якій вона не лежить
            // дивимось де вона відносно точки
            
            baseDist = getDistance(0,0,point.x,point.y);
            midX = (pdLinesCoords[i].startX + pdLinesCoords[i].endX) / 2;
            midY = (pdLinesCoords[i].startY + pdLinesCoords[i].endY) / 2;
            countedDist = getDistance(0,0,midX,midY);
            console.log('point,pdParams[i],i,countedDist,baseDist : ',point,pdParams[i],i,countedDist,baseDist);
            if (countedDist > baseDist) return false;
        }
    }
    return true;
}

function getDistance(startX,startY,endX,endY){
    let dist = 0;
    dist = Math.sqrt(Math.pow(endX-startX,2) + Math.pow(endY-startY,2));
    return dist;
}
// console.log('distance', getDistance(0,0,1,1.5));



function getPointsToCheck() {
    // pdIntersectionPoints[]
    let pointsToCheck = [];
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
// ////////////////////////////////////////////////////////////
    for (let j = 0; j < pdIntersectionPoints.length; j++) {
        if (pdIntersectionPoints[j].onLine1 === true && pdIntersectionPoints[j].onLine2 === true) {
            if(topPoint(pdIntersectionPoints[j])){
                pointsToCheck[++counter] = {
                    x: pdIntersectionPoints[j].x,
                    y: pdIntersectionPoints[j].y,
                }
            }
        }
    }
// ////////////////////////////////////////////////////////////
    

    let traceLen = traces.length;
    for (let k = 0; k < pointsToCheck.length; k++) {
        traces[traceLen+k] = {
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

console.log(`
 entered data:
 
 ${aParams[0]}*x1 + ${aParams[1]}*x2 + ${aParams[2]}*x3 + ${aParams[3]}*x4 <= ${limits[0]} 
 ${bParams[0]}*x1 + ${bParams[1]}*x2 + ${bParams[2]}*x3 + ${bParams[3]}*x4 <= ${limits[1]} 
 
 F(x1,x2,..xn) = ${fcjaCelu[0]}*x1 + ${fcjaCelu[1]}*x1 + ${fcjaCelu[2]}*x1 + ${fcjaCelu[3]}*x4 -> max  
 `)
let l1 = findXnY(1, 2, 4);
createPlot();
findLinesIntersections();
console.log('pdParams',pdParams);
console.log('pdLinesCoords',pdLinesCoords);
console.log('pdIntersectionPoints',pdIntersectionPoints);
console.log('points to check: ',getPointsToCheck());




