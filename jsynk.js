/* jsynk.js | License: MIT | Author: Jorge Andrés Guerra Guerra | jsynkk@gmail.com | jsynk.com */
;;;"Use strict";
(function(root, factory) {
    if (typeof exports === 'object' && exports !== null) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define('jsynk', [], factory);
    } else {
        root.jk = factory();
    }
})(this, function() {
    return (function() {
        var env = {
            browser: typeof window == 'object' && window !== null ? true : false,
            cordova: typeof Cordova == 'object' && Cordova !== null ? true : false,
            jxcore: typeof jxcore == 'object' && jxcore !== null ? true : false,
            nodejs: typeof exports === 'object' && exports !== null !== null ? true : false,
        };

        var req_ani_frame, can_ani_frame;
        (function() {
            if(env['browser']){
                req_ani_frame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
                can_ani_frame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
            }
            if(!req_ani_frame){
                var timeLast = 0;
                req_ani_frame = function(callback) {
                    var timeCurrent = (new Date()).getTime(), timeDelta;
                    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                    timeLast = timeCurrent + timeDelta; // return performance.now if supported?
                    return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
                };
            }
            if(!can_ani_frame){
                can_ani_frame = function(rafid) {
                    clearTimeout(rafid);
                };
            }
        })();

        var jk = {
            this: this,
            env : env,

            run: (function() {
                function run(args) {
                    var s = jk.run.prototype;
                    var args = args || {};
                    var ret_val = undefined;
                    var type = args.t || args.type;
                    var s_type_fn = s.types[type];
                    if(jk.typeof(s_type_fn) == 'function'){
                        ret_val = s_type_fn(args);
                    }
                    return ret_val;
                }
                run.prototype = {
                    types:{},
                };
                return run;
            })(),

            load: (function(){
                function load(args, from){
                    var s = jk.load.prototype;
                    s.options_handler(args);
                    var id = args.id;
                    var path = args.p || args.path;

                    var load_file = args.force_load || false;
                    var load_request = s.load_requests[path];
                    if (!load_request) {
                        load_request = s.load_requests[path] = {
                            val: null, loaded: false,
                            dep_ids: {}, dep_ids_len: 0,
                        };
                        s.load_requests_len++;
                        for(var i = 0; i < s.on_added.length; i++){
                            var on_added = s.on_added[i];
                            on_added(path);
                        }
                        load_file = true;
                    }
                    if(load_file){
                        var suppliers = s.suppliers;
                        var agent = new jk.agent({'catch_error':false});
                        for (var i = 0; i < suppliers.length; i++) {
                            var supplier = suppliers[i];
                            agent.add_mission({
                                'name':'suppliers','fn': supplier,
                                'fn_args':args, 'async': true,
                            });
                        }
                        agent.run_missions();
                    }
                    if(args.force_load){
                        return args;
                    }

                    load_request.dep_ids[id] = true;
                    load_request.dep_ids_len++;

                    if(from){
                        var from_id = from.id;
                        var from_path = from.p || from.path;

                        var from_args = s.load_request_args[from_id];
                        if(from_args){
                            if(!from_args.to_ids){
                                from_args.to_ids = {};
                                from_args.to_ids_len = 0;
                            }
                            from_args.to_ids[id] = true;
                            from_args.to_ids_len++;
                        }

                        args.from_id = from_id;
                        args.from_path = from_path;
                    }

                    s.load_request_args[id] = args;

                    if(load_request.loaded){
                        var fn = args.f || args.fn;
                        if(fn){
                            fn(load_request.val);
                        }
                    }

                    return args;
                }
                load.prototype = {
                    options_handler: function options_handler(args) {
                        var id = args.id;
                        if(!id){
                            id = args.id = jk.huid();
                        }
                        if(jk.env.browser){
                            var full_path = args.p || args.path;
                            var path = full_path.replace(/\?.*/, '');
                            if(path != full_path){
                                args.full_path = full_path;
                                args.p = path;
                            }
                        }
                    },
                    suppliers: [
                        function file_loader(args) {
                            var agent = this;
                            var s = jk.load.prototype;
                            if(jk.env.nodejs){
                                var file_path = args.path;
                                var module = args.require ? args.require(file_path): s.require(file_path);
                                if(!module.path){
                                    module.path = file_path;
                                }
                                jk.register(module);
                            }
                            else if(jk.env.browser){
                                var full_file_path = args.full_path || args.path;
                                var file_path = args.path;
                                var load_request = s.load_requests[file_path];
                                var script = document.createElement('script');
                                script.setAttribute('src', full_file_path);
                                script.async = true;
                                script.onload = function() {
                                    if(load_request && load_request.loaded === false){
                                        jk.register({path:file_path});
                                    }
                                }
                                document.querySelector('head').appendChild(script);
                                load_request.script = script;
                            }
                        }
                    ],
                    load_requests: {},
                    load_requests_len: 0,
                    load_request_args: {},

                    on_added: [],
                };
                return load;
            })(),
            unload: (function(){
                function unload(args) {
                    var sl = jk.load.prototype;
                    var path = null;
                    var id = null;
                    var from_id = null;
                    var to_ids = null;
                    var args_typeof = jk.typeof(args);
                    if(args_typeof == 'object'){
                        path = args.path;
                        id = args.id;
                        from_id = args.from_id;
                        to_ids = args.to_ids;
                    }
                    else if(args_typeof == 'string'){
                        path = args;
                    }

                    var load_request = sl.load_requests[path];
                    if(load_request){

                        if(id != null){
                            load_request.dep_ids_len--;
                            delete load_request.dep_ids[id];
                        }
                        
                        if(load_request.dep_ids_len == 0){
                            if(load_request.req){
                                load_request.req.abort();
                            }
                            if(load_request.val.on_unload){
                                load_request.val.on_unload(load_request);
                            }
                            if(load_request.script){
                                load_request.script.parentNode.removeChild(load_request.script);
                            }
                            delete sl.load_requests[path];
                            sl.load_requests_len--;
                        }

                        if(id != null){
                            delete sl.load_request_args[id];

                            var from_args = sl.load_request_args[from_id];
                            if(from_args){
                                delete from_args.to_ids[id];
                                from_args.to_ids_len--;
                            }

                            for(var tid_i in to_ids){
                                var tid_args = sl.load_request_args[tid_i];
                                jk.unload(tid_args)
                            }
                        }

                        
                    }

                    
                }
                unload.prototype = {};
                return unload;
            })(),
            register: (function(){
                function register(args){
                    var sr = jk.register.prototype;
                    var sl = jk.load.prototype;
                    sr.options_handler(args);
                    var path = args.p || args.path;

                    var load_request = sl.load_requests[path];
                    if(!load_request){
                        load_request = sl.load_requests[path] = {
                            val: null, loaded: false,
                            dep_ids: {}, dep_ids_len: 0,
                        }
                        sl.load_requests_len++;
                        for(var i = 0; i < sl.on_added.length; i++){
                            var on_added = sl.on_added[i];
                            on_added(path);
                        }
                    }
                    if(load_request && !load_request.loaded){
                        load_request.val = args;
                        load_request.loaded = true;

                        if(args.on_load){
                            args.on_load(load_request);
                        }

                        var load_request_args = sl.load_request_args;

                        var dep_ids = load_request.dep_ids;
                        for(var did_i in dep_ids){
                            var did = load_request_args[did_i];
                            if(did){
                                var fn = did.f || did.fn;
                                fn(load_request.val);
                            }
                        }
                    }
                    else if(load_request){
                        var prev_val = load_request.val;
                        load_request.val = args;
                        if(args.on_reload){
                            args.on_reload(load_request, prev_val);
                        }
                    }

                    return args;
                }
                register.prototype = {
                    options_handler: function options_handler(args) {
                        var path = args.p || args.path;
                        if(!path){
                            var trace_files = jk.get_trace_files();
                            if(trace_files != null){
                                if(jk.env.browser){
                                    path = args.path = trace_files[0].rel_url;
                                }
                                else if (jk.env.nodejs){
                                    path = args.path = trace_files[0].file_path;
                                }
                            }
                        }
                    }
                };
                return register;
            })(),
            reg_info: function reg_info(args) {
                var args = args || {};
                var sr = jk.register.prototype;
                var sl = jk.load.prototype;
                sr.options_handler(args);
                var path = args.path;
                var load_request = sl.load_requests[path];

                var ret_val = { path: args.path, load_request: load_request };
                return ret_val;
            },
            get_trace_files: function get_trace_files() {
                var ret_val = null;
                
                var trace_files = [];
                if(jk.env.browser){
                    var stack = ''; try { throw new Error(); } catch (e) { stack = e && e.stack ? e.stack : ''; }
                    var stack_urls = stack.match(/http?[^)\s]+/g);
                    if(stack_urls != null && stack_urls.length != 0){
                        var base_url = location.protocol + '//' + location.host + '/';

                        stack_urls.reverse();
                        for(var i = 0; i < stack_urls.length; i++){
                            var s_url = stack_urls[i];

                            var full_url = s_url.replace(/:\d+:\d+$/, '');
                            var origin = s_url.slice(full_url.length+1);

                            var colon_splits = origin.split(':');
                            var line_num = parseInt(colon_splits[0]||-1);
                            var col_num = parseInt(colon_splits[1]||-1);

                            var is_local = full_url.indexOf(base_url) == 0;
                            var tf_li = { 
                                is_local: is_local,
                                url: full_url,
                                line_num: line_num, col_num: col_num
                            };
                            if(is_local){
                                var rel_full_url = full_url.slice(base_url.length);
                                var rel_url = rel_full_url.replace(/\?.*$/, '');
                                tf_li.rel_full_url = rel_full_url;
                                tf_li.rel_url = rel_url;
                            }

                            trace_files.push(tf_li);
                        }
                    }
                }
                else if (jk.env.nodejs){
                    var stack = new Error().stack;
                    var stack_paths = stack.match(/at.+/gm);
                    if(stack_paths != null && stack_paths.length != 0){
                        for(var i = 0; i < stack_paths.length; i++){
                            var s_path = stack_paths[i];
                            var fn_name = s_path.replace(/^at | .*$/g, '');
                            var file_strs = s_path.match(/[^ \(]*:\d+:\d+/g);
                            var file_str = file_strs.slice(-1)[0];
                            var file_path = file_str.replace(/:\d+.*$/g,'');
                            var line_num = parseInt(file_str.replace(/^[^\d]+|:\d+$/g,''));
                            var col_num = parseInt(file_str.replace(/^.*:\d+:/g,''));
                            var rel_path = file_path.replace(/^.*(\\|\/)/,'');
                            var tf_li = { 
                                file_path: file_path,
                                rel_path: rel_path,
                                line_num: line_num, col_num: col_num,
                            };
                            if(!(trace_files.length == 0 && rel_path == 'jsynk.js')){
                                trace_files.push(tf_li);
                            }
                        }
                    }
                }
                if(trace_files.length != 0){
                    ret_val = trace_files;
                }

                return ret_val;
            },

            cias: (function(){
                function cias(val) {
                    if (this instanceof jk.cias){
                        //ascii ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
                        var letters = val || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                        this._instance = {
                            letters: letters
                        }
                    }
                    else {
                        return jk.cias.prototype.convert(val);
                    }
                }
                cias.prototype = {
                    convert: function convert(val){
                        if (jk.typeof(val) == 'number'){
                            var instance = this._instance;
                            var letters = instance.letters;
                            var letters_len = letters.length;

                            var rixit;
                            var residual = Math.floor(val);
                            var result = '';
                            while (true) {
                                rixit = residual % letters_len;
                                result = letters.charAt(rixit) + result;
                                residual = Math.floor(residual / letters_len);
                                if (residual == 0)
                                    break;
                                }
                            return result;
                        }
                        else if (jk.typeof(val) == 'string'){
                            var instance = this._instance;
                            var letters = instance.letters;
                            var letters_len = letters.length;
                            
                            var result = 0;
                            var vals = val.split('');
                            for (var i = 0; i < vals.length; i++) {
                                result = (result * letters_len) + letters.indexOf(vals[i]);
                            }
                            return result;
                        }
                    },
                    __init__: function(){
                        jk.cias.prototype._instance = new jk.cias()['_instance'];

                        delete jk.cias.prototype.__init__;
                    }
                };
                return cias;
            })(),
            huid: (function(){
                function huid(args){
                    var ret_val = null;
                    var args_typeof = jk.typeof(args);
                    if(args_typeof == 'string'){
                        ret_val = hp.get_huid_times(args);
                    }
                    else {
                        ret_val = hp.generate();
                    }
                    return ret_val;
                };
                var hp = huid.prototype = {
                    start_time: (new Date()).getTime(),
                    start_time_str: '',
                    seperator: '_',                    
                    padding: function padding(num_str){
                        var str = num_str || '';
                        if(str.length < 10){
                            var r = Math.random().toString().slice(2);
                            str += r.slice(0, 10 - str.length);
                        }
                        return parseInt(str);
                    },
                    get_start_time_str: function get_start_time_str(){
                        return jk.cias(hp.start_time) + hp.seperator + jk.cias((hp.get_cur_times()[1])) + hp.seperator;
                    },
                    get_cur_times: function get_cur_times(){
                        var elapsed_time = (new Date()).getTime() - hp.start_time;
                        return [ elapsed_time, hp.padding() ];
                    },
                    generate: function generate(){
                        var cur_times = hp.get_cur_times();

                        var huid = hp.start_time_str || '';

                        huid += jk.cias(cur_times[0]) + hp.seperator + jk.cias(cur_times[1]) + hp.seperator + jk.cias(hp.padding());

                        return huid;
                    },
                    get_huid_times: function get_huid_times(args){
                        var ret_val = null;
                        var num_splits = args.split(hp.seperator);
                        var nums = [];
                        var i = num_splits.length;
                        while (i--) {
                            var num_split = num_splits[i];
                            nums = [jk.cias(num_split)].concat(nums);
                        }
                        if(nums.length == 5){
                            var boot_time_ms = nums[0];
                            var boot_time_precision_decimal = parseFloat('0.'+'0000000000'.slice(0,10-(nums[1]+'').length) + nums[1]);
                            var boot_time = boot_time_ms+boot_time_precision_decimal;

                            var elapsed_time_ms = nums[2];
                            var elapsed_time_precision_decimal = parseFloat('0.'+'0000000000'.slice(0,10-(nums[3]+'').length) + nums[3]);
                            var elapsed_time = elapsed_time_ms+elapsed_time_precision_decimal;

                            var final_time_ms = (boot_time_ms+elapsed_time_ms);
                            var final_time_precision_decimal = (boot_time_precision_decimal+elapsed_time_precision_decimal);
                            var final_time = final_time_ms+final_time_precision_decimal;

                            ret_val = { 
                                boot_time: boot_time,
                                boot_time_ms: boot_time_ms,
                                boot_time_precision_decimal: boot_time_precision_decimal,

                                elapsed_time: elapsed_time,
                                elapsed_time_ms: elapsed_time_ms,
                                elapsed_time_precision_decimal: elapsed_time_precision_decimal,

                                final_time: final_time,
                                final_time_ms: final_time_ms,
                                final_time_precision_decimal: final_time_precision_decimal,

                                nums: nums,
                                random_padding: nums[4],
                            };
                        }
                        else {
                            ret_val = { nums: nums };
                        }
                        return ret_val;
                    },
                    __init__: function(){
                        var hp = jk.huid.prototype;
                        hp.start_time_str = hp.get_start_time_str();

                        delete jk.huid.prototype.__init__;
                    },
                };
                
                var overriden = false;
                if(env.nodejs){
                    if(typeof process == 'object' && typeof process.hrtime == 'function'){
                        function get_cur_times_nodejs(){
                            var process_hrtime = process.hrtime();
                            var elapsed_time = (new Date()).getTime() - this.start_time;
                            return [elapsed_time, process_hrtime[1]];
                        }
                        huid.prototype.get_cur_times = get_cur_times_nodejs;
                        overriden = true;
                    }
                    else {
                        console.log('process.hrtime not found!');
                    }
                }
                if(env.browser && !overriden){
                    if(typeof performance == 'object' && typeof performance.now == 'function'){
                        function get_cur_times_browser(){
                            var splits = performance.now().toString().split('.');
                            var str = splits[1] || '';
                            if(str.length >= 3 || str.indexOf('00000') != -1){ // chrome, firefox 
                                var first_nums = '000';
                                var cur_num_str = str.slice(0, 3);
                                str = cur_num_str + first_nums.slice(cur_num_str.length);
                            }
                            var ret_val = [parseInt(splits[0]), parseInt(this.padding(str))];
                            return ret_val;
                        }
                        huid.prototype.get_cur_times = get_cur_times_browser;
                        overriden = true;
                    }
                }

                return huid;
            })(),

            typeof: function get_typeof(ref) {
                var ret_val = typeof(ref);
                if (ret_val == 'object') {
                    if (ref == null) {
                        ret_val = 'null';
                    }
                    else {
                        if (ref instanceof Array) { ret_val = 'array'; }
                        else if (ref instanceof RegExp) { ret_val = 'regexp'; }
                        else if (ref instanceof Date) { ret_val = 'date'; }
                    }
                }
                if(ret_val == 'number'){
                    if(isNaN(ref)){
                        ret_val = 'nan';
                    }
                    else if(!isFinite(ref)){
                        ret_val = 'infinity';
                    }
                }
                return ret_val;
            },

            pathval: function pathval(a0, a1) {
                var options_type = jk.typeof(a1);
                var options = options_type == 'object' ? options : {};
                var paths = a0;
                var paths_type = jk.typeof(a0);
                var ret_val;
                if(paths_type == 'object' && options_type == 'undefined'){
                    paths = [a0.paths || a0.p];
                    options = a0;
                }
                else if (paths_type == 'object' && options_type == 'string') {
                    paths = [a0, a1];
                    paths_type = 'array';
                }
                if (paths_type == 'array') {
                    var parent, prop_path;
                    var cur_val = paths[0];
                    var start_val = 1;
                    var sv_type = jk.typeof(cur_val);
                    if (sv_type == 'string') {
                        start_val = 0;
                        cur_val = jk.this;
                        parent = cur_val;
                    }
                    var has_prop = cur_val != null;
                    var paths_len = paths.length;
                    for (var i = start_val; i < paths_len; i++) {
                        var li = paths[i];
                        if (cur_val != null && (cur_val.hasOwnProperty(li) || (cur_val.__proto__ && cur_val.__proto__.hasOwnProperty(li)))) {
                            parent = cur_val;
                            cur_val = cur_val[li];
                            has_prop = true;
                        }
                        else if(cur_val != null && typeof(li) == 'string' && li.indexOf('.') != -1){
                            var splits = li.split('.');
                            if (cur_val != null && (cur_val.hasOwnProperty(splits[0]) || (cur_val.__proto__ && cur_val.__proto__.hasOwnProperty(splits[0])))) {
                                parent = cur_val;
                                cur_val = cur_val[splits[0]];
                                has_prop = true;
                                paths = paths.slice(0, i).concat(splits).concat(paths.slice(i+1));
                                paths_len = paths.length;
                            }
                            else {
                                cur_val = undefined;
                                has_prop = false;
                            }
                        }
                        else {
                            cur_val = undefined;
                            has_prop = false;
                        }
                    }
                    if(options.hasOwnProperty('set') && parent != null){
                        var prop_path = paths.slice(-1)[0];
                        parent[prop_path] = cur_val = options.set;
                    }
                    if(options.info){
                        ret_val = { val: cur_val, has_prop: has_prop, parent: parent, prop_path: prop_path };
                    }
                    else {
                        ret_val = cur_val;
                    }
                }
                return ret_val;
            },
            pathval_and_typeof: function pathval_and_typeof(paths, options){
                var ret_val;

                var val = jk.pathval(paths, options);
                var val_typeof = jk.typeof(val);

                ret_val = {
                    typeof: val_typeof,
                    val: val,
                };

                return ret_val;
            },

            is_loopable: function is_loopable(ref) {
                return ref != null ? /object|function/.test(typeof(ref)) ? true : false : false;
            },

            deep_copy: function deep_copy(args) {
                var args_js_type = jk.typeof(args);
                var ret_val;
                if (args_js_type == 'object') {
                    var val = args.val;
                    var dc_parent = {};
                    var par_index = 'result';
                    var p_ref_and_ignore = args.p_ref_and_ignore || /^p_ref_and_ignore$/;
                    var p_ignore = args.p_ignore || /^p_ignore$/;
                    var options = jk.typeof(args.options) == 'object' ? args.options : {};
                    var recursions = [{
                        'val': val,
                        'parent': dc_parent,
                        'par_index': par_index,
                        'p_ref_and_ignore': p_ref_and_ignore,
                        'p_ignore': p_ignore,
                        'options': options
                    }];
                    for (var i = 0; i < recursions.length; i++) {
                        var args = recursions[i];
                        var args_js_type = jk.typeof(args);

                        if (args_js_type == 'object') {
                            var val = args.val;
                            var parent = args.parent;
                            var par_index = args.par_index;
                            var level = args.level || 0;
                            var val_js_type = jk.typeof(val);
                            var reference = false;
                            var ignore = false;
                            var ignore_only = jk.is_index_match({
                                'index': par_index,
                                'match': p_ignore
                            });
                            if (ignore_only) {
                                ignore = false;
                            }
                            var ref_and_ignore = jk.is_index_match({
                                'index': par_index,
                                'match': p_ref_and_ignore
                            });
                            if (ref_and_ignore) {
                                reference = true;
                                ignore = true;
                            }
                            if (!ignore) {
                                switch (val_js_type) {
                                    case 'object':
                                        parent[par_index] = {};
                                        for (var j in val) {
                                            var v = val[j];
                                            recursions.push({
                                                'val': v,
                                                'parent': parent[par_index],
                                                'par_index': j,
                                                'p_ref_and_ignore': p_ref_and_ignore,
                                                'p_ignore': p_ignore,
                                                'level': level + 1
                                            });
                                        }
                                        break;
                                    case 'array':
                                        parent[par_index] = [];
                                        for (var k = 0; k < val.length; k++) {
                                            var v = val[k];
                                            parent[par_index].push(false);
                                            recursions.push({
                                                'val': v,
                                                'parent': parent[par_index],
                                                'par_index': k,
                                                'p_ref_and_ignore': p_ref_and_ignore,
                                                'p_ignore': p_ignore,
                                                'level': level + 1
                                            });
                                        }
                                        break;
                                    case 'function':
                                        parent[par_index] = jk.parse(val.toString());
                                        break;
                                    case 'date':
                                        parent[par_index] = new Date(val.getTime())
                                        break;
                                    case 'regexp':
                                        parent[par_index] = jk.parse(val.toString());
                                        break;
                                    default:
                                        parent[par_index] = val;
                                        break;
                                }
                            }
                            else if (reference) {
                                parent[par_index] = val;
                            }
                        }
                    }
                    ret_val = dc_parent['result'];
                }
                return ret_val;
            },
            is_index_match: function is_index_match(args) {
                var args_js_type = jk.typeof(args);
                var ret_val = false;
                if (args_js_type == 'object') {
                    var index = args.index != null ? args.index : args.i;
                    var match = args.match != null ? args.match : args.m;
                    var match_js_type = jk.typeof(match);
                    if (match_js_type == 'regexp') {
                        ret_val = match.test(index);
                    }
                    else {
                        ret_val = match == index;
                    }
                }
                return ret_val;
            },
            
            get_option: function get_option(opt_list, prop){
                var ret_val;
                for (var i = 0; i < opt_list.length; i++) {
                    var opt_li = opt_list[i];
                    if (opt_li && opt_li.hasOwnProperty(prop)){
                        ret_val = opt_li[prop];
                        break;
                    }
                }
                return ret_val;
            },

            sub: (function(){
                function sub() {
                    var s = this;
                    if (jk.instance_of(s, jk.sub)){
                        s.__jksubdata__ = {
                            val: undefined,
                            path_indexes: {},
                            sub_list: [],
                        };
                    }
                    else{
                        return new jk.sub();
                    }
                };
                sub.prototype = {
                    get: function get(path) {
                        var s = this;
                        var sd = s.__jksubdata__;
                        var path = path || '';
                        return path ? jk.pathval(sd.val, path): sd.val;
                    },
                    set: function set(args) {
                        var s = this;
                        var sd = s.__jksubdata__;
                        var args_path = '';
                        var args_set = false;
                        var args_typeof = jk.typeof(args);
                        var args_val = sd.val;
                        if(args_typeof == 'object'){
                            if(args.hasOwnProperty('p'))
                                args_path = args.p;
                            else if(args.hasOwnProperty('path'))
                                args_path = args.path;

                            if(args.hasOwnProperty('v')){
                                args_val = args.v;
                                args_set = true;
                            }
                            else if(args.hasOwnProperty('val')){
                                args_val = args.val;
                                args_set = true;
                            }
                            else if(args.hasOwnProperty('value')){
                                args_val = args.value;
                                args_set = true;
                            }
                        }
                        if(args_typeof == 'string'){
                            args_path = args;
                            args_val = s.get(args_path);
                            args_set = true;
                        }
                        var ignore = sd.ignore != null ? sd.ignore : '__ignore__';
                        var path_indexes = sd.path_indexes;
                        var diff_vals = [];
                        if(args_set){ // set val and start diff
                            var updated = false;
                            if(args_path == ''){
                                sd.val = args_val;
                                updated = true;
                            }
                            else if(args_typeof == 'string' && path_indexes[args_path]){
                                updated = true;
                            }
                            else{
                                var path_splits = args_path.split('.');
                                var parent_path = path_splits.slice(0,-1).join('.');
                                var parent = s.get(parent_path);
                                var p_loopable = jk.is_loopable(parent);
                                if(p_loopable){
                                    var prop_path = path_splits.slice(-1).join('.');
                                    parent[prop_path] = args_val;
                                    updated = true;
                                }
                            }
                            if(updated){
                                diff_vals = [{
                                    'path': args_path,
                                    't': args_val,
                                }].concat(diff_vals);
                            }
                        }
                        else {
                            diff_vals = [{
                                'path': '',
                                't': sd.val,
                            }].concat(diff_vals);
                        }

                        //start looping recursively the new val set
                        var diff_indexes = {};
                        var prev_indexes = {};
                        var diff_strs = [];
                        var i = diff_vals.length;
                        while(i--){
                            var dv = diff_vals[i];
                            var t = dv.t;
                            var path = dv.path;
                            // get prevval(from) and curval(to) and diff
                            var f_str = '';
                            var f_prop_val = path_indexes[path];
                            if(f_prop_val){
                                f_str = f_prop_val.val_str;
                            }
                            
                            var t_str = jk.stringify(t, { recursive: false });
                            var is_diffing = f_str != t_str;
                            if(is_diffing){
                                diff_strs.push(path);
                                diff_indexes[path] = true;
                            }

                            // loop curval(to) children
                            var prop_val = undefined;
                            var prop_val_childs = [];
                            var t_childs = {};
                            var t_loopable = jk.is_loopable(t);
                            if(t_loopable){
                                for(var tv_i in t){
                                    var t_ignore = jk.is_index_match({index:tv_i,match:ignore});
                                    if(!t_ignore){
                                        var tv = t[tv_i];
                                        if(t !== undefined){
                                            prop_val_childs.push(tv_i);
                                        }
                                        t_childs[tv_i] = true;
                                        var child_diff_val = {
                                            'path': path ? [path,'.',tv_i].join(''): tv_i,
                                            't': tv,
                                        };
                                        diff_vals = [child_diff_val].concat(diff_vals); i++;
                                    }
                                    
                                }
                            }
                            //loop prevval(from) children
                            if(f_prop_val){
                                var f_childs = f_prop_val.childs;
                                var f_childs_len = f_childs.length;
                                for(var j = 0; j < f_childs_len; j++){
                                    var f_child = f_childs[j];
                                    var tf_searched = t_childs[f_child] ? true: false;
                                    if(!tf_searched){
                                        var child_diff_val = {
                                            'path': path ? [path,'.',f_child].join(''): f_child,
                                            't': undefined,
                                        };
                                        prev_indexes[child_diff_val.path] = true;
                                        diff_vals = [child_diff_val].concat(diff_vals); i++;
                                    }
                                }
                            }
                            // if curval(to) isn´t undefined index its val_str and childs
                            if(t !== undefined){
                                var prop_val = {
                                    val_str: t_str,
                                    childs: prop_val_childs,
                                };
                                path_indexes[path] = prop_val;
                            }
                            else { // else remove old curval(to) index
                                delete path_indexes[path];
                            }
                        }
                        // notify subscribers if there were diffs
                        if(diff_strs.length != 0){
                            var diff_indexes_str = diff_strs.join('\n');
                            var sub_list = sd.sub_list;
                            var i = sub_list.length; 
                            while (i--) {
                                var sli = sub_list[i];
                                if(!sli){continue;}
                                var sli_path = sli.path || sli.p;
                                var sli_fn = sli.f || sli.fn;
                                var sli_fn_args = sli.fa || sli.fn_args;
                                var sli_path_to = jk.typeof(sli_path);
                                if(sli_path_to == 'string' && diff_indexes[sli_path]){
                                    sli_fn.call(this, {paths:[sli_path]}, sli_fn_args);
                                }
                                else if(sli_path_to == 'regexp'){
                                    var sli_once = sli.once || sli.o;
                                    var matches = diff_indexes_str.match(sli_path);
                                    if(matches && matches.length != 0){
                                        var once_paths = [];
                                        for(var j = 0; j < matches.length; j++){
                                            var m = matches[j];
                                            if(!sli_once && diff_indexes[m]){
                                                sli_fn.call(this, {paths:[m]}, sli_fn_args);
                                            }
                                            else if(sli_once && diff_indexes[m]){
                                                once_paths.push(m);
                                            }
                                        }
                                        if(sli_once && once_paths.length != 0){
                                            sli_fn.call(this, {paths:once_paths}, sli_fn_args);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    on: function on(args) {
                        var s = this;
                        var sd = s.__jksubdata__;
                        if(jk.typeof(args) == 'object'){
                            sd.sub_list = [args].concat(sd.sub_list);
                            if(args.r || args.run){
                                var fn = args.f || args.fn;
                                var fn_args = args.fa || args.fn_args;
                                fn({paths:[]},fn_args);
                            }
                        }
                    },
                    off: function off(args) {
                        var s = this;
                        var sd = s.__jksubdata__;
                        if(args == null){
                            sd.sub_list = [];
                            return;
                        }
                        var sub_list = sd.sub_list;
                        var i = sub_list.length;
                        while (i--) {
                            var sub = sub_list[i];
                            var namespace = null;
                            if (sub.hasOwnProperty('n'))
                                namespace = sub.n;
                            else if (sub.hasOwnProperty('namespace'))
                                namespace = sub.namespace;
                            var namespace_typeof = jk.typeof(namespace);
                            if( (namespace_typeof == 'string' && args == namespace) || (namespace_typeof == 'regexp' && args.test(namespace)) ){
                                sub_list.splice(i, 1);
                            }
                        }
                    },
                    
                    debug: function debug(args){
                        var s = this;
                        var sd = s.__jksubdata__;
                        var ns = '__sub_debugger__';
                        s.off(ns);
                        var args_typeof = jk.typeof(args);
                        if (args){
                            var log = undefined;
                            var stack = undefined;
                            if(args_typeof == 'object'){
                                log = args.l || args.log;
                                stack = args.s || args.stack;
                            }
                            else if(args_typeof == 'string'){
                                stack = args;
                            }
                            else if(args_typeof == 'regexp'){
                                log = args;
                            }
                            else if(args == 1 || args == true){
                                log = /.*/;
                            }
                            s.on({p:/^.*$/gm,n:ns,f:function debug(e){
                                var val = jk.stringify(s.get(e.paths[0]), {recursive:false});
                                var log_text = [e.paths[0],' : ',val].join('');
                                if( log && jk.is_index_match({ i: log_text, m: log }) ){
                                    console.log(["'",log_text,"'"].join(''));
                                }
                                if( stack && jk.is_index_match({ i: log_text, m: stack }) ){
                                    // Step through stack trace to locate where this value is set
                                    debugger;
                                }
                            }});
                            sd.sub_list.sort(function sort_ns_first(a, b){
                                if( ( a.n || a.namespace ) == ns) return 1;
                                else if( ( b.n || b.namespace ) == ns) return -1;
                                return 0;
                            });
                        }
                    },
                };
                return sub;
            })(),
            
            agent: (function(){
                function agent(options){
                    var s = this;
                    if (jk.instance_of(s, jk.agent)){
                        s._instance = {
                            'missions': [],
                            'current': -1,
                            'last_mission_time': 0,
                            'options': options,
                            'is_running': false,
                            'is_paused': false,
                        };
                    }
                    else {
                        return new jk.agent(options);
                    }
                }
                agent.prototype = {
                    default_options: {
                        'catch_error': true,
                        'capture_performance': true,
                    },
                    is_running: function is_running() {
                        return this._instance.is_running;
                    },
                    is_paused: function is_paused() {
                        return this._instance.is_paused;
                    },
                    get_option: function get_option(prop){
                        return jk.get_option([this._instance.options,this.default_options], prop);
                    },
                    add_mission: function add_mission(args){
                        var mission = undefined;
                        var args_js_type = jk.typeof(args);
                        if (args_js_type == 'function') {
                            mission = { f: args };
                        }
                        else if (args_js_type == 'object' && typeof (args.f || args.fn) == 'function') {
                            mission = args;
                        }
                        else if (args_js_type == 'array') {
                            for(var i = 0; i < args.length; i++){
                                var m = args[i];
                                var m_js_type = jk.typeof(m);
                                if (m_js_type == 'function') {
                                    this._instance.missions.push({ f: m });
                                }
                                else if (m_js_type == 'object' && typeof (m.f || m.fn) == 'function') {
                                    this._instance.missions.push(m);
                                }
                            }
                        }
                        if (mission != undefined) {
                            this._instance.missions.push(mission);
                        }
                    },
                    pause_missions: function pause_missions(){
                        this._instance.is_paused = !this._instance.is_paused;
                    },
                    abort_missions: function abort_missions() {
                        this._instance.current = -1;
                        var on_abort = this.get_option('on_abort');
                        if (typeof on_abort == 'function') {
                            on_abort.call(this);
                        }
                    },
                    clear_missions: function clear_missions(){
                        var instance = this._instance;
                        instance.missions = [];
                    },
                    run_missions: function run_missions(){
                        this._instance.current = -1;
                        var on_start = this.get_option('on_start');
                        if (typeof on_start == 'function') {
                            on_start.call(this);
                        }
                        this.next();
                    },
                    add_instant_missions: function add_instant_missions(missions, index) {
                        var instance = this._instance;
                        var index = index != null ? index : instance.current + 1;
                        var cur_missions = instance.missions;
                        instance.missions = cur_missions.slice(0, index).concat(missions).concat(cur_missions.slice(index));
                    },
                    next: function next(){
                        var self = this;
                        var instance = self._instance;

                        if(instance.is_paused){
                            return;
                        }

                        if (instance.current > -1) {
                            var on_mission_finish = self.get_option('on_mission_finish');
                            if (typeof on_mission_finish == 'function') {
                                var cur_mission = instance.missions[instance.current];
                                var mission_time = new Date().getTime()-instance.last_mission_time;
                                var on_args = { mission: cur_mission, time: mission_time };
                                on_mission_finish.call(self, on_args);
                            }
                            else {
                                var cur_mission = instance.missions[instance.current];
                                var mission_name = jk.pathval([cur_mission,'name']) || (instance.current+1);
                                console.log('Mission ' + mission_name +' - completed after ' + (new Date().getTime()-instance.last_mission_time) + 'ms');
                            }
                        }

                        if (instance.missions.length > instance.current+1) {
                            instance.is_running = true;
                            instance.current++;
                            var cur_mission = instance.missions[instance.current];
                            var ct_fn = cur_mission.f || cur_mission.fn;
                            var ct_fn_args = cur_mission.fa || cur_mission.fn_args;
                            var ct_fn_apply = cur_mission.fap || cur_mission.fn_apply;
                            instance.last_mission_time = new Date().getTime();
                            var catch_error = self.get_option('catch_error');
                            if (catch_error) {
                                try{
                                    if (ct_fn_apply) {
                                        ct_fn.apply(self, ct_fn_apply);
                                    }
                                    else {
                                        ct_fn.call(self, ct_fn_args);
                                    }
                                }
                                catch(e){
                                    var mission_name = jk.pathval([cur_mission,'name']) || (instance.current+1);
                                    var on_mission_fail = self.get_option('on_mission_fail');
                                    if (typeof on_mission_fail == 'function') {
                                        var cur_mission = instance.missions[instance.current];
                                        var mission_time = new Date().getTime()-instance.last_mission_time;
                                        var on_args = { mission: cur_mission, time: mission_time, exception: e };
                                        on_mission_fail.call(self, on_args);
                                    }
                                    else {
                                        console.log('Mission ' + mission_name +' - failed after ' + (new Date().getTime()-instance.last_mission_time) + 'ms');
                                        console.log(e);
                                    }
                                }
                            }
                            else {
                                if (ct_fn_apply) {
                                    ct_fn.apply(self, ct_fn_apply);
                                }
                                else {
                                    ct_fn.call(self, ct_fn_args);
                                }
                            }
                            if (cur_mission.async !== true) {
                                self.next();
                            }
                        }
                        else if (instance.missions.length == 0) {
                            instance.is_running = false;
                            var on_missing_missions = self.get_option('on_missing_missions');
                            if (typeof on_missing_missions == 'function') {
                                on_missing_missions.call(self);
                            }
                        }
                        else {
                            instance.is_running = false;
                            var on_complete = self.get_option('on_complete');
                            if (typeof on_complete == 'function') {
                                on_complete.call(this);
                            }
                        }
                    }
                };

                return agent;
            })(),

            animator: (function(){
                function animator(args){};
                animator.prototype = {
                    queue: [],
                    id: -1,
                    is_animating: false,
                    animate: function animate(args){
                        var args_typeof = jk.typeof(args);
                        if (args_typeof == 'object') {
                            var from = args.from;
                            var to = args.to;
                            var fn = args.f || args.fn;
                            if (typeof(from) == 'number' && 
                                typeof(to) == 'number' && 
                                typeof(fn) == 'function') {
                                var duration = args.duration || 500;
                                var namespace = args.namespace || '';
                                var start_time = new Date().getTime();

                                var ani = {
                                    'from': from, 'to': to, 'fn': fn,
                                    'duration': duration, 
                                    'namespace': namespace, 
                                    'start_time': start_time
                                };
                                this.queue.push(ani);
                                if(!this.is_animating){
                                    this.id = jk.raf(this.tick);
                                }
                            }              
                        }
                        else if (args_typeof == 'function') {
                            var ani = {
                                'from': 0, 'to': 0, 'fn': args,
                                'duration': 0, 'namespace': '', 
                                'start_time': new Date().getTime()
                            };
                            this.queue.push(ani);
                            if(!this.is_animating){
                                this.id = jk.raf(this.tick);
                            }
                        }
                    },
                    tick: function tick(timestamp){
                        var self = jk.animator.prototype;
                        var continue_animating = false;
                        var cur_time = new Date().getTime();
                        var queue = self.queue;
                        var remove = [];
                        for (var i = 0; i < queue.length; i++) {
                            var ani = queue[i];
                            var diff_time = cur_time - ani.start_time;
                            var abs_percent = diff_time/ani.duration;
                            // linear
                            var percent = abs_percent < 1 ? abs_percent : 1;
                            // Swing
                            var anim_percent = Math.sin((Math.PI/2)*percent);
                            var cur_val = ani.from + (ani.to-ani.from)*anim_percent;
                            var tick_info = {
                                'cur_time':cur_time, 'diff_time': diff_time,
                                'abs_percent': abs_percent, 'percent': percent,
                                'anim_percent': anim_percent, 'cur_val': cur_val
                            };
                            ani.fn(tick_info, ani);
                            if(percent < 1){
                                continue_animating = true;
                            }
                            else {
                                remove.push(i);
                            }
                        }
                        for (var i = remove.length - 1; i >= 0; i--) {
                            var index = remove[i];
                            queue.splice(index, 1);
                        }
                        self.is_animating = continue_animating;
                        if (self.is_animating){
                            self.id = jk.raf(self.tick);
                        }
                    },
                    stop: function stop(args) {
                        var args_typeof = jk.typeof(args);
                        var self = jk.animator.prototype;
                        var queue = self.queue;
                        for (var i = queue.length - 1; i >= 0; i--) {
                            var ani = queue[i];
                            var remove = false;
                            var ns = ani.namespace;
                            if (args_typeof == 'string') {
                                if (args == ns) {remove = true; }
                            }
                            if (args_typeof == 'regexp') {
                                if (args.test(ns)) {remove = true; }
                            }
                            if (remove) { queue.splice(i, 1); }
                        }
                    }
                };
                return animator;
            })(),

            animate: (function() {
                function animate(args) {
                    var s = this;
                    if (jk.instance_of(this, jk.animate)){
                        var typeof_args = jk.typeof(args);
                        if(typeof_args == 'object' || typeof_args == 'function'){
                            var vals = this.vals = {
                                from: 0, to: 1, f: function() {},
                                duration: 500, n: '',
                                start_time: new Date().getTime(),
        
                                diff_time: 0,
                                abs_percent: 0, percent: 0,
                                anim_percent: 0, cur_val: 0
                            };
                            if(typeof_args == 'object'){
                                jk.merge_to(args, vals);
                            }
                            else if(typeof_args == 'function'){
                                vals.f = args;
                            }
                            var queue = ap.queue;
                            ap.queue = queue = [this].concat(queue);
                            var is_animating = ap.is_animating;
                            if(!is_animating && queue.length != 0){
                                is_animating = ap.is_animating = true;
                                jk.raf(ap.update);
                            }
                        }
                    }
                    else{
                        return new jk.animate(args);
                    }
                }
                var ap = animate.prototype = {
                    is_animating: false,
                    queue: [],
                    update: function update() {
                        var ap = jk.animate.prototype;
                        var cur_time = new Date().getTime();
                        var queue = ap.queue;
                        var i = queue.length;
                        while (i--) {
                            var li = queue[i];
                            var vals = li.vals;
                            var diff_time = vals.diff_time = cur_time - vals.start_time;
                            var abs_percent = vals.abs_percent = diff_time/vals.duration;
                            var percent = vals.percent = abs_percent < 1 ? abs_percent : 1;// linear
                            var anim_percent = vals.anim_percent = Math.sin((Math.PI/2)*percent); // swing
                            vals.cur_val = vals.from + (vals.to-vals.from)*anim_percent;
                            vals.f(li);
                            if(percent == 1 || !jk.typeof(percent) == 'number'){
                                queue.splice(i, 1);
                            }
                        }
                        if(queue.length == 0){
                            ap.is_animating = false;
                        }
                        else {
                            jk.raf(ap.update);
                        }
                    },
                    stop: function stop(args) {
                        var queue = ap.queue;
                        var i = queue.length;
                        while (i--) {
                            var li = queue[i];
                            var vals = li.vals;
                            var namespace = vals.n;
                            if(this == li || jk.is_index_match({ i: namespace, m: args })){
                                queue.splice(i, 1);
                            }
                        }
                    }
                };
                return animate;
            })(),

            benchmark: function benchmark(args) {
                var on_load = args.on_load;
                var on_reload = args.on_reload;
                var on_unload = args.on_unload;

                var context = args.context || args.c || {};

                var duration = args.duration != null ? args.duration : 10000;
                var callback = args.callback || args.cb;

                if(on_load){
                    on_load.call(context);
                }

                var start_time = new Date().getTime(); // use perfomance.now?
                var end_time = start_time + duration;

                var total_runs = 0;
                if(!callback){ // sync
                    while(new Date().getTime() < end_time){
                        on_reload.call(context);
                        total_runs++;
                    }
                    var cur_time = new Date().getTime();
                    var average_run_time = (cur_time - start_time) / total_runs;
                    if(on_unload){
                        on_unload.call(context);
                    }
                    return { 
                        average_run_time: average_run_time, 
                        total_runs: total_runs 
                    }
                }
                else { // async
                    function next() {
                        total_runs++;
                        var cur_time = new Date().getTime();
                        if(cur_time < end_time){
                            on_reload.call(context);
                        }
                        else {
                            var final_end_time = cur_time;
                            var average_run_time = (final_end_time - start_time) / total_runs;
                            if(on_unload){
                                on_unload.call(context);
                            }
                            if(callback){
                                callback({ 
                                    average_run_time: average_run_time, 
                                    total_runs: total_runs 
                                });
                            }
                        }
                    }
                    context.next = next;
                    on_reload.call(context);
                }
            },

            raf: function raf(fn){ return req_ani_frame(fn); },
            caf: function caf(fn){ return can_ani_frame(fn); },

            stringify: (function() {
                function stringify(ref, options) {
                    var jss_parts = [];
                    var self = jk.stringify.prototype;
                    self.stringify_recursive({
                        'val': ref,
                        'jss_parts': jss_parts,
                        'options': options
                    });
                    return jss_parts.join('');
                }
                stringify.prototype = {
                    stringify_recursive: function stringify_recursive(args, level) {
                        var jss_parts = args.jss_parts;
                        var val = args.val;
                        var args = /object/.test(jk.typeof(args)) ? args : {};
                        var options = /object/.test(jk.typeof(args.options)) ? args.options : {};
                        var level = /number/.test(jk.typeof(level)) ? level : 0;
                        var val_typeof = jk.typeof(val);
                        var self = jk.stringify.prototype;
                        var tabs = '';
                        if (options.beautify) {
                            for(var i = 0; i < level; i++){
                                tabs += options.tab || '\t';
                            }
                        }
        
                        switch (true) {
                            case val_typeof == 'object':
                                jss_parts.push('{');
                                var loop_index = 0;
                                if (options.recursive !== false) {
                                    for (var i in val) {
                                        var v = val[i];
                                        if (loop_index != 0) {
                                            jss_parts.push(',');
                                        }
                                        if (options.beautify) {                                  
                                            jss_parts.push('\n');
                                            jss_parts.push(tabs);
                                            jss_parts.push(options.tab || '\t');
                                        }
                                        jss_parts.push('"' + i.replace(/"/g,'\\"') + '":');
                                        if (options.beautify) {                                  
                                            jss_parts.push(' ');
                                        }
                                        self.stringify_recursive({
                                            'val': v,
                                            'jss_parts': jss_parts,
                                            'options': options
                                        }, level + 1);
                                        loop_index++;
                                    }
                                }
                                if (options.beautify && loop_index != 0) {
                                    jss_parts.push('\n');
                                    jss_parts.push(tabs);
                                }
                                jss_parts.push('}');
                                break;
                            case val_typeof == 'array':
                                jss_parts.push('[');
                                var loop_index = 0; 
                                if (options.recursive !== false) {
                                    for (var i = 0; i < val.length; i++) {
                                        if (i != 0) {
                                            jss_parts.push(',');
                                        }
                                        var v = val[i];
                                        if (options.beautify) {
                                            jss_parts.push('\n');
                                            jss_parts.push(tabs);
                                            jss_parts.push(options.tab || '\t');
                                        }
                                        self.stringify_recursive({
                                            'val': v,
                                            'jss_parts': jss_parts,
                                            'options': options
                                        }, level + 1);
                                        loop_index++;
                                    }
                                }
                                if (options.beautify && loop_index != 0) {
                                    jss_parts.push('\n');
                                    jss_parts.push(tabs);
                                }
                                jss_parts.push(']');
                                break;
                            case val_typeof == 'null':
                                jss_parts.push('null');
                                break;
                            case val_typeof == 'undefined':
                                jss_parts.push('undefined');
                                break;
                            case val_typeof == 'date':
                                jss_parts.push('new Date('+val.getTime()+')');
                                break;
                            case val_typeof == 'string':
                                jss_parts.push('"' + val.toString() + '"');
                                break;
                            default:// number|boolean|regexp|function
                                jss_parts.push(val.toString());
                                break;
                        }
                    }
                };
                return stringify;
            })(),
            parse: function parse(ref, options) {
                var ret_val = eval('(function(){ return ' + ref + '; })();');
                return ret_val;
            },
            
            instance_of: function instance_of(object, constructor) {
                object = object.__proto__;
                while (object != null) {
                    if (object == constructor.prototype)
                        return true;
                    if (typeof object == 'xml')
                        return constructor.prototype == XML.prototype;
                    if(object.constructors != null && object.constructors.__proto__ == Array.prototype)
                        for(var i = 0; i < object.constructors.length; i++)
                            if(object.constructors[i].prototype  == constructor.prototype)
                                return true;
                    object = object.__proto__;
                }
                return false;
            },
            proto_merge: function proto_merge(proto_list){
                var f = {};
                var fp = {};
                var pl = proto_list.slice(0, -1);
                var last_item = proto_list.slice(-1)[0];
                var lip = last_item.prototype; // use __proto__ instead/also ?
                var constructors = lip.constructors || [];
                for(var i = 0; i < pl.length; i++){
                    var pli = pl[i];
                    var plip = pli.prototype;
                    for(var pli_li_i in pli){ // prop
                        var pli_li = pli[pli_li_i];
                        f[pli_li_i] = pli_li;
                    }
                    for(var plip_li_i in plip){ // prototype
                        var plip_li = plip[plip_li_i];
                        fp[plip_li_i] = plip_li;
                    }
                    constructors.push(pli);
                }// TODO add constructer ref as __<constructer_name>__
                for(var fli_i in f){
                    var fli = f[fli_i];
                    if(last_item.hasOwnProperty(fli_i)){
                        last_item[fli_i] = fli;
                    }
                }
                for(var fpli_i in fp){
                    var fpli = fp[fpli_i];
                    if(!lip.hasOwnProperty(fpli_i)){
                        lip[fpli_i] = fpli;
                    }
                }
                lip.constructors = constructors;
            },
            construct: function construct(obj){
                var constructors = obj.__proto__.constructors;
                if(constructors && constructors.__proto__ == Array.prototype){
                    for(var i = 0; i < constructors.length; i++){
                        var fn = constructors[i];
                        fn.call(obj);
                    }
                }
            },

            merge: function merge(ref1, ref2, deep_copy){
                var merge;
                var ref1_typeof = jk.typeof(ref1);
                var ref2_typeof = jk.typeof(ref2);

                var r1_is_obj = ref1_typeof == 'object';
                var r2_is_obj = ref2_typeof == 'object';

                if(ref2 != null && ref1 == null){
                    merge = ref2;
                }
                else if(ref1 != null && ref2 == null){
                    merge = ref1;
                }
                else if (r1_is_obj && r2_is_obj) {
                    var merge = {};
                    for(var r2_i in ref2){
                        var r2 = ref2[r2_i];
                        if(ref2.hasOwnProperty(r2_i)){
                            merge[r2_i] = r2;
                        }
                    }
                    for(var r1_i in ref1){
                        var r1 = ref1[r1_i];
                        if(ref1.hasOwnProperty(r1_i) && !merge.hasOwnProperty(r1_i)){
                            merge[r1_i] = r1;
                        }
                    }
                }

                if(deep_copy === true){
                    merge = jk.deep_copy({val: merge});
                }
                return merge;
            },
            merge_to: function merge_to(from, to, options) {
                var searched = {};
                var props = [{
                    f: from,
                    t: to,
                }];
                for(var i = 0; i < props.length; i++){
                    var p = props[i];
                    var f = p.f;
                    var t = p.t;
                    var f_loopable = jk.is_loopable(f);
                    var t_loopable = jk.is_loopable(t);
                    if(f_loopable && t_loopable){
                        for(var fli_i in f){
                            var fli = f[fli_i];
                            t[fli_i] = fli;
                        }
                    }
                }
                return to;
            },

            js_to_html: (function() {
                function js_to_html(vals, options) {
                    if(jk.typeof(vals) != 'array'){ return ''; }
                    var s = jk.js_to_html.prototype;
                    var strs = [];
                    s.traverse(vals, options, strs);
                    return strs.join('');
                }
                js_to_html.prototype = {
                    keywords: { t:1, tso: 1, tsc: 1, c: 1 },
                    traverse: function traverse(vals, options, strs, level) {
                        if(jk.typeof(vals) != 'array'){ return ''; }
                        var options = options || {};
                        var level = /number/.test(jk.typeof(level)) ? level : 0;
                        var tabs = '';
                        var tab = options.tab || '\t';
                        var newline = options.newline || '\n';
                        var start_break = '';
                        var end_break = '';
                        if (options.beautify) {
                            for(var i = 0; i < level; i++){
                                tabs += tab;
                            }
                            end_break = [newline,tabs].join('');
                        }
                        var s = jk.js_to_html.prototype;
                        var keywords = s.keywords;
                        for(var i = 0; i < vals.length; i++){
                            var val = vals[i];
                            if(options.traverse) options.traverse(val, options);
                            start_break = strs.length == 0 ? '' : end_break;
                            var val_typeof = jk.typeof(val);
                            if(val_typeof == 'string'){
                                strs.push([start_break,val].join(''));
                                continue;
                            }
                            var attrs = [];
                            for(var vli_i in val){
                                if(keywords[vli_i]) continue;
                                var vli = val[vli_i];
                                // TODO @prop_keyword = prop_keyword support and @@keyword = @keyword
                                var prop_str = vli_i;
                                var vli_to = jk.typeof(vli);
                                if(vli_to == 'string') attrs.push([prop_str,'="',vli,'"'].join(''));
                                else if(vli_to == 'object') attrs.push([prop_str,"='",jk.stringify(vli),"'"].join(''));
                                else attrs.push(prop_str);
                            }
                            var attrs_str = attrs.length == 0 ? '': ' ' + attrs.join(' ');
                            if(val.t) strs.push([start_break,'<',val.t,attrs_str,'>'].join(''));
                            if(val.tso) strs.push([start_break,'<',val.tso,attrs_str,'>'].join(''));
                            if(val.tsc) strs.push([start_break,'<',val.tsc,attrs_str,'/>'].join(''));

                            if(val.c) {
                                s.traverse(val.c, options, strs, level+1);
                                if(val.t) strs.push([end_break,'</',val.t,'>'].join(''));
                            }
                            else if(val.t) strs.push(['</',val.t,'>'].join(''));
                        }
                    }
                };
                return js_to_html;
            })(),

            js_to_css: (function() {
                function js_to_css(vals, options) {
                    if(jk.typeof(vals) != 'array'){ return ''; }
                    var s = jk.js_to_css.prototype;
                    var strs = [];
                    s.traverse(vals, options, strs);
                    return strs.join('');
                }
                js_to_css.prototype = {
                    keywords: { s:1, c:1 },
                    traverse: function traverse(vals, options, strs, level, par_path) {
                        if(jk.typeof(vals) != 'array'){ return ''; }
                        var options = options || {};
                        var par_path = par_path || '';
                        var level = /number/.test(jk.typeof(level)) ? level : 0;
                        var tabs = '';
                        var tab = options.tab || '\t';
                        var newline = options.newline || '\n';
                        var start_break = '';
                        var prop_break = '';
                        var end_break = '';
                        if (options.beautify) {
                            // for(var i = 0; i < level; i++){
                            //     tabs += tab;
                            // }
                            prop_break = [newline,tabs,tab].join('');
                            end_break = [newline,tabs].join('');
                        }
                        var s = jk.js_to_css.prototype;
                        var keywords = s.keywords;
                        for(var i = 0; i < vals.length; i++){
                            var val = vals[i];
                            if(options.traverse) options.traverse(val, options);
                            start_break = strs.length == 0 ? '' : end_break;

                            var val_to = jk.typeof(val);
                            if(val_to == 'object'){
                                if(val.s) strs.push([start_break,par_path,val.s,'{'].join(''));

                                for(var vli_i in val){
                                    if(keywords[vli_i]) continue;
                                    var vli = val[vli_i];
                                    // TODO @prop_keyword = prop_keyword support and @@keyword = @keyword
                                    var prop_str = vli_i;
                                    var vli_to = jk.typeof(vli);
                                    if(jk.typeof(vli) == 'string') strs.push([prop_break,prop_str,':',vli,';'].join(''));
                                }

                                if(val.s) strs.push([end_break,'}'].join(''));

                                if(val.c) s.traverse(val.c, options, strs, level+1, val.s);
                            }
                            else if(val_to == 'string'){
                                strs.push([start_break,val].join(''));
                            }
                        }
                    }
                };
                return js_to_css;
            })(),

            html_to_dom: (function() {
                function html_to_dom(html, args) {
                    var dom_node = html;
                    if(typeof html == 'string'){
                        dom_node = document.createElement('div');
                        dom_node.innerHTML = html;
                    }
                    hp.generate({ dom_node: dom_node, s: args ? args.s: null, p: args ? args.p : null });
                    return dom_node;
                }
                var hp = html_to_dom.prototype = {
                    generate: function generate(args) {
                        var dom_node = args.dom_node;
                        var s = args.s;
                        var jk_doms = dom_node.querySelectorAll('[jk]');
                        var i = jk_doms.length;
                        while (i--) {
                            var li = jk_doms[i];
                            var jk_attr = li.getAttribute('jk');
                            li.setAttribute('jkm', jk_attr);
                            li.removeAttribute('jk');                            
                            var jka_val = { type: jk_attr };
                            try {
                                jka_val = jk.parse(jk_attr);
                            } catch (e) {}
                            var jka_type = jka_val.t || jka_val.type;
                            var jka_module = jk.dom_modules[jka_type];
                            if(jka_module && jka_module.html){
                                var jka_val_p = jka_val.p;
                                var p = args.p && jka_val_p ? [args.p, jka_val_p || ''].join('.') : jka_val_p || args.p || '';
                                var bp = p ? p + '.': '';
                                var jkao_dp = jk.html_to_dom(jka_module.html, {s:s,p:p});
                                var jkao_dom_nodes = jkao_dp.children;
                                var li_parent = li.parentNode;
                                var jka_object = { s: s, p: p, bp: bp, parent: li_parent };
                                var attrs = li.attributes;
                                var j = jkao_dom_nodes.length;
                                while (j--) {
                                    var jkaodn = jkao_dom_nodes[j];
                                    jkaodn.jk = jka_object;
                                    if (li.hasAttributes()) {
                                        var k = attrs.length;
                                        while (k--) {
                                            var attr = attrs[k];
                                            var attr_name = attr.name;
                                            var attr_value = attr.value;
                                            var jk_attr_value = jkaodn.getAttribute(attr_name);
                                            if(attr_name == 'class'){
                                                jkaodn.setAttribute(attr_name, jk_attr_value ? [jk_attr_value,attr_value].join(' '): attr_value);
                                            }
                                            else if(attr_name == 'style'){
                                                jkaodn.setAttribute(attr_name, jk_attr_value ? [jk_attr_value,attr_value].join(''): attr_value);
                                            }
                                            else {
                                                jkaodn.setAttribute(attr_name, attr_value);
                                            }
                                        }
                                    }
                                    li_parent.insertBefore(jkaodn, li.nextSibling);
                                }
                                li_parent.removeChild(li);
                                hp.generate({ dom_node: li_parent, args: args });
                                if(jka_module.on_init){
                                    jka_module.on_init.call(jka_object);
                                }
                            }
                        }
                    },
                    modules: {},
                };
                return html_to_dom;
            })(),
            dom_modules: {},

            diff: function diff(old_str, new_str, options) {
                var options = jk.typeof(options) == 'object' ? options : {};
                var splitter = options.splitter != undefined ? options.splitter : '';
                var ret_type = options.ret_type || 'normal'; // transform

                var os = old_str == "" ? [] : old_str.split(splitter);
                var ns = new_str == "" ? [] : new_str.split(splitter);

                var diff_list = [];
                var oi = [];
                var ni = [];
                for (var i = 0; i < os.length; i++) {
                    oi.push(false);
                    var o = os[i];
                    var diff = { 
                        oi: i, 'match':{ni:0,'len':0}, 'mismatch':{ni:0,'len':0}
                    };
                    diff_list.push(diff);
                    // handle multiple diff?
                    for (var j = 0; j < ns.length; j++) {
                        if (i == 0) { ni.push(false); }
                        var n = ns[j];
                        var ni_diff = j - diff.match.ni;
                        var on_val = os[diff.oi+ni_diff];
                        if (on_val == n && diff.mismatch.len == 0) {
                            diff.match.len++;
                        }
                        else if (o == n) {
                            var diff = { 
                                oi: i, 'match':{ni:j,'len':1}, 'mismatch':{ni:0,'len':0}
                            };
                            diff_list.push(diff);
                        }
                        else {
                            diff.mismatch.len++;
                        }
                    }
                }
                // diff_list.sort(function(a,b){
                //     switch(true){
                //         case a.match.ni > b.match.ni: return 1;
                //         case a.match.ni < b.match.ni: return -1;
                //         case a.match.len > b.match.len: return -1;
                //         case a.match.len < b.match.len: return 1;
                //     }
                //     return 0;
                // });
                
                var last_oi = 0;
                var last_ni = 0;
                var changes = [];
                for(var i in diff_list){
                    var d = diff_list[i];
                    var om = 0;
                    var nm = 0;

                    if (i != 0) {
                        for (var j = d.oi; j < d.oi + d.match.len; j++) {
                            if (oi[j] == true) {
                                om++;
                                break;
                            }
                        }
                        if (om == 0) {
                            for (var j = d.match.ni; j < d.match.ni + d.match.len; j++) {
                                if (ni[j] == true) {
                                    nm++;
                                    break;
                                }
                            }
                        }
                    }
                    

                    if (om == 0 && nm == 0 && d.match.len != 0) {
                        // append removed string
                        if (last_oi < d.oi && oi[last_oi] == false) {
                            var change = '<';
                            for (var j = last_oi; j < d.oi; j++) {
                                if (oi[j] == false) {
                                    oi[j] = true;
                                    change += os[j];
                                }
                            }
                            changes.push(change);
                            last_oi = d.oi;
                        }
                        // append added string
                        if (last_ni < d.match.ni && ni[last_ni] == false) {
                            var change = '>';
                            for (var j = last_ni; j < d.match.ni; j++) {
                                if (ni[j] == false) {
                                    change += ns[j];
                                    ni[j] = true;
                                }
                            }
                            changes.push(change);
                            last_ni = d.match.ni;
                        }
                        
                        // append unchanged string
                        var change = '^';
                        var oi_end = d.oi + d.match.len;
                        for (var j = d.oi; j < oi_end; j++) {
                            oi[j] = true;
                            change += os[j];
                        }
                        changes.push(change);
                        last_oi = oi_end;
                        var ni_end = d.match.ni + d.match.len;
                        for (var j = d.match.ni; j < ni_end; j++) {
                            ni[j] = true;
                        }
                        last_ni = ni_end;
                    }
                }
                // append removed string
                if (last_oi < os.length && oi[last_oi] == false) {
                    var change = '<';
                    for (var j = last_oi; j < os.length; j++) {
                        change += os[j];
                    }
                    changes.push(change);
                    last_oi = os.length;
                }
                // append added string
                if (last_ni < ns.length && ni[last_ni] == false) {
                    var change = '>';
                    for (var j = last_ni; j < ns.length; j++) {
                        change += ns[j];
                    }
                    changes.push(change);
                    last_ni = ns.length;
                }

                if(old_str == '' && new_str != ''){
                    changes = ['>'+new_str];
                }
                
                var ret_val = changes;
                if(ret_type == 'transform') {
                    var cur_index = 0;
                    var transforms = [];
                    for (var i = 0; i < changes.length; i++){
                        var c = changes[i];
                        var ctype = c.slice(0,1);
                        if (ctype != '^'){
                            transforms.push(c);
                        }
                        else {
                            var cias = jk.cias(c.length - 1);
                            var val = c.length -1;
                            if(val.toString().length > cias.length + 2){
                                val = cias;
                            }
                            transforms.push(val);
                        }
                    }
                    ret_val = transforms;
                }

                return ret_val;
            },
            diff_transform: function diff_transform(args) {
                var args = args || {};
                var head = args.head;
                var type = args.type;
                var diffs = args.diffs;
                var ret_val;
                if(head && diffs){
                    var transform = head;
                    var i_offset = 0;
                    for (var i = 0; i < diffs.length; i++) {
                        var d = diffs[i];
                        if (typeof d == 'string' && !/^<|^>/.test(d.slice(0,1))){
                            var d_type = d.slice(0,1);
                            var d_val = d.slice(1);
                            var val_len = d_val.length;
                            if( ( type == 'next' && d_type == '<' ) || ( type != 'next' && d_type == '>' ) ) {
                                transform = transform.slice(0, i_offset) + transform.slice(i_offset + val_len);
                            }
                            else {
                                transform = transform.slice(0, i_offset) + d_val + transform.slice(i_offset);
                                i_offset += val_len;
                            }
                        }
                        else {
                            if (typeof d == 'number'){
                                i_offset += d;
                            }
                            else if(typeof d == 'string'){
                                i_offset += jk.cias(d);
                            }
                        }
                        
                    }

                    ret_val = transform;
                }
                return ret_val;
            },

            async_recursive: function(args) {
                var complete = args.complete;
                var call = {
                    checks: 0,
                    wait: function(){ call.checks++; },
                    done: function(){
                        if (call.checks != 0){
                            call.checks--; call.check(); 
                        }
                    },
                    check: function(){
                        if (call.checks == 0) {
                            complete();
                        }
                    }
                }
                return call;
            },
            async_parallel: function(args) {
                var complete = args.complete;
                var call = {
                    checks: 0,
                    done: function(){
                        if (call.checks != 0){
                            call.checks--; call.check(); 
                        }
                    },
                    check: function(){
                        if (call.checks == 0) {
                            complete();
                        }
                    }
                }
                var fns = args.fns;
                for (var i = 0; i < fns.length; i++) {
                    var fn = fns[i];
                    call.checks++;
                }
                for (var i = 0; i < fns.length; i++) {
                    var fn = fns[i];
                    fn();
                }
                return call;
            },

            __init__: function(){
                jk.cias.prototype.__init__();
                jk.huid.prototype.__init__();

                delete jk.__init__;
            },
        };

        jk.__init__();
        
        return jk;
    })();
});