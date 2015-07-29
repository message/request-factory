"use strict";

var _ = require("lodash");
var promise = require("es6-promise");
var param = require("jquery-param");
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

	"delete": function() {
		return _fetch("DELETE", url, opts)
	}
};

requestFactory.fetch = typeof fetch !== "undefined" ? fetch.bind(window) : null;

function _fetch(method, url, opts, data) {
	var defaults = {};

	var opts = _.extend(defaults, opts, {
		method: method,
		credentials: "same-origin" // https://github.com/github/fetch#sending-cookies
	});

	var jsonType = "application/json";

	opts.headers = _.extend({}, opts.headers, {
		Accept: jsonType
	});

	if (data) {
		opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
		opts.body = param(data);
	}

	var originalResponse;
	return requestFactory.fetch(url, opts).then(function(response) {
		originalResponse = response;
		return response.text();
	}).then(function(responseData) {
		// Convert to JSON when content type is "application/json"
		var contentType = originalResponse.headers.get("Content-Type");
		if (contentType.indexOf(jsonType) != -1) {
			try {
				responseData = JSON.parse(responseData);
			} catch (e) {
				responseData = null;
			}
		}
		originalResponse.content = responseData;

		if (originalResponse.status >= 400) {
			var err = new Error(originalResponse.statusText);
			err.response = originalResponse;
			throw err;
		}

		return originalResponse;
	});
}

module.exports = requestFactory;