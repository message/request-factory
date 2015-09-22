"use strict";

function BreakChainException(message) {
	this.message = message;
	// Use V8's native method if available, otherwise fallback
	if ("captureStackTrace" in Error) {
		Error.captureStackTrace(this, BreakChainException);
	} else {
		this.stack = (new Error()).stack;
	}
}

BreakChainException.prototype = Object.create(Error.prototype);
BreakChainException.prototype.name = "BreakChainException";
BreakChainException.prototype.constructor = BreakChainException;

module.exports = BreakChainException;
