"use strict";

var promise = require("es6-promise");
var param = require("jquery-param");
var fetch = require("whatwg-fetch");

promise.polyfill(); // Run promises polyfill

function requestFactory(url, opts) {
	opts = opts || {};

	var _ = function(u, o) {
		// Extend parameters with previous ones
		u = url + '/' + u;
		o = o || {};
		defaults(o, opts);
		return requestFactory(u, o)
	};

	_.get = function(queryParams) {
		return _fetch('GET', url, opts, null, queryParams)
	};

	_.post = function(data) {
		return _fetch('POST', url, opts, data)
	};

	_.put = function(data) {
		return _fetch('PUT', url, opts, data)
	};

	_.patch = function(data) {
		return _fetch('PATCH', url, opts, data)
	};

	_.delete = function() {
		return _fetch('DELETE', url, opts)
	};

	return _;
}

// Binding fetch agent
requestFactory.fetch = fetch;

function defaults(target, obj) {
	for (var prop in obj) target[prop] = target[prop] || obj[prop]
}

function getQuery(queryParams) {
	var arr = Object.keys(queryParams).map(function(k) {
		return [k, encodeURIComponent(queryParams[k])].join('=')
	});
	return '?' + arr.join('&')
}

function _fetch(method, url, opts, data, queryParams) {
	opts.method = method;
	opts.credentials = 'same-origin'; // https://github.com/github/fetch#sending-cookies
	opts.headers = opts.headers || {};
	opts.responseAs = (opts.responseAs && ['json', 'text'].indexOf(opts.responseAs) >= 0) ? opts.responseAs : 'json';

	defaults(opts.headers, {
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded'
	});

	if (queryParams) {
		url += getQuery(queryParams)
	}

	if (data) {
		opts.body = param(data);
	}

	return requestFactory.fetch(url, opts);
}

module.exports = requestFactory;
