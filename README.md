# API Tap

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/v/apitap.svg)](https://npmjs.com/package/apitap)

This tiny library (0.6kb minified & gzipped) tacks custom extensions on existing JavaScript functions and objects. That makes it incredibly easy to supplement existing JavaScript libraries with custom methods without changing the original vendor code.

It works by wrapping the target in a [Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy). The Proxy sticks to the tapped library by attaching itself to properties or method calls you access on it.

This package works in Node.js and in the browser. Note however that the browser *must* support ES2015 Proxies (which are not polyfillable) which leaves out IE11 in particular.

---

* [Installation](#installation)
  * [Include in the browser](#include-in-the-browser)
  * [Include in Node.js](#include-in-nodejs)
* [Usage](#usage)
  * [Dynamic Injections](#dynamic-injections)
  * [Naming Conflicts](#naming-conflicts)
  * [Inject Getters](#inject-getters)
  * [Unwrapping](#unwrapping)
  * [Checking If Object Is Wrapped](#checking-if-object-is-wrapped)
  * [Debugging](#debugging)

---

## Installation
Install it from npm:

```bash
npm install --save apitap
```

### Include in the browser
You can use this package in your browser with one of the following snippets:

* The most common version. Introduces a global `apitap` variable, runs in all modern browsers:

  ```html
  <script src="node_modules/apitap/dist/browser.min.js"></script>

  <!-- or from CDN: -->

  <script src="https://unpkg.com/apitap"></script>
  ```

* If you're really living on the bleeding edge and use ES modules directly in the browser, you can `import` the package as well:

  ```javascript
  import * as apitap from "./node_modules/apitap/dist/browser.esm.min.js"

  // or from CDN:

  import * as apitap from "https://unpkg.com/apitap/dist/browser.esm.min.js"
  ```

  As opposed to the first snippet, this will not create a global `apitap` function.


### Include in Node.js
Include this package in Node.js like you usually do:

```javascript
const apitap = require('apitap')
```

If you use `--experimental-modules`, there's a `.mjs` version, too:

```javascript
import * as apitap from 'apitap/dist/node.esm'
```


## Usage
Now that we have grabbed the `apitap` object, we can start injecting custom properties and methods into a library.

Since most of us probably know jQuery, let's take that as an example.

Remember older jQuery versions? They had a `.size()` method that was removed in favor of the `.length` property.

Now let's re-implement that method:

```javascript
const $ = apitap.wrap(window.jQuery, {
  size () {
    return this.length
  }
})

$('div').size() // Returns some number
```

There are two things to notice here:
1. The `this` context points to the object the method it is called on – in our case that's the `$('div')` collection which holds the DOM elements.
2. The `.size()` method is available although we're not calling it on the `$` object itself – the proxy reproduces itself and sticks to each property you access or method you call.

### Dynamic Injections
The second point is a feature, but in our example it can be quite unhandy: In most cases, we want to inject our custom properties only under certain circumstances.

In the example above, the `size()` method is not only available on the `$('div')`, but also on the `$` itself. However, `$` is not a jQuery collection and thus `$.size()` would return `undefined`.

That's why we only want to provide the `size()` method on a jQuery collection. For that purpose, we can inject a function instead of an object. The function decides on a case-by-case basis which properties to provide:

```javascript
const $ = apitap.wrap(window.jQuery, target => {
  // Only add the `size()` method on a jQuery collection
  if (target instanceof jQuery) {
    return {
      size () {
        return this.length
      }
    }
  }

  // If we don't return anything, no custom properties are added
})

$('div').size() // Still returns some number
$.size() // TypeError: $.size is not a function
```

### Naming Conflicts
Injected custom properties will shadow existing ones. In other words, custom properties will always take precedence over builtin properties.

### Inject Getters
You may provide getters in an injection object:
```javascript
apitap.wrap(api, {
  get prop () {
    return // ...
  }
})
```

### Unwrapping
You can unwrap a tapped object with the `unwrap()` method:

```javascript
apitap.unwrap($) // Returns the vanilla jQuery object
```

Note that both the `wrap()` and the `unwrap()` methods are idempotent. That means you can't wrap/unwrap an object more than once. Wrapping an already wrapped object will do nothing, just like unwrapping a non-wrapped object won't do anything.

### Checking If Object Is Wrapped
You can check if an object is wrapped via this library by running `apitap.isWrapped(object)`.

### Debugging
The Node.js version of apitap uses the [debug](https://npmjs.com/package/debug) utility to print logs.

The browser build uses just a simple `console.log()`. It also has to be enabled manually by setting the `verbose` parameter (3rd parameter of `apitap.wrap()`) to `true`.
