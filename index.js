"use strict";

var _ = require("lodash");
var promise = require("es6-promise");
var param = require("jquery-param");
var RequestChainSolver = require("./lib/RequestChainSolver");

require("whatwg-fetch");

promise.polyfill(); // Run promises polyfill

var requestFactory = {
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

	var opts = _.extend(defaults, opts, {
		method: method
	});

	var jsonType = "application/json";

	opts.headers = _.extend({}, opts.headers, {
		Accept: jsonType
	});

	if (data) {
		opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
		opts.body = param(data);
	}

	var debounce = 5; // 5ms debounce by default
	if (opts.debounce === null  || (opts.debounce && _.isNumber(opts.debounce) && !_.isNaN(opts.debounce))) {
		debounce = opts.debounce;
	}

	delete opts.debounce;

	return new RequestChainSolver(function() {
		var originalResponse;

		requestFactory.fetch(url, opts)
			.then(function(response) {
				originalResponse = response;
				return response.text();
			})
			.then(function(responseData) {
				if (originalResponse.headers.has("Content-Type")) {
					var contentType = originalResponse.headers.get("Content-Type") || "";
					// Convert to JSON when content type is "application/json"
					if (contentType.indexOf(jsonType) != -1) {
						try {
							responseData = JSON.parse(responseData);
						} catch (e) {
							responseData = null;
						}
					}
				}

				originalResponse.content = responseData;

				this.dispatch(originalResponse);
			}.bind(this))
			.catch(function() {
				this.dispatchFatal();
			}.bind(this))
	}, debounce);
}

module.exports = requestFactory;
