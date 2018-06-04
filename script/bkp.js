
var A = Create2DArray(3);
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i < passCond.length ) {
            
            A[i][j] = passCond[i][`y${j+1}`];
            // console.log(`A[${i}][${j}]`,A[i][j]);
        } else {
            A[i][j] = 0;
        }
    }
}
for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[i].length; j++) {
        console.log(`A[${i}][${j}]`,A[i][j]);
    }
}