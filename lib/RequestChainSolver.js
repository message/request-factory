"use strict";

var _ = require("lodash");
var BreakChainException = require("./BreakChainException");
var error = console.error || function() {};

var RequestChainSolver = function(callback, debounceTime) {
	this.successCallbacks = [];
	this.errorCallbacks = [];
	this.fatalCallbacks = [];
	this.requestStarted = false;

	callback = callback.bind(this);

	var requestHandler = function() {
		if (this.requestStarted) {
			error("Request is already started");
			return;
		}

		this.requestStart = true;

		callback();
	}.bind(this);

	if (_.isNumber(debounceTime) && !_.isNaN(debounceTime)) {
		requestHandler = _.debounce(requestHandler, debounceTime)
	}

	this.request = requestHandler;
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
		if (!(e instanceof BreakChainException)) {
			throw e;
		}
	}
};

module.exports = RequestChainSolver;
