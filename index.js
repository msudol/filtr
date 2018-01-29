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

// stub out the filter function, after all this is supposed to be qfiltr 
qfiltr.prototype.filter = function(id, opts, success, fail) {
    
    //TODO: write this function, what will it do exactly?  
    //possibly limit things matching a certain regex filter that can be passed as an argument?
};

/** @function
 * @name limit
 * @desciption A basic limit function, takes an id, opts, and callbacks for success and fail
 * @param {string} id - Unique ID for this function thread.
 * @param {Object} opts - Configure options other than default.
 * @param {integer} [opts.limitCount=3] - Max count of calls within the limitTime (default: 3).
 * @param {integer} [opts.limitTime=1000] - Time in ms (default: 1000).
 * @param {Function} success - Callback function for success.
 * @param {Function} fail - Callback function for when the limit is reached.
*/ 
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

/** @function
 * @name queue 
 * @desciption A basic queue function that takes: id, opts, function callback and queue ended callback
 * @param {string} id - Unique ID for this function thread.
 * @param {Object} opts - Configure options other than default.
 * @param {integer} [opts.queueTimer=1000] - Time in ms (default: 1000).
 * @param {integer} [opts.queueMax=-1] - Max items allowed in queue (default: -1).
 * @param {Function} success - Callback function for success.
 * @param {Function} end - Callback function for when the queue ends.
 * @param {Function} maxed - Callback function for if/when the queue gets maxed.
*/
qfiltr.prototype.queue = function(id, opts, success, end, maxed) {

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
        this.addStore(id, {ts:now, opts:opts, action:success, stop:end});
    }
    
    // check the queue now to see if we need to kick start it
    if (!(this.qRunning[id])) {
        this.runQueue(id, true);
    }

};


// combo limit, then queue function, takes an id, opts, and callbacks for success, fail, end and maxed
qfiltr.prototype.qlimit = function(id, opts, success, fail, end, maxed) {
       
    this.qRunning[id] = this.qRunning[id] || false;
       
    opts = opts || {};
    opts.limitCount = opts.limitCount || this.config.limitCount;
    opts.limitTime = opts.limitTime || this.config.limitTime;
    opts.queueTimer = opts.queueTimer || this.config.queueTimer;
    opts.queueMax  = opts.queueMax || this.config.queueMax;    
    
    var now = Date.now();

    // is the store for this ID at max? 
    if ((this.dataStore[id] !== undefined) && (opts.queueMax > -1) && (this.dataStore[id].length >= opts.queueMax)) {
        // if a queueMax was reached run callback if it is defined
        typeof maxed === 'function' && maxed();
    }    
    else {
        this.addStore(id, {ts:now, opts:opts, action:success, stop:end});
    }
    
    // need to check if this function has gone into queue mode or not here
    if (!(this.qRunning[id])) {
    
        // this is the limiter check
        for (var i = this.dataStore[id].length - 1; i >=0; i--) {
            if ((this.dataStore[id][i].ts + opts.limitTime) < now) {
                this.dataStore[id].splice(i, 1);
            }
        }
        
        // Limit fail - time to start queueing
        if (this.dataStore[id].length > opts.limitCount) {
           
            typeof fail === 'function' && fail();

            // need to clear the queue so the X messages leading up to the Q so
            this.dataStore[id].splice(0, this.dataStore[id].length - 1);
            this.lastQueue[id] = this.dataStore[id][0];
            this.runQueue(id, true); 
            
        }
        // Within limits and the queue is not running.. yay!
        else {
            return success();
        }  
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
            self.lastQueue[id] = self.dataStore[id][0] || self.lastQueue[id];
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
                self.lastQueue[id] = self.dataStore[id][0] || self.lastQueue[id];
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