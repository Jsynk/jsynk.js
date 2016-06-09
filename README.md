# jsynk

## Description

A lib with many small frameworks such as tools for javascript varibles 
to pub/sub changes, parse to html, parse to css, convert to string including functions 
and regex, testing, animating, diffing and some other utilities.

## jSub - (still in construction)

jSub will keep track of a varible value (starts as undefined).
And as one set its value to something else one can then subscribe 
to that change and execute a specific function on that specific change.

```js
// Publish and Subscibe to changes for a javascript varible (default root value undefined)
var sub = new jk.jSub();
sub.debug(1); // will log all changes "{path} : {value}"

sub.on({path:'title', fn:function(){});

sub.set({path:'',value:{title:'welcome',list:['apple','orange']}});
// will console.log the changes - 
// " : {}"
// "title : "welcome""
// "list : []"
// "list.0 : "apple""
// "list.1 : "orange""
```

## Installation

Browser - [jsynk.js](https://raw.githubusercontent.com/Jsynk/jsynk.js/master/jsynk.jss)
```html
<script type="text/javascript" src="jsynk.js"></script>
```
Node.js
```
npm install jsynk
```

## Compatibility

Works in browser, Node.js and some frameworks that supports Asynchronous Module Definition (AMD).

## License

MIT