Working on a javascript function and perhaps a node module that will create a simple
filter, limiter & queueing system that any function can call into.

Basic usage will be:  filtr. limit||queue||filter  (id, opts, callback(s))

filtr.limit: basic hard limit, anything over x messages in y seconds returns the fail callback

filtr.queue: basic queueing function, feed messages in at any rate, and they are processed at the queue settings

filtr.filter: to-do, pass filter regex / matching conditions along with message 
