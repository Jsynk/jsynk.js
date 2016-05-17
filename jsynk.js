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

        function jSynk() {};
        var jk = new jSynk();
        var jkp = jSynk.prototype;

        jkp.this = this;
        jkp.prev_jk_ref = jkp.this.jk;
        jkp.noConflict = function() {
            var cur_ref = jk;
            jk = jk.prev_jk_ref;
            return cur_ref;
        }
        jkp.fn = jkp;

        jkp.env = {};
        if (typeof window == 'object' && window !== null) {
            jkp.env['browser'] = true;
        }
        if (typeof Cordova == 'object' && Cordova !== null) {
            jkp.env['cordova'] = true;
        }
        if (typeof jxcore == 'object' && jxcore !== null) {
            jkp.env['jxcore'] = true;
        }
        if (typeof exports === 'object' && exports !== null) {
            jkp.env['nodejs'] = true;
        }

        jkp.utf8_to_b64 = function( str ) {
            if (jk.env['browser']) {
                return window.btoa(unescape(encodeURIComponent( str )));
            }
            return str;
        }
        jkp.b64_to_utf8 = function( str ) {
            if (jk.env['browser']) {
                return decodeURIComponent(escape(window.atob( str )));
            }
            return str;
        }

        jkp.guid = function(parts) {
            var parts = parts || 10;
            var ret_val = '';
            for (var i = 0; i < parts; i++) {
                ret_val += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return ret_val;
        }
        jkp.type = function(ref) {
            if (ref === null){return "Null";}
            else if (ref === undefined){return "Undefined";}
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec((ref).constructor.toString());
            return (results && results.length > 1) ? results[1] : "";
        }
        jkp.typeof = function(ref) {
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
            return ret_val;
        }
        jkp.pathval = function(args) {
            var args_type = jk.typeof(args);
            var ret_val;
            if (args_type == 'array') {
                var cur_val = args[0];
                var start_val = 1;
                var sv_type = jk.typeof(cur_val);
                if (sv_type == 'string') {
                    start_val = 0;
                    cur_val = jk.this;
                }
                for (var i = start_val; i < args.length; i++) {
                    var LI = args[i];
                    var cv_type = jk.typeof(cur_val);
                    if (!/null|undefined/.test(cv_type) && cur_val.hasOwnProperty(LI)) {
                        cur_val = cur_val[LI];
                    }
                    else {
                        cur_val = undefined;
                    }
                }
                ret_val = cur_val;
            }
            return ret_val;
        }

        jkp.is_same = function(ref1, ref2) {
            var ret_val = false;
            var ref1_typeof = typeof(ref1);
            var ref2_typeof = typeof(ref2);
            if (ref1_typeof == ref2_typeof) {
                if (ref1_typeof == 'object') {
                    if (ref1 == null && ref2 == null) {
                        ret_val = true;
                    }
                    else if (ref1 != null && ref2 != null) {
                        var ref1_type = jk.type(ref1);
                        var ref2_type = jk.type(ref2);
                        if (ref1_type == 'Array' && ref2_type == 'Array') {
                            ret_val = true;
                        }
                        else if (ref1_type != 'Array' && ref2_type != 'Array') {
                            ret_val = true;
                        }
                    }
                }
                else if (ref1_typeof == 'undefined') {
                    ret_val = true;
                }
                else if (ref1.toString() == ref2.toString()) {
                    ret_val = true;
                }
            }
            return ret_val;
        }
        jkp.is_loopable = function(ref) {
            return ref != null ? /object|function/.test(typeof(ref)) ? true : false : false;
        }
        // mix deep copy and partial deep copy
        jkp.deep_copy_same = function(ref) { //dcs regex, date? change to ref copy?
            var ref_js_type = jk.typeof(ref);
            var ret_val = ref;
            if (ref_js_type == 'object') {
                ret_val = {};
                for (var ref_i in ref) {
                    ret_val[ref_i] = ref[ref_i];
                }
            }
            else if (ref_js_type == 'array') {
                ret_val = [];
                for (var i = 0; i < ref.length; i++) {
                    ret_val.push(ref[i]);
                }
            }
            else if (ref_js_type == 'function') {
                ret_val = eval(ref.toString());
            }
            return ret_val;
        }
        jkp.deep_copy = function(args) {
            var args_js_type = jk.typeof(args);
            var ret_val;
            if (args_js_type == 'object') {
                var val = args.val;
                var parent = {};
                var par_index = 'result';
                var p_ref_and_ignore = args.p_ref_and_ignore || /^p_ref_and_ignore$/;
                var p_ignore = args.p_ignore || /^p_ignore$/;
                var options = jk.typeof(args.options) == 'object' ? args.options : {};
                jk.deep_copy_recursive({
                    'val': val,
                    'parent': parent,
                    'par_index': par_index,
                    'p_ref_and_ignore': p_ref_and_ignore,
                    'p_ignore': p_ignore,
                    'options': options
                });
                ret_val = parent['result'];
            }
            return ret_val;
        }
        jkp.deep_copy_recursive = function(args) {
            var args_js_type = jk.typeof(args);
            var ret_val;

            if (args_js_type == 'object') {
                var val = args.val;
                var parent = args.parent;
                var par_index = args.par_index;
                var p_ref_and_ignore = args.p_ref_and_ignore || /^p_ref_and_ignore$/;
                var p_ignore = args.p_ignore || /^p_ignore$/;
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
                            for (var i in val) {
                                var v = val[i];
                                jk.deep_copy_recursive({
                                    'val': v,
                                    'parent': parent[par_index],
                                    'par_index': i,
                                    'p_ref_and_ignore': p_ref_and_ignore,
                                    'p_ignore': p_ignore,
                                    'level': level + 1
                                });
                            }
                            break;
                        case 'array':
                            parent[par_index] = [];
                            for (var i = 0; i < val.length; i++) {
                                var v = val[i];
                                parent[par_index].push(false);
                                jk.deep_copy_recursive({
                                    'val': v,
                                    'parent': parent[par_index],
                                    'par_index': i,
                                    'p_ref_and_ignore': p_ref_and_ignore,
                                    'p_ignore': p_ignore,
                                    'level': level + 1
                                });
                            }
                            break;
                        case 'function':
                            eval('parent[par_index] = ' + val.toString());
                            break;
                        case 'date':
                            parent[par_index] = new Date(val.getTime())
                            break;
                        case 'regexp':
                            eval('parent[par_index] = ' + val.toString());
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
        jkp.is_index_match = function(args) {
            var args_js_type = jk.typeof(args);
            var ret_val;
            if (args_js_type == 'object') {
                var index = args.index;
                var match = args.match || /^match$/;

                var match_js_type = jk.type(match);

                if (match_js_type == 'RegExp') {
                    ret_val = match.test(index);
                }
                else {
                    ret_val = match == index;
                }
            }
            return ret_val;
        }
        jkp.traverse_fun = function(args) {
            var args = args || {};
            var fn = args.fn;
            var fn_args = args.fn_args;
            if (typeof fn == 'function') {
                fn(fn_args, fn);
            }
        }
        

        jkp.get_option = function(opt_list, prop){
            var ret_val;
            for (var i = 0; i < opt_list.length; i++) {
                var opt_li = opt_list[i];
                if (opt_li && opt_li.hasOwnProperty(prop)){
                    ret_val = opt_li[prop];
                    break;
                }
            }
            return ret_val;
        }
        jkp.get_typeofs = function(args){
            var ret_val = {};
            for (var i in args){
                ret_val[i] = jk.typeof(args[i]);
            }
            return ret_val;
        }
        jkp.get_arguments = function(args){
            var ret_val = [];
            for(var i in args){
                var a = args[i];
                if(a !== undefined) {
                    ret_val.push(a);
                }
                else {
                    break;
                }
            }
            return ret_val;
        }

        function jSub(args) {
            var args = args || {};
            this._instance = {
                'args': args,
                'rev': {
                    'changes': {},
                    'current': '',
                    'max_history': 1
                },
                'sub': {
                    'list': []
                },
                'version': '1.0.0'
            };
            if (args.max_history != undefined) {
                this._instance.rev.max_history = args.max_history;
            }
            if (args.value != undefined) {
                this.set({
                    'value': args.value
                });
            }
        }
        var jsp = jSub.prototype;
        jkp.jSub = jSub;

        jsp.get = function(args) {
            var args_typeof = jk.typeof(args);
            var options;
            if (args_typeof == 'object') {
                options = args;
            }
            else if (args_typeof == 'string') {
                options = {'path': args};
            }
            else{
                options = {};
            }
            var path = options.path || '';
            var instance = options.instance || this._instance;
            var rev_id = options.rev_id || instance.rev.current;
            var rev_id_changes = instance.rev.changes[rev_id];
            var ret_val;
            var history = jk.typeof(options.history) == 'number' ? options.history: 0;
            if (history == 0) {
                if (rev_id_changes) {
                    var rev_indexes = rev_id_changes.indexes;
                    if (rev_indexes) {
                        if (rev_indexes.hasOwnProperty(path)) {
                            ret_val = rev_indexes[path];
                        }
                    }
                }
            }
            else {
                ret_val = [];
                jk.traverse_fun({
                    'fn': function(args, fn) {
                        args.list.push(args.self.get({'path':args.path,'rev_id':args.target_rev}));
                        var rev = args.self._instance.rev;
                        var rev_changes = rev.changes;
                        var cur_rev_change = rev_changes[args.target_rev];
                        var crbf = cur_rev_change ? cur_rev_change.branches.from : undefined;
                        if (args.history > args.branch_level) {
                            if (crbf) {
                                fn({
                                    'target_rev': crbf,
                                    'branch_level': args.branch_level + 1,
                                    'self': args.self,
                                    'path': args.path,
                                    'list': args.list,
                                    'history': args.history
                                }, fn);
                            }
                        }
                    },
                    'fn_args': {
                        'target_rev': rev_id,
                        'branch_level': 0,
                        'self': this,
                        'path': path,
                        'list': ret_val,
                        'history': history
                    }
                });
            }
            
            return ret_val;
        }
        jsp.set = function(a0, a1) {
            var a = jk.get_arguments([a0, a1]);
            var has_val = false;
            var value, path, paths, instance, ignore;

            var typeofs = jk.get_typeofs(a);

            if (a.length == 1) {
                if (typeofs[0] == 'object') {
                    value = a0.value;
                    path = a0.path || '';
                    paths = [''];
                    instance = a0.instance || this._instance;
                    ignore = a0.ignore || instance.ignore || /^p_ignore$/;

                    has_val = true;
                }
            }
            else if (a.length == 2) {
                if (typeofs[0] == 'string') {
                    value = a[1];
                    path = a[0] || '';
                    paths = [''];
                    instance = this._instance;
                    ignore = instance.ignore || /^p_ignore$/;

                    has_val = true;
                }
            }

            if (has_val) {

                var rev = instance.rev;
                var changes = rev.changes;

                var path_type = jk.type(path);
                if (path_type == 'String') {
                    paths = path.split('.');
                }
                else if (path_type == 'Array') {
                    paths = path;
                    path = paths.join('.');
                }

                var cur_val = this.get({
                    'path': path,
                    'instance': instance
                });

                var cur_indexes = {};
                var cur_changes_indexes = {
                    'text_indexes': '',
                    'path_indexes': {},
                    'paths': [],
                    'length': 0
                };

                var min_diffs = jk.pathval([instance,'args','min_diffs']);
                if (min_diffs) {
                    cur_changes_indexes['path_str_indexes'] = {};
                }

                var get_diffs = path == '' ? true : cur_val != undefined ? true : false;
                if (!get_diffs && path) {
                    var cur_path_parent = paths.slice(0, -1).join('.');
                    var cur_val_parent = this.get({
                        'path': cur_path_parent,
                        'instance': instance
                    });
                    var is_loopable_cur_val_parent = jk.is_loopable(cur_val_parent);
                    if (is_loopable_cur_val_parent) {
                        get_diffs = true;
                    }
                }
                if (get_diffs) {
                    this.get_from_diffs({
                        'path': path,
                        'f': cur_val,
                        't': value,
                        'indexes': cur_indexes,
                        'change_indexes': cur_changes_indexes,
                        'instance': instance,
                        'ignore': ignore
                    });
                    this.get_to_diffs({
                        'path': path,
                        'f': cur_val,
                        't': value,
                        'indexes': cur_indexes,
                        'change_indexes': cur_changes_indexes,
                        'instance': instance,
                        'ignore': ignore
                    });
                }
                cur_changes_indexes.text_indexes = cur_changes_indexes.paths.join('\n')

                if (cur_changes_indexes.length > 0) {
                    // reference unchanged refernce
                    if (path != '' && rev.current != '') {
                        var prev_indexes = changes[rev.current].indexes;
                        for (var i_i in prev_indexes) {
                            if (!cur_indexes.hasOwnProperty(i_i)) {
                                cur_indexes[i_i] = prev_indexes[i_i];
                            }
                        }
                        // merge old refs with new refs
                        var old_base = prev_indexes[''];
                        var base = jk.deep_copy_same(old_base);
                        cur_indexes[''] = base;
                        var cur_base_path = '';
                        var cur_base_ref = base;
                        for (var p_i in paths) {
                            var p = paths[p_i];
                            cur_base_path = cur_base_path == '' ? p : cur_base_path + '.' + p;
                            if (cur_base_path != path) {
                                var dcs = jk.deep_copy_same(prev_indexes[cur_base_path]);
                                cur_base_ref[p] = dcs;
                                cur_base_ref = dcs;
                                cur_indexes[cur_base_path] = dcs;
                            }
                            else {
                                cur_base_ref[p] = cur_indexes[path];
                                cur_base_ref = cur_indexes[path];
                            }
                        }
                    }
                    // save revision
                    var rev_guid = jk.guid();
                    var cur_branches = {};
                    if (rev.current) {
                        cur_branches = { from: rev.current }
                        var prev_branches = changes[rev.current].branches;
                        if (!prev_branches.to) {
                            prev_branches.to = {};
                        }
                        prev_branches.to[rev_guid] = true;
                    }

                    var prev_rev = rev.current;

                    var rev_change = {
                        'diffs': cur_changes_indexes,
                        'indexes': cur_indexes,
                        'branches': cur_branches,
                        'date': new Date().getTime()
                    };                 
                    changes[rev_guid] = rev_change;
                    rev.current = rev_guid;

                    if (min_diffs) {
                        var vals = this.get({'path':'',history:1});
                        var cur_rootval_str = jk.stringify(vals[0]);
                        var min_diff = {
                            head: cur_rootval_str,
                            diffs: jk.diff_chars(jk.stringify(vals[1]), cur_rootval_str)
                        }
                        rev_change['min_diffs'] = min_diff;
                        // console.log(min_diff.diffs);
                    }

                    // keep desired history
                    if (rev.max_history >= 0) {
                        jk.traverse_fun({
                            'fn': function(args, fn) {
                                var rev = args.instance.rev;
                                var rev_changes = rev.changes;
                                var cur_rev_change = rev_changes[args.target_rev];
                                var crbf = cur_rev_change ? cur_rev_change.branches.from : undefined;
                                if (crbf) {
                                    fn({
                                        'target_rev': crbf,
                                        'branch_level': args.branch_level + 1,
                                        'instance': args.instance
                                    }, fn);
                                }
                                // TODO? remove .from from last?
                                if (rev.max_history < args.branch_level) {                            
                                    delete rev_changes[args.target_rev];
                                }
                            },
                            'fn_args': {
                                'target_rev': rev.current,
                                'branch_level': 0,
                                'instance': instance
                            }
                        });
                    }

                    // collect subscribers with changes awaiting
                    var sub_event_list = [];
                    var instance_sub_list = instance.sub.list;
                    for (var i = 0; i < instance_sub_list.length; i++) {
                        var sub = instance_sub_list[i];
                        var path_type = jk.type(sub.path);
                        if (path_type == 'String') {
                            var change_index = cur_changes_indexes.path_indexes[sub.path];
                            if (change_index != undefined) {
                                sub_event_list.push({
                                    'sub': sub,
                                    'paths': [sub.path]
                                });
                            }
                        }
                        else if (path_type == 'RegExp') {
                            var matches = cur_changes_indexes.text_indexes.match(sub.path);
                            if (matches != null) {
                                if (!sub.once) {
                                    for (var j = 0; j < matches.length; j++) {
                                        var match = matches[j];
                                        var change_index = cur_changes_indexes.path_indexes[match];
                                        if (change_index != undefined) {
                                            sub_event_list.push({
                                                'sub': sub,
                                                'paths': [match]
                                            });
                                        }
                                    }
                                }
                                else {
                                    var change_indexes = [];
                                    for (var j = 0; j < matches.length; j++) {
                                        var match = matches[j];
                                        var change_index = cur_changes_indexes.path_indexes[match];
                                        if (change_index != undefined) {
                                            change_indexes.push(change_index);
                                        }
                                    }
                                    if (change_indexes.length > 0) {
                                        sub_event_list.push({
                                            'sub': sub,
                                            'paths': matches
                                        });
                                    }
                                }
                            }
                        }
                    }
                    // notify subscribers
                    for (var i = 0; i < sub_event_list.length; i++) {
                        var sli = sub_event_list[i];
                        var sub_data = {
                            'paths': sli.paths
                        };
                        // fn_apply? fn_context?
                        sli.sub.fn.call(this, sub_data, sli.sub.fn_args);
                    }
                }
            }
        }
        jsp.get_from_diffs = function(args) {
            var path = args.path;
            var f = args.f;
            var t = args.t;
            var indexes = args.indexes || {};
            var change_indexes = args.change_indexes;
            var instance = args.instance || this._instance;
            var ignore = args.ignore || instance.ignore || /^p_ignore$/;
            var ignore_js_type = jk.typeof(ignore);

            if (!indexes.hasOwnProperty(path)) {
                indexes[path] = t;
                if (!jk.is_same(f, t)) {
                    if (change_indexes) {
                        change_indexes.paths.push(path);
                        change_indexes.path_indexes[path] = true;
                        change_indexes.length++;
                        if (change_indexes.path_str_indexes) {
                            change_indexes.path_str_indexes[path] = {
                                same:jk.stringify(t),
                                recursive:jk.stringify(t,{recursive:false})
                            };
                        }
                    }
                }
            }
            var t_loopable = jk.is_loopable(t);
            var f_loopable = jk.is_loopable(f);
            if (f_loopable) {
                for (var fc_index in f) {
                    var fc = f[fc_index];
                    var fc_path = path ? path + '.' + fc_index : fc_index;
                    var continue_search = true;
                    if (ignore_js_type == 'regexp') {
                        if (ignore.test(fc_path)) {
                            continue_search = false;
                        }
                    }
                    else if (ignore === fc_path) {
                        continue_search = false;
                    }
                    if (continue_search) {
                        var tc = t_loopable ? t[fc_index] : undefined;
                        this.get_from_diffs({
                            'path': fc_path,
                            'f': fc,
                            't': tc,
                            'indexes': indexes,
                            'instance': instance,
                            'ignore': ignore,
                            'change_indexes': change_indexes
                        });
                    }
                }
            }
        }
        jsp.get_to_diffs = function(args) {
            var path = args.path;
            var f = args.f;
            var t = args.t;
            var indexes = args.indexes || {};
            var instance = args.instance || this._instance;
            var ignore = args.ignore || instance.ignore || /^p_ignore$/;
            var ignore_js_type = jk.typeof(ignore);
            var change_indexes = args.change_indexes;

            if (indexes[path] == undefined) {
                indexes[path] = t;
                if (!jk.is_same(f, t)) {
                    if (change_indexes) {
                        change_indexes.paths.push(path);
                        change_indexes.path_indexes[path] = true;
                        change_indexes.length++;
                        if (change_indexes.path_str_indexes) {
                            change_indexes.path_str_indexes[path] = {
                                same:jk.stringify(t,{recursive:false}),
                                recursive:jk.stringify(t),
                            };
                        }
                    }
                }
            }
            var t_loopable = jk.is_loopable(t);
            if (t_loopable) {
                for (var tc_index in t) {
                    var tc = t[tc_index];
                    var tc_path = path ? path + '.' + tc_index : tc_index;
                    var continue_search = true;
                    if (ignore_js_type == 'regexp') {
                        if (ignore.test(tc_path)) {
                            continue_search = false;
                        }
                    }
                    else if (ignore === tc_path) {
                        continue_search = false;
                    }
                    if (continue_search) {
                        var fc = this.get({
                            'path': tc_path,
                            'instance': instance
                        });
                        this.get_to_diffs({
                            'path': tc_path,
                            'f': fc,
                            't': tc,
                            'indexes': indexes,
                            'instance': instance,
                            'ignore': ignore,
                            'change_indexes': change_indexes
                        });
                    }
                }
            }
        }
        // Add options on what args return
        jsp.on = function(a0, a1, a2, a3) {
            var a = jk.get_arguments([a0, a1, a2, a3]);
            var has_val = false;
            var path, instance, namespace, fn, fn_args, once;

            var typeofs = jk.get_typeofs(a);

            if (a.length == 1) {
                if (typeofs[0] == 'object') {
                    path = a0.path || '';
                    instance = a0.instance || this._instance;
                    namespace = a0.namespace || '';
                    fn = a0.fn;
                    fn_args = a0.fn_args;
                    once = a0.once;

                    has_val = true;
                }
            }
            else if (a.length == 2) {
                if ((typeofs[0] == 'regexp' || typeofs[0] == 'string') && typeofs[1] == 'function') {
                    path = a[0] || '';
                    instance = this._instance;
                    namespace = '';
                    fn = a[1];

                    has_val = true;
                }
            }
            else if (a.length == 3) {
                if ((typeofs[0] == 'regexp' || typeofs[0] == 'string') && typeofs[1] == 'boolean' && typeofs[2] == 'function') {
                    path = a[0] || '';
                    instance = this._instance;
                    namespace = '';
                    fn = a[2];
                    once = a[1];

                    has_val = true;
                }
                else if ((typeofs[0] == 'regexp' || typeofs[0] == 'string') && typeofs[1] == 'string' && typeofs[2] == 'function') {
                    path = a[0] || '';
                    instance = this._instance;
                    namespace = a[1] || '';
                    fn = a[2];

                    has_val = true;
                }
            }


            if (has_val && fn) {
                instance.sub.list.push({
                    'path': path,
                    'fn': fn,
                    'fn_args': fn_args,
                    'namespace': namespace,
                    'once': once
                });
            }
        }
        jsp.off = function(args) {
            var args_typeof = jk.typeof(args);
            var instance = this._instance;
            var instance_sub_list = instance.sub.list;
            for (var i = instance_sub_list.length - 1; i >= 0; i--) {
                var sub = instance_sub_list[i];
                var remove = false;
                var ns = sub.namespace;
                if (args_typeof == 'string') {
                    if (args == ns) {remove = true; }
                }
                if (args_typeof == 'regexp') {
                    if (args.test(ns)) {remove = true; }
                }
                if (remove) { instance_sub_list.splice(i, 1); }
            }
        }
        // jsp.on_before_set = function(args) {}
        // jsp.off_before_set = function(args) {}

        jsp.debug = function(args){
            var ns = 'internal_jSub_debugger';
            this.off(ns);
            if (args){
                this.on({path:/^.*$/gm, namespace:ns, fn: function(e){
                    var val = jk.stringify(this.get(e.paths[0]), {recursive:false});
                    var log = [e.paths[0], val].join(' : ');
                    console.log(["'",log,"'"].join(''));
                    if(args === log){
                        // Step through stack trace 
                        // to locate where this value is set
                        debugger;
                    }
                }});
            }
        }

        jsp.mirror = function(args){
            var cur_inst = this;
            var inst = args.instance;

            var path = args.path || '';
            var from_path = args.from_path || '';
            // copy from whom ? inst always?
            cur_inst.set({'path':path,'value':inst.get(from_path)});

            var ns = args.namespace || jk.guid();

            var i_regex = new RegExp('^'+from_path+'.*$','gm');
            inst.on({'path':i_regex,'once':true,'namespace':ns,'fn':function(e){
                cur_inst.set({'path':path,'value':inst.get({'path':from_path})});
            }});

            var ci_regex = new RegExp('^'+path+'.*$','gm');
            cur_inst.on({'path':ci_regex,'once': true,'namespace': ns,'fn': function(e){
                inst.set({'path':from_path,'value':cur_inst.get({'path':path})});
            }});
            
            return ns;
        }
        


        function Agent(options){
            this._instance = {
                'missions': [],
                'current': -1,
                'last_mission_time': 0,
                'options': options,
            };
        }
        var ap = Agent.prototype;
        jkp.Agent = Agent;

        ap.default_options = {
            'catch_error': true,
            'capture_performance': true,
        }
        ap.get_option = function(prop){
            return jk.get_option([this._instance.options,this.default_options], prop);
        }
        ap.add_mission = function(args){
            var mission;
            var args_js_type = jk.typeof(args);
            if (args_js_type == 'function') {
                mission = {'fn':args};
            }
            else if (args_js_type == 'object' && typeof args.fn == 'function') {
                mission = args;
            }
            if (mission != undefined) {
                this._instance.missions.push(mission);
            }
        }
        ap.clear_missions = function(){
            this._instance.missions = [];
        }
        ap.run_missions = function(){
            this._instance.current = -1;
            var on_start = this.get_option('on_start');
            if (typeof on_start == 'function') {
                on_start.call(this);
            }
            // console.log('---- Missions started ----');
            this.next();
        }
        ap.next = function(){
            var instance = this._instance;

            if (instance.current > -1) {
                var on_mission_finish = this.get_option('on_mission_finish');
                if (typeof on_mission_finish == 'function') {
                    on_mission_finish.call(this);
                }
                // console.log('Mission ' + (instance.current+1) +' - finished after ' + (new Date().getTime()-instance.last_mission_time) + 'ms');
            }

            if (instance.missions.length > instance.current+1) {
                instance.current++;
                var cur_mission = instance.missions[instance.current];
                var ct_fn = cur_mission.fn;
                var ct_fn_args = cur_mission.fn_args;
                var ct_fn_apply = cur_mission.fn_apply;
                instance.last_mission_time = new Date().getTime();
                var catch_error = this.get_option('catch_error');
                if (catch_error) {
                    try{
                        if (ct_fn_apply) {
                            ct_fn.apply(this, ct_fn_apply);
                        }
                        else {
                            ct_fn.call(this, ct_fn_args);
                        }
                    }
                     catch(e){
                        var mission_name = jk.pathval([cur_mission,'name']) || (instance.current+1);
                        var on_mission_fail = this.get_option('on_mission_fail');
                        if (typeof on_mission_fail == 'function') {
                            on_mission_fail.call(this);
                        }
                        console.log('Mission ' + mission_name +' - failed after ' + (new Date().getTime()-instance.last_mission_time) + 'ms');
                        console.log(e);
                    }
                }
                else {
                    if (ct_fn_apply) {
                        ct_fn.apply(this, ct_fn_apply);
                    }
                    else {
                        ct_fn.call(this, ct_fn_args);
                    }
                }
                if (cur_mission.async !== true) {
                    this.next();
                }
            }
            else if (instance.missions.length == 0) {
                var on_missing_missions = this.get_option('on_missing_missions');
                if (typeof on_missing_missions == 'function') {
                    on_missing_missions.call(this);
                }
                // console.log('- no missions added to run -');
            }
            else {
                var on_complete = this.get_option('on_complete');
                if (typeof on_complete == 'function') {
                    on_complete.call(this);
                }
                // console.log('---- Missions finished ----');
            }
        }

        
        // package? run scripts on change? guids as uid? use jSub?
        function Depender(args){
            var sub = this.sub = new jk.jSub();
        }
        var dp = Depender.prototype;
        jkp.Depender = Depender;
        
        dp.packages = {};
        dp.dependency_tree = {};
        dp.add_package = function(args){
            this.packages[args.name] = args;
        }
        dp.get_package = function(args){
            return this.packages[args.name];
        }
        
        



        function Animator(args){};
        var anip = Animator.prototype;
        jkp.Animator = Animator;
        
        var raf = (function() {
            var ret_val;            
            var timeLast = 0;
            if(jk.env['browser']){
                ret_val = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            }
            if(!ret_val){
                ret_val = function(callback) {
                    var timeCurrent = (new Date()).getTime(), timeDelta;
                    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                    timeLast = timeCurrent + timeDelta;
                    return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
                };
            }
            return ret_val;
        })();
        
        anip.queue = [];
        anip.is_animating = false;
        anip.animate = function(args){
            var args_typeof = jk.typeof(args);
            if (args_typeof == 'object') {
                var from = args.from;
                var to = args.to;
                var fn = args.fn;
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
                        raf(this.tick);
                        // this.is_animating = true; // <-- ?!?
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
                    raf(this.tick);
                    // this.is_animating = true;
                }
            }
        }
        anip.tick = function(){
            var self = jk.Animator.prototype;
            var is_animating = false;
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
                    is_animating = true;
                }
                else {
                    remove.push(i);
                }
            }
            for (var i = remove.length - 1; i >= 0; i--) {
                var index = remove[i];
                queue.splice(index, 1);
            }
            self.is_animating = is_animating;            
            if (self.is_animating){
                raf(self.tick);
            }
        }
        anip.stop = function(args) {
            var args_typeof = jk.typeof(args);
            var self = jk.Animator.prototype;
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




        jkp.stringify = function(ref, options) {
            var jss_parts = [];
            this.stringify_recursive({
                'val': ref,
                'jss_parts': jss_parts,
                'options': options
            });
            return jss_parts.join('');
        }
        jkp.stringify_recursive = function(args, level) {
            var jss_parts = args.jss_parts;
            var val = args.val;
            var args = /object/.test(jk.typeof(args)) ? args : {};
            var options = /object/.test(jk.typeof(args.options)) ? args.options : {};
            var level = /number/.test(jk.typeof(level)) ? level : 0;
            var val_typeof = jk.typeof(val);
            switch (true) {
                case val_typeof == 'object':
                    jss_parts.push('{');
                    if (options.recursive !== false) {
                        var loop_index = 0;
                        for (var i in val) {
                            if (loop_index != 0) {
                                jss_parts.push(',');
                            }
                            var v = val[i];
                            if (options.beautify) {
                                jss_parts.push('\n');
                            }
                            jss_parts.push('"' + i.replace(/"/g,'\\"') + '":');
                            this.stringify_recursive({
                                'val': v,
                                'jss_parts': jss_parts,
                                'options': options
                            }, level + 1);
                            loop_index++;
                        }
                    }
                    jss_parts.push('}');
                    break;
                case val_typeof == 'array':
                    jss_parts.push('[');
                    if (options.recursive !== false) {
                        for (var i = 0; i < val.length; i++) {
                            if (i != 0) {
                                jss_parts.push(',');
                            }
                            var v = val[i];
                            this.stringify_recursive({
                                'val': v,
                                'jss_parts': jss_parts,
                                'options': options
                            }, level + 1);
                        }
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
        // jkp.validate = function(ref, options){}
        // jkp.validate_recursive = function(args, level) {}

        // IMPORTANT TODO - make secure remove support for self executing functions
        // Should never be used on client
        jkp.parse = function(ref, options) {
            var ret_val;
            eval('ret_val = ' + ref);
            return ret_val;
        }
        // jkp.parse_recursive = function(args, level) {}
        
        // arg fn parse does not work async, add support?
        function jMarkup(args) {}
        var jmp = jMarkup.prototype;
        jkp.jMarkup = jMarkup;
        
        jmp.parse = function(args){
            var markups = [];
            var cur_val = args.cur_val;
            var ms = [];
            var mstrs = [];
            this.parse_recursive({'markups': ms, 'mstrs': mstrs, 'cur_val': cur_val, 'fn': args.fn }); 
            var markup = mstrs.join('');
            return markup;
        }
        jmp.parse_recursive = function(args){
            var markups = args.markups;
            var mstrs = args.mstrs;
            var parent = args.parent;
            var fn = args.fn;
            var cur_val = args.cur_val;
            var typeof_cur_val = jk.typeof(cur_val);
            if (/array/.test(typeof_cur_val)) {
                for (var i = 0; i < cur_val.length; i++) {
                    var v = cur_val[i];
                    this.parse_recursive({
                        'markups': markups, 'mstrs': mstrs, 'cur_val': v, 'parent': parent, 'fn': fn
                    });
                }
            }
            else if (/object/.test(typeof_cur_val)) {
                var markup;
                var lt_val = cur_val['<'];
                var lt_typeof = jk.typeof(lt_val);
                if (lt_typeof == 'string') {
                    var markup = {'tag':lt_val,'attrs':{},'inner':[],'options':{},'children':[]};
                    markups.push(markup);
                    mstrs.push('<'+lt_val);
                }
                if (markup) {
                    var attrs_val = cur_val['a'];
                    var attrs_typeof = jk.typeof(attrs_val);
                    if (attrs_typeof == 'array') {
                        for (var i = 0; i+1 < attrs_val.length; i+=2) {
                            var attr1 = attrs_val[i];
                            var attr2 = attrs_val[i+1];
                            var attr1_typeof = jk.typeof(attr1);
                            var attr2_typeof = jk.typeof(attr2);
                            if (attr1_typeof == 'string' && attr2_typeof == 'string') {
                                markup.attrs[attr1] = attr2;
                            }
                        }
                    }
                    var attr_strs = []; // tag attrs
                    for (var attr_i in markup.attrs) {
                        var attr_val = {'type':'attr', 'attr':attr_i, 'val':markup.attrs[attr_i]}
                        if (fn) {
                            fn(attr_val);
                        }
                        if (attr_val.val) {
                            attr_strs.push(attr_val.attr+'="'+attr_val.val+'"');
                        }
                        else {
                            attr_strs.push(attr_val.attr);
                        }
                    }
                    if (attr_strs.length) { mstrs.push(' '); mstrs.push(attr_strs.join(' ')); }
                    mstrs.push('>');// start tag end

                    var gt_val = cur_val['>'];
                    var gt_typeof = jk.typeof(gt_val);

                    if (gt_typeof == 'string') {
                        markup.inner.push(gt_val);
                    }

                    if (markup.inner.length) { mstrs.push(markup.inner.join(' ')); } // innerhtml
                    
                    if (gt_typeof == 'array') {
                        for (var i = 0; i < gt_val.length; i++) {
                            var v = gt_val[i];
                            this.parse_recursive({
                                'markups': markup.children, 'mstrs': mstrs, 'cur_val': v, 'parent': markups, 'fn': fn
                            });
                        }
                    }
                    else if (gt_val === '') { markup.options['closed'] = 1; }
                    if (markup.options.closed !== 1) {
                        mstrs.push('</'+markup.tag+'>');
                    }
                }
            }
        }


        // Add , splitter + nesting?
        function jStylist(args) {}
        var jstp = jStylist.prototype;
        jkp.jStylist = jStylist;
        
        jstp.parse = function(args){
            var selectors = [];
            var cur_val = args.cur_val;
            var options = args.options;
            this.parse_recursive({'selectors': selectors, 'cur_val': cur_val});
            var css_strings = [];
            for (var i = 0; i < selectors.length; i++) {
                var s = selectors[i];
                css_strings.push(s.selector+'{');
                for (var attr_i in s.attrs) {
                    var attr = s.attrs[attr_i];
                    css_strings.push(attr_i+':'+attr+';');
                }
                css_strings.push('}');
            }
            var css = css_strings.join('');
            return css;
        }
        jstp.parse_recursive = function(args){
            var selectors = args.selectors;
            var cur_val = args.cur_val;
            var typeof_cur_val = jk.typeof(cur_val);
            var parent_path = args.parent_path || '';
            if (/array/.test(typeof_cur_val)) {
                for (var i = 0; i < cur_val.length; i++) {
                    var v = cur_val[i];
                    this.parse_recursive({
                        'selectors': selectors, 'cur_val': v, 'parent_path': parent_path
                    });
                }
            }
            else if (/object/.test(typeof_cur_val)) {

                var selector;

                var cur_path;
                var s_val = cur_val['s'];
                var s_typeof = jk.typeof(s_val);
                if (s_typeof == 'string') {
                    cur_path = [parent_path, s_val].join('');
                    selector = {'selector':cur_path,'attrs':{}};
                    selectors.push(selector);
                }

                if (selector) {

                    var attrs_val = cur_val['a'];
                    var attrs_typeof = jk.typeof(attrs_val);
                    if (attrs_typeof == 'array') {
                        for (var i = 0; i+1 < attrs_val.length; i+=2) {
                            var attr1 = attrs_val[i];
                            var attr2 = attrs_val[i+1];
                            var attr1_typeof = jk.typeof(attr1);
                            var attr2_typeof = jk.typeof(attr2);
                            if (attr1_typeof == 'string' && attr2_typeof == 'string') {
                                selector.attrs[attr1] = attr2;
                            }
                        }
                    }

                    var nesting_val = cur_val['n'];
                    var nesting_typeof = jk.typeof(nesting_val);
                    if (nesting_typeof == 'array') {
                        for (var i = 0; i < nesting_val.length; i++) {
                            var v = nesting_val[i];
                            this.parse_recursive({
                                'selectors': selectors, 'cur_val': v, 'parent_path': cur_path
                            });
                        }
                    }
                }
            }
        }


        jkp.diff = function( old_str, new_str, options) {
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
                        transforms.push(c.length - 1);
                    }
                }
                ret_val = transforms;
            }

            return ret_val;
        }
        jkp.diff_lines = function( o, n ) { return this.diff(o, n, {'splitter':'\n'} ); }
        jkp.diff_words = function( o, n ) { return this.diff(o, n, {'splitter':/\s+/} ); }
        jkp.diff_chars = function( o, n ) { return this.diff(o, n, {'splitter':''} ); }
        jkp.diff_transform = function(args) {
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
                    if (typeof d == 'string'){
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
                    else if (typeof d == 'number'){
                        i_offset += d;
                    }
                }

                ret_val = transform;
            }
            return ret_val;
        }


        function Async(args){}
        var asp = Async.prototype;
        jkp.Async = Async;
        
        asp.recursive = function(args){
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
        };
        asp.pararell = function(){};


        function Layout(args){
            this._instance = {
                sub: new jk.jSub()
            }
        }
        Layout.prototype = {}

        
        return jk;
    })();
});