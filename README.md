# request-factory

```js
var request = require("request-factory");
request.get(APIConstants.ADMINISTRATORS_READ_ROUTE)
.success(function(response) {
	// handle succeess
})
.error(function(response) {
	// handle error
})
.fatal(function(){
	// handle fatals
});
```

## API
###request.get(url, opts)
###request.post(url, data, opts)
###request.put(url, data, opts)
###request.patch(url, data, opts)
###request.delete(url, opts)


Every method returns chainable object which contains following methods:

`success` - 200-399 requests

`error` - 400+ requests

`fatal` - exception errors

`call` - Launches request if there is no `success`, `error`, `fatal` callbacks
