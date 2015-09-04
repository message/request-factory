"use strict";

var _ = require("lodash");
var error = console.error || function() {
	};

var RequestChainSolver = function(callback) {
	this.successCallbacks = [];
	this.errorCallbacks = [];
	this.fatalCallbacks = [];
	this.requestStarted = false;

	callback = callback.bind(this);

	this.request = _.debounce(function() {
		if (this.requestStarted) {
			error("Request is already started");
			return;
		}

		this.requestStart = true;

		callback();
	}.bind(this), 10);
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

module.exports = RequestChainSolver;