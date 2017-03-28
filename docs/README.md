# QFiltr

QFilter is a simple a simple filter, limiter & queueing system that any function can call into in order to moderator or maintain a data stream.


## Installation

QFilter can be installed for Node.js or in javascript 

### NPM

npm install qfilter (coming soon)

### Javascript

See how to embed in javascript in /test/basic-test.html

## Basic Usage

qfiltr.COMMAND("id", {options}, callback(s))

### qfiltr.limit: 

Limit is a basic hard limit, where anything over X messages in Y seconds returns the fail callback, while anything that is under the limit returns the success callback.

- Options Object
  - limitCount:3
  - limitTime:1000

### qfiltr.queue: 

Queue is basic queueing function, feed messages in at any rate, and they are processed at the queue settings rate until the queue runs out.

- Options Object
  - queueTimer:1000

### TODO
- qfiltr.filter: pass filter regex / matching conditions along with message 

- qfilter.qlimit: combination of queue and limiting in one function 