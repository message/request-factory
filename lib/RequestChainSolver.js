var RequestChainSolver = function(callback) {
    this.successCallbacks = [];
    this.errorCallbacks = [];
    this.fatalCallbacks = [];
    this.requestStarted = false;

    callback = callback.bind(this);

    this.request = _.debounce(function() {
        if (this.requestStarted) {
            console.error("Request is already started");
            return;
        }

        this.requestStart = true;

        callback();
    }.bind(this), 20);
};

RequestChainSolver.prototype.success = function(callback) {
    this.successCallbacks.push(callback);
    this.request();

    return this;
};

RequestChainSolver.prototype.error = function(callback) {
    this.errorCallbacks.push(callback);
    this.request();
    return this;
};

RequestChainSolver.prototype.fatal = function(callback) {
    this.fatalCallbacks.push(callback);
    this.request();
    return this;
};

RequestChainSolver.prototype.call = function() {
    this.request();
};

RequestChainSolver.prototype.dispatch = function(response) {
    console.log("Dispatching", response);

    var callbacks = this.successCallbacks;
    if (response.status >= 400) {
        callbacks = this.errorCallbacks;
    }

    this.iterateCallbacks(callbacks, response);
};

RequestChainSolver.prototype.dispatchFatal = function() {
    this.iterateCallbacks(this.fatalCallbacks);
};

RequestChainSolver.prototype.iterateCallbacks = function(callbacks, response) {
    try {
        callbacks.forEach(function(callback) {
            callback(response);
        });
    } catch (e) {
        // If somebody threw an error, he might want to break callback chain
    }
};
