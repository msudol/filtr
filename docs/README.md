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

```js
var qfiltr = require("qfiltr");
var qFiltr = new qfiltr();

qFiltr.COMMAND("id", {options}, callback(s))
```


### qfiltr.limit: 

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


### qfiltr.queue: 

Queue is basic queueing function, feed messages in at any rate, and they are processed at the queue settings rate until the queue runs out.

- Options Object:
  - queueTimer:1000
  - queueMax:-1 (no limit)
  
- Callbacks:
  - OnQueue (Success)
  - Queue Ended

Example: Queue incoming messages or commands to be run every 2000ms until they are all run

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


### TODO

- qfiltr.filter: pass filter regex / matching conditions along with message 

- qfiltr.qlimit: combination of queue and limiting in one function 