"use strict";

var _ = require("lodash");
var promise = require("es6-promise");
var param = require("jquery-param");
var RequestChainSolver = require("./lib/RequestChainSolver");

require("whatwg-fetch");

promise.polyfill(); // Run promises polyfill

var requestFactory = {
	DEBOUNCE_TIME: 5,
	"get": function(url, opts) {
		return _fetch("GET", url, opts)
	},

	post: function(url, data, opts) {
		return _fetch("POST", url, opts, data)
	},

	put: function(url, data, opts) {
		return _fetch("PUT", url, opts, data)
	},

	patch: function(url, data, opts) {
		return _fetch("PATCH", url, opts, data)
	},

	"delete": function(url, opts) {
		return _fetch("DELETE", url, opts)
	}
};

requestFactory.fetch = typeof fetch !== "undefined" ? fetch.bind(window) : null;

function _fetch(method, url, opts, data) {
	var defaults = {
		credentials: "same-origin" // https://github.com/github/fetch#sending-cookies
	};

	var options = _.extend(defaults, opts, {
		method: method
	});

	var jsonType = "application/json";

	options.headers = _.extend({}, options.headers, {
		Accept: jsonType
	});

	if (data) {
		options.headers["Content-Type"] = "application/x-www-form-urlencoded";
		options.body = param(data);
	}

	var debounce = requestFactory.DEBOUNCE_TIME; // 5ms debounce by default
	if (options.debounce === null || (options.debounce && _.isNumber(options.debounce) && !_.isNaN(options.debounce))) {
		debounce = options.debounce;
	}

	delete options.debounce;

	return new RequestChainSolver(function() {
		var originalResponse;

		requestFactory.fetch(url, options)
			.then(function(response) {
				if (typeof(response) === "undefined") {
					throw new Error("Something went wrong");
				}
				originalResponse = response;
				return response.text();
			})
			.then(function(responseData) {
				var contentType = originalResponse.headers.get("Content-Type") || "";
				// Convert to JSON when content type is "application/json"
				if (contentType.indexOf(jsonType) != -1) {
					try {
						responseData = JSON.parse(responseData);
					} catch (e) {
						responseData = null;
					}
				}

				originalResponse.content = responseData;

				try {
					this.dispatch(originalResponse);
				} catch (e) {
					if (typeof console === 'object') {
						if (console.error) {
							console.error("Exception is thrown while running request callbacks. Dispatching fatal request callbacks.", e);
						}
					}

					throw e;
				}
			}.bind(this))
			.catch(function() {
				this.dispatchFatal();
			}.bind(this))
	}, debounce);
}

module.exports = requestFactory;
