let  arr = [1,2,3,4,5,6]
let sum = 0 ;

for(i=0;i<arr.length;i++){
    sum+= arr[i]
}
console.log(sum)

// find the greats 

let greater = arr[0]
for(i=0;i<arr.length;i++){
    if(greater<arr[i]){
        greater= arr[i]
    }
}
console.log(greater)