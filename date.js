exports.getDate = function (){
let currentDate = new Date();
options = {
    weekday:"long",
    day:"numeric",
    month:"long",
}
return currentDate.toLocaleDateString("en-US",options)
}