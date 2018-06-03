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
 let aParams = [1,2,1.5,6];
 let bParams = [2,2,1.5,4];
 let limits = [90000, 120000];
 let fcjaCelu = [4,6,3,12];
 let pdParams = [];
 let pdFcjaCelu = [];
 let pdTraces = [];
 
 // PL - program liniowy 
 function findXnY (a,b,res){
     let y1,y2;
     if (a !== 0){
         y1 = res / a; 
     }else y1 = 0;
     if (b !== 0){
         y2 = res / b;
     }else y2 = 0;
     
     return {
         y1,
         y2
     }
 }
 
 function PPtoPD(){
     console.log("Problem Dualny")
     for (let i = 0; i < aParams.length, i < bParams.length; i++) {
         pdParams[i] = {
             y1 : aParams[i],
             y2 : bParams[i],
             res : fcjaCelu[i],
         }
         pdFcjaCelu[i] = limits[i];
         console.log(
             `${i+1}) ${aParams[i]}*y1 + ${bParams[i]}*y2 >= ${fcjaCelu[i]}`
         );
     }
     console.log(
         `
         G(y1,y2) = ${limits[0]}*y1 + ${limits[1]}*y2 -> min`
     );
 }
 
//  function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4){
//      var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
//      if (denom == 0) {
//          return null;
//      }
//      ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
//      ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
//      return {
//          x: x1 + ua * (x2 - x1),
//          y: y1 + ub * (y2 - y1),
//          seg1: ua >= 0 && ua <= 1,
//          seg2: ub >= 0 && ub <= 1
//      };
//  }

  function createPlot(){
    // var trace3 = {
    //     x: [1, 2, 3, 4],
    //     y: [12, 9, 15, 12],
    //     mode: 'lines+markers'
    //   };
    let traces = []; 
    let newParams;
    var layout = {};
    for (let i = 0; i < aParams.length; i++) {
        
        newParams = findXnY(pdParams[i].y1,pdParams[i].y2,pdParams[i].res);
        traces[i] = {
            x : [0, newParams.y1],
            y : [newParams.y2, 0],
            mode : 'lines+markers'
        }
        console.log(traces[i]);
    }
  
    Plotly.newPlot('myDiv', traces, layout);
    
  }



 /**
  * 
  * 
  * 
  *   
  var trace3 = {
    x: [1, 2, 3, 4],
    y: [12, 9, 15, 12],
    mode: 'lines+markers'
  };
  
  var data = [ trace3 ];
  
  var layout = {};
  
  Plotly.newPlot('myDiv', data, layout);
  */
 
 console.log(`
 entered data:
 
 ${aParams[0]}*x1 + ${aParams[1]}*x2 + ${aParams[2]}*x3 + ${aParams[3]}*x4 <= ${limits[0]} 
 ${bParams[0]}*x1 + ${bParams[1]}*x2 + ${bParams[2]}*x3 + ${bParams[3]}*x4 <= ${limits[1]} 
 
 F(x1,x2,..xn) = ${fcjaCelu[0]}*x1 + ${fcjaCelu[1]}*x1 + ${fcjaCelu[2]}*x1 + ${fcjaCelu[3]}*x4 -> max  
 `)
 let l1 = findXnY(1,2,4);
 // let l2 = findXnY(7,0,0.3);
 PPtoPD(aParams,bParams,limits,fcjaCelu);
 createPlot();
 console.log(pdParams)
 // console.log(line_intersect(l1.y1,0,0,l1.y2,l2.y1,0,0,l2.y2));
 
 