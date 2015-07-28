# request-factory

Will use jquery param for building 
```javascript
// POST /users
fetchival('/users').post({
  name: 'Typicode',
  login: 'typicode'
})
.then(function(json) {
  // ...
})
```

`.get()`, `.put()`, `.patch()` and `.delete()` methods are also available.

## Installation

```bash
npm install request-factory
```

## Usage examples

```javascript
var requestFactory = require('request-factory')
var posts = requestFactory('/posts')

//posts
posts.get()
posts.post({ title: 'Hello world' })

//posts?category=javascript
posts.get({ category: 'javascript' })

//posts/1
posts(1).get()
posts(1).put({ title: 'Fetchival is simple' })
posts(1).patch({ title: 'Fetchival is simple' })
posts(1).delete()

var comments = posts('1/comments')

//posts/1/comments
comments.get()

//posts/1/comments/1
comments(1).get()
```