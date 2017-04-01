/**
 * QFiltr - A simple, yet powerful filter, limit, and queue system in javascript
 * @license Apache-2.0
 *
 *  https://github.com/msudol/qfiltr 
 */

// create constructor
var qfiltr = function() {
    this.config = {
        limitCount: 3,
        limitTime: 1000, 
        queueTimer: 1000,
        queueMax: -1
    };
    this.dataStore = {};
    this.lastQueue = {};
    this.qRunning = {}; 
};

// simple function to add an item to a dataStore object where id = obj.key and opts = json options
qfiltr.prototype.addStore = function(id, opts) {
    (this.dataStore[id] = this.dataStore[id] || []).push(opts); 
};

// basic filter function, takes an id, opts, and callbacks for success and fail
qfiltr.prototype.limit = function(id, opts, success, fail) {
    
    //TODO: err check user inputs
    
    opts = opts || {};
    opts.limitCount = opts.limitCount || this.config.limitCount;
    opts.limitTime = opts.limitTime || this.config.limitTime;
    
    var now = Date.now();

    this.addStore(id, {ts:now});
    
    for (var i = this.dataStore[id].length - 1; i >=0; i--) {
        if ((this.dataStore[id][i].ts + opts.limitTime) < now) {
            this.dataStore[id].splice(i, 1);
        }
    }
    
    if (this.dataStore[id].length > opts.limitCount) {
        return fail();
    }
    else {
        return success();
    }
            
};

// basic queue function, takes id, opts, function callback and queue ended callback
qfiltr.prototype.queue = function(id, opts, callback, end, maxed) {

    //TODO: err check user inputs
    
    this.qRunning[id] = this.qRunning[id] || false;

    opts = opts || {};
    opts.queueTimer = opts.queueTimer || this.config.queueTimer;
    opts.queueMax  = opts.queueMax || this.config.queueMax;
    
    var now = Date.now();
    
    // is the store for this ID at max? 
    if ((this.dataStore[id] !== undefined) && (opts.queueMax > -1) && (this.dataStore[id].length >= opts.queueMax)) {
        // if a queueMax was reached run callback if it is defined
        typeof maxed === 'function' && maxed();
    }    
    else {
        // add message to the queue
        this.addStore(id, {ts:now, opts:opts, action:callback, stop:end});
    }
    
    // check the queue now to see if we need to kick start it
    if (!(this.qRunning[id])) {
        this.runQueue(id, true);
    }

};

// function run by queue to actually execute the queue
qfiltr.prototype.runQueue = function(id, init) {

    var self = this;
    
    // if anything is in dataStore, run the queue
    if (this.dataStore[id].length > 0) {
        
        this.qRunning[id] = true;
        this.timer = self.dataStore[id][0].opts.queueTimer;
        // no need to wait for the queueTimer if the queue is initializing
        if (init) {
            // run the first item in the array
            self.dataStore[id][0].action();
            self.lastQueue[id] = self.dataStore[id][0];
            // shift it out
            self.dataStore[id].shift();
            setTimeout(function() { 
                // run this function again 
                self.runQueue(id, false);
            }, self.timer);                       
        }        
        else {
            setTimeout(function() { 
                // run the first item in the array
                self.dataStore[id][0].action();
                self.lastQueue[id] = self.dataStore[id][0];
                // shift it out
                self.dataStore[id].shift();
                // run this function again 
                self.runQueue(id, false);
            }, self.timer);
        }
    }
    else {
        this.qRunning[id] = false; 
        this.lastQueue[id].stop();
    }
 
};

module.exports = qfiltr;