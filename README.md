# QFiltr

QFilter is a simple a simple filter, limiter & queueing system that any function can call into in order to moderator or maintain a data stream.


## Installation

QFilter can be installed for Node.js or in javascript 

### NPM

npm install qfilter (coming soon)

### Javascript

See how to embed in javascript in /test/basic-test.html

## Basic Usage

qfiltr. limit||queue||filter  (id, opts, callback(s))

* qfiltr.limit: basic hard limit, anything over x messages in y seconds returns the fail callback
** opts object defaults
*** limitCount:3
*** limitTime:1000

* qfiltr.queue: basic queueing function, feed messages in at any rate, and they are processed at the queue settings
** opts object defaults
*** queueTimer:1000

* qfiltr.filter: TODO - pass filter regex / matching conditions along with message 

* qfilter.qlimit: TODO - combination of queue and limiting in one function