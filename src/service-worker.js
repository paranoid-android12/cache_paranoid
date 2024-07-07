importScripts('./ngsw-worker.js');

self.addEventListener('sync', (event) => {
    if(event.tag === 'post-data') {
        //call method
        event.waitUntil(console.log("yea posting or something idk"));
    }
})


// function addData(){
// }
// //Creates a new record on IndexedDB
// function addNewRequest(body: string, request: string) {
//     db.requestLists.add({
//     body: body,
//     requestType: request
// })
// }