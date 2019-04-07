# jSynk.js

## Description

jSynk.js is a small javascript framework the browser/node.js with functions to convert javascript objects 
to publish/subscribe changes, to html, to css, html to dom, string including functions 
and regex, testing, benchmarking, modular loader, animating, diffing, async parallel helper functions and other utilities.

## js_to_html - inspired by handlebars.js, angular.js, react.js/jsx

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

## js_to_css - inspired by sass/scss, LESS and Stylus

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
var style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
setTimeout(function(){
	document.head.removeChild(style);
}, 5000);
```

## html_to_dom - inspired by angular.js, react.js

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
//<div>
//	<b>Name:</b>
//	<div class="header test" style="font-size:10px;padding:10px;" tabindex="1"><b>header_title:</b></div>
//	<div class="content test" tabindex="1" style="padding:10px;"><b>content_title:</b></div>
//	<div class="footer test" tabindex="1" style="padding:10px;"><b>footer_title:</b></div>
//	<input type="text">
//</div>
```

## sub - inspired by ember.js, backbone.js, redux.js

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

## sub.debug - inspired by my struggles to debug code

```js
var s = jk.sub();
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
// watch stacktrace to see where this code was set
```

## agent - inspired by selenium, mocha.js, puppeteer

```js
var agent = jk.agent({
	on_start: function on_start() {
		console.log('starting missions');
	},
	on_mission_finish: function on_mission_finish(e) {
		console.log('finished mission "'+e.mission.name+'" on '+e.time+'ms');
	},
	on_mission_fail: function on_mission_fail(e) {
		console.log('failed mission "'+e.mission.name+'" on '+e.time+'ms');
	},
	on_complete: function on_complete() {
		console.log('completed missions');
	},
});

agent.add_mission({ name: 'sync', f:function() {
	console.log('sync test');
}});

agent.add_mission({ name: 'async', f:function() {
	setTimeout(function(){
		console.log('async test');
		agent.next();
	}, 1000);
}, async: true});

agent.add_mission({ name: 'add dynamic test', f:function() {
	console.log('adding dynamic test');
	agent.add_instant_missions([
		{ name: 'dynamic_test', f: function() {
			console.log('run dynamic added test');
		}}
	]);
}});

agent.run_missions();
// starting missions
// sync test
// finished mission "sync" on 2ms
// async test
// finished mission "async" on 1002ms
// adding dynamic test
// finished mission "add dynamic test" on 2ms
// run dynamic added test
// finished mission "dynamic_test" on 2ms
// completed missions
```

## benchmark - inspired by benchmark.js

```js
// TODO
```

## cias - inspired by compression int and string

```js
var cur_time = new Date().getTime();
console.log(cur_time);
// 1553598014102
var cias_str = jk.cias(cur_time);
console.log(cias_str);
// "RLowwHW"
var cias_int = jk.cias(cias_str);
console.log(cias_int);
// 1553598014102
```

## huid - inspired by guid and high resolution timestamp

```js
var huid = jk.huid();
console.log(huid);
// "RLoi2nQ_2JrMGP_P1x_AuUZ2S_3IAvUK"
var huid_details = jk.huid(huid);
console.log(huid_details);
//{
// 	boot_time: 1553594464224.2126,
// 	boot_time_ms: 1553594464224,
// 	boot_time_precision_decimal: 0.2125733017,
// 	elapsed_time: 96221.9996087668,
// 	elapsed_time_ms: 96221,
// 	elapsed_time_precision_decimal: 0.9996087668,
// 	final_time: 1553594560446.2122,
// 	final_time_ms: 1553594560445,
// 	final_time_precision_decimal: 1.2121820685,
// 	nums: [1553594464224, 2125733017, 96221, 9996087668, 3016976812],
// 	random_padding: 3016976812
//}
```

## load - inspired by require.js

```js
// TODO
```

## register - inspired by require.js

```js
// TODO
```

## stringify - inspired by JSON.stringify

```js
var obj = {
	bool: true, str: '!', num: 1,
	infinity: Infinity, nan: NaN,
	null: null, undefined: undefined,
	function: function(){}, regex: /^\d+$/gm, date: new Date()
};
var jk_str = jk.stringify(obj, {beautify:true});
console.log(jk_str);
// {
// 	"bool": true,
// 	"str": "!",
// 	"num": 1,
// 	"infinity": Infinity,
// 	"nan": NaN,
// 	"null": null,
// 	"undefined": undefined,
// 	"function": function(){},
// 	"regex": /^\d+$/gm,
// 	"date": new Date(1553998399486)
// }
var json_str = JSON.stringify(obj, null, '\t');
console.log(json_str);
// {
// 	"bool": true,
// 	"str": "!",
// 	"num": 1,
// 	"infinity": null,
// 	"nan": null,
// 	"null": null,
// 	"regex": {},
// 	"date": "2019-03-31T02:13:19.486Z"
// }
var obj_from_jk_str = jk.parse(jk_str);
// jk.parse function "DANGEROUS TO SAVE/READ - XSS/NODE EXECUTION"
console.log(obj_from_jk_str);
// {
// 	bool:true
// 	date:Sun Mar 31 2019 04:31:19 GMT+0200 (W. Europe Summer Time)
// 	function:function() {…}
// 	infinity:Infinity
// 	nan:NaN
// 	null:null
// 	num:1
// 	regex:RegExp
// 	str:"!"
// 	undefined:undefined
// }
var jk_str_from_obj_from_jk_str = jk.stringify(obj_from_jk_str, {beautify:true});
var jk_str_equals_jk_str_to_obj_to_str = jk_str == jk_str_from_obj_from_jk_str;
console.log(jk_str_equals_jk_str_to_obj_to_str);
// true
```

## animate - inspired by jQuery.js, raphael.js, velocity.js

```js
var ani_obj = jk.animate({from: 100, to: 0, duration: 300, f:log_cur_val});
console.log(jk.stringify(ani_obj.vals,{beautify:true}));
// {
// 	"from": 100,
// 	"to": 0,
// 	"f": function log_cur_val(obj) {
// 		console.log(obj.vals.cur_val);
// 	},
// 	"duration": 300,
// 	"n": "",
// 	"start_time": 1553996074631,
// 	"diff_time": 0,
// 	"abs_percent": 0,
// 	"percent": 0,
// 	"anim_percent": 0,
// 	"cur_val": 0
// }
function log_cur_val(obj) {
	console.log(obj.vals.cur_val);
}
// 98.42926826881794
// 91.63221566676845
// 83.32312532838978
// 74.62420554151944
// 66.12620797547086
// 58.371920773959886
// 50.45413315675924
// 42.92864323155684
// 36.25760102513104
// 29.66052971894962
setTimeout(function(){
	ani_obj.stop();
	console.log(jk.stringify(ani_obj.vals,{beautify:true}));
	// {
	// 	"from": 100,
	// 	"to": 0,
	// 	"f": function log_cur_val(obj) {
	// 		console.log(obj.vals.cur_val);
	// 	},
	// 	"duration": 300,
	// 	"n": "",
	// 	"start_time": 1553996074631,
	// 	"diff_time": 149,
	// 	"abs_percent": 0.49666666666666665,
	// 	"percent": 0.49666666666666665,
	// 	"anim_percent": 0.7033947028105039,
	// 	"cur_val": 29.66052971894962
	// }
	var ani_obj2 = jk.animate({from: ani_obj.vals.cur_val, to: 100, duration: 150, f:function(obj) {
		console.log(obj.vals.cur_val);
	}});
	// 37.0130064544886
	// 49.99087321040387
	// 60.93593269113734
	// 71.00503300421573
	// 80.4287618333185
	// 88.24776857633327
	// 94.21490393754453
	// 98.30599779211906
	// 99.86120112292397
	// 100
}, 150);
```

## async_recursive - inspired by async.js

```js
// TODO
```

## async_parallel - inspired by async.js

```js
// TODO
```

## diff - inspired by git, svn, mercurial

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

Works in browser, Node.js.
Tries to be crossbrowser Chrome, Firefox, Edge, IE9+, Safari and use vanilla js.

## License

MIT