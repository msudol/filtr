# QFiltr

QFiltr is a powerful but simple filter, limiter & queueing system that can be used to moderate or maintain a data stream.

Some use cases:
- Use within an API in order to rate limit incoming requests.
- Use with UI interactions, like a button that can be rapidly pressed, to run a function via queue or rate limit.


## Installation

QFiltr can be installed for use in a Node.js application via NPM, or for use in a basic javascript application or website by getting the standalone qfiltr.js from the GitHub Repository. 


### NPM

```bash
npm install qfiltr
```


### Javascript

Get the standalone version from https://github.com/msudol/qfiltr

- Standalone version is in /tests/qfiltr.js
- See how to embed in javascript in /tests/basic-test.html


## Basic Usage

Require the qfilter module and create a new instance of qfiltr.  

```js
var qfiltr = require("qfiltr");
var qFiltr = new qfiltr();  

qFiltr.COMMAND("id", {options}, callback(s))
```


### Functions

#### qfiltr.limit("id", {limitCount:3, limitTime:1000}, success, fail)

Limit is a basic hard limit, where anything over X messages in Y seconds returns the fail callback, while anything that is under the limit returns the success callback.

- Options Object:
  - limitCount:3
  - limitTime:1000
- Callbacks:
  - Allow (Success)
  - Block (Fail)
  
Example: No more than 5 messages or commands in 500ms.

```js
qFiltr.limit("limitExample", {limitCount:5, limitTime:500}, function() {
    console.log("Allowed message");
}, function() { 
    console.log("Blocked message");
});
```


#### qfiltr.queue: 

Queue is basic queueing function, feed messages in at any rate, and they are processed at the queue settings rate until the queue runs out.

- Options Object:
  - queueTimer:1000
  - queueMax:-1 (no limit) 
- Callbacks:
  - OnQueue (Success)
  - Queue Ended
  - Maxed (Queue is full)

Example: Queue incoming messages or commands to be run every 2000ms until they are all run

Try it in RunKit: https://runkit.com/58df2419e24d040013543787/58dfe5bb2830330014a72486

```js
var qfiltr = require("qfiltr");
qFiltr = new qfiltr();

// call a bunch of messages really fast
for (var i = 0; i < 10; i++) {
    sendMessage("This is message " + i);
}

function sendMessage(message) {
    // add message to qFilter.queue with callback functions
    qFiltr.queue("msgQ", {queueTimer:2000}, function() {
        console.log(message);
    }, function() {
        console.log("Queue complete");
    });  
}
```


#### qfiltr.qlimit: 

QLimit is combo function combining rate limite and queueing function, feed messages in at any rate until they exceed the rate limit, and then they are processed at the queue settings rate until the queue runs out.

- Options Object:
  - limitCount:3
  - limitTime:1000
  - queueTimer:1000
  - queueMax:-1 (no limit) 
- Callbacks:
  - Allow (Success)
  - LimitReached (Queue Starting)
  - Queue Ended
  - Maxed (Queue is full)

Example: Send 100 messages at random intervals, rate limit if it goes to fast and put into queue mode

```js
var qfiltr = require("qfiltr")
qFiltr = new qfiltr();

var sendStop = 0
var overRate = false;
var testAdjuster = 0;
 
// send messages at random intervals
function sender(t) { 
    if (sendStop > 100) return;
    sendStop++;
    
    if (overRate) { testAdjuster = 20 }
    else { testAdjuster = 0}
    
    setTimeout(function() {
        // generate new t
        var i = Math.floor(Math.exp(Math.random()*Math.log(51 + testAdjuster)));
        sendMessage("Message #" + sendStop + " sent at " + i*10 + "ms");
        // run again
        sender(i*10);
    }, t);
}
 
function sendMessage(message) {
    // add message to qFilter.queue with callback functions 
    qFiltr.qlimit("msgQ", {limitCount:10, limitTime:1000, queueTimer:100}, function() {
        console.log(message);
    }, function() {
        overRate = true;
        console.log("Rate limit exceded, queuing data");
    }, function() {
        overRate = false;
        console.log("Queue cleared resuming normal operation");        
    });  
}

sender(1000);
```


### Objects

The ID that you set in a filter function writes an entry into a "datastore", so that you can have multiple filters running with different settings.

This ID will also allow you check if the current ID's queue is running or not.


#### Accessing the datastore

```js
var idStore = qFilter.dataSTore[ID];
console.log("Items current in queue:" + idStore.length);
```


#### Get Queue State
```js
var isQRunning = qFilter.qRunning[ID];
```



### TODO

- qfiltr.filter: pass filter regex / matching conditions along with message 
