# jsynk

## Description

A lib with many small simplified frameworks such as tools for javascript varibles 
to pub/sub changes, parse to html, parse to css, convert to string including functions 
and regex, testing, animating, diffing, benchmarking, modular html to dom converter and some other utilities.

## demo js_to_html

```js
var js_html = [
	{ tso: '!DOCTYPE', html: 0 },
	{ t: 'html', c: [
		{ t: 'head', c: [
			{ tso: 'meta', charset:'UTF-8' },
			{ t: 'link', href:'css/index.css' },
			{ t: 'script', src:'js/jsynk.js' },
		]},
		{ t: 'body', c:[
			{ t: 'div', c:[
				{ t: 'b', c: [ 'Name:' ] },
				{ tsc: 'br' },
				{ tsc: 'input', type: 'text' },
			] },
		]},
	]},
];
var html = jk.js_to_html(js_html, {beautify:true});
console.log(html);
//<!DOCTYPE html>
//<html>
// 	<head>
// 		<meta charset="UTF-8">
// 		<link href="css/index.css"></link>
// 		<script src="js/jsynk.js"></script>
// 	</head>
// 	<body>
// 		<div>
// 			<b>
// 				Name:
// 			</b>
// 			<br/>
// 			<input type="text"/>
// 		</div>
// 	</body>
//</html>
```

## demo js_to_css

```js
var js_css = [
	{ s: 'html, body',
		padding: '0',
		margin: '0',
	},
	{ s: '.res_20',
		margin: '-10px',
		c: [
			{ s: ' .res_li', 
				margin: '10px'
			}
		]
	},
];
var css = jk.js_to_css(js_css, { beautify: true });
console.log(css);
//html, body{
// 	padding:0;
// 	margin:0;
// }
//.res_20{
// 	margin:-10px;
// }
//.res_20 .res_li{
// 	margin:10px;
//}
```

## demo html_to_dom

```js
jk.dom_modules.test = {
	html: jk.js_to_html(
		[
			{ t: 'div', class: 'header', style: 'font-size:10px;', c: [
				{ t: 'b', c: [ 'header_title:' ] },
			] },
			{ t: 'div', class: 'content', tabindex: '2', c: [
				{ t: 'b', c: [ 'content_title:' ] },
			] },
			{ t: 'div', class: 'footer', c: [
				{ t: 'b', c: [ 'footer_title:' ] },
			] },
		]
	),
	on_init: function on_init(args) {
		var parent = this.parent;
		var el = this.el = {
			header: parent.querySelector('.header'),
			content: parent.querySelector('.content'),
			footer: parent.querySelector('.footer'),
		};
		// console.log(el);
	}
};

var js_html = [
	{ t: 'div', c: [
		{ t: 'b', c: [ 'Name:' ] },
		{ t: 'div', class: 'test', style: 'padding:10px;', tabindex: '1', jk: 'test' },
		{ tsc: 'input', type: 'text' },
	] }
];
var html = jk.js_to_html(js_html);
var parent = jk.html_to_dom(html);
var dom_nodes = parent.children;
console.log(dom_nodes[0].outerHTML);
/* 
<div><b>Name:</b>
    <div class="header test" style="font-size:10px;padding:10px;" tabindex="1"><b>header_title:</b></div>
    <div class="content test" tabindex="1" style="padding:10px;"><b>content_title:</b></div>
    <div class="footer test" tabindex="1" style="padding:10px;"><b>footer_title:</b></div><input type="text">
</div>
*/
```

## demo sub

```js
var s = jk.sub();
console.log( s.get() );
// undefined
s.set({ v: { name: 'Jay'} });
console.log( s.get() ); 
// { name: 'Jay' }
console.log( s.get('name') ); 
// 'Jay'
s.set({ p: 'name', v: 'Kay' });
console.log( s.get() ); 
// { name: 'Kay' }

console.log('>>>');
s.set({ v: undefined });
console.log( s.get() ); 
// undefined
s.on({ p: 'name', f: function() {
	console.log('Welcome '+s.get('name')+'!!!');
} });
s.set({ v: { name: 'Ray' } });
// Welcome Ray!!!
console.log( s.get() ); 
// { name: 'Ray' }
s.on({p:/^children.\d+$/gm, f:function(e) {
	var path = e.paths[0];
	var val = s.get(path);
	if(val){
		console.log('Added child '+val);
	}
	else {
		console.log('Removed child');
	}
}});
s.set({p:'children',v:[ 'Amy', 'Alex' ]});
// Added child Amy
// Added child Alex
console.log( s.get() );
// { name: 'Ray', children: [ 'Amy', 'Alex' ] }
s.set({p:'children',v:[] });
// Removed child
// Removed child
console.log( s.get() );
// { name: 'Ray', children: [] }

s.off(); // removes all s.on
console.log('>>>');
s.set({ v: undefined });
console.log( s.get() ); 
```

## demo sub.debug

```js
var s = jk.sub();
// s.debug(1);
// s.debug(true);
// s.debug(/children/);
// s.debug('children : []');
s.debug({l:/.*/}); // will log all changes
s.set({v:{ name: 'Ray', children: [ 'Amy', 'Alex' ] }});
// ' : {}'
// 'name : "Ray"'
// 'children : []'
// 'children.0 : "Amy"'
// 'children.1 : "Alex"'
s.debug(); // will remove logging/stacktracing
s.set({v:undefined});
s.debug({s:'children : []'}); // stacktrace on match
s.set({v:{ name: 'Ray', children: [ 'Amy', 'Alex' ] }});
```

## demo agent

```js
var agent = jk.agent({
	on_start: function on_start() {
		console.log('starting missions');
	},
	on_mission_finish: function on_mission_finish() {
		console.log('starting missions');
	},
	on_mission_fail: function on_mission_fail() {
		console.log('starting missions');
	},
	on_complete: function on_complete() {
		console.log('completeted missions');
	},
});

agent.add_mission();
// TODO
```

## demo TODO

```js
// TODO
```

## Installation

Browser - [jsynk.js](https://raw.githubusercontent.com/Jsynk/jsynk.js/master/jsynk.js)
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