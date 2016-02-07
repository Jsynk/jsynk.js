/* jsynk.js | License: MIT | Author: Jorge Andrés Guerra Guerra | jsynkk@gmail.com | jsynk.com */
;;;"Use strict";
(function(root, factory) {  
    if (typeof exports === 'object' && exports !== null) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
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
                                    'p_ignore': p_ignore
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
                                    'p_ignore': p_ignore
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
                        if (rev_indexes[path]) {
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
        jsp.set = function(args) {
            if (typeof(args) == 'object') {
                var value = args.value;
                var path = args.path || '';
                var paths = [''];
                var instance = args.instance || this._instance;
                var ignore = args.ignore || instance.ignore || /^p_ignore$/;

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

                    var rev_change = {
                        'diffs': cur_changes_indexes,
                        'indexes': cur_indexes,
                        'branches': cur_branches,
                        'date': new Date().getTime()
                    };
                    changes[rev_guid] = rev_change;
                    rev.current = rev_guid;

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

            if (indexes[path] == undefined) {
                indexes[path] = t;
                if (!jk.is_same(f, t)) {
                    if (change_indexes) {
                        change_indexes.paths.push(path);
                        change_indexes.path_indexes[path] = true;
                        change_indexes.length++;
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
        jsp.on = function(args) {
            var args = args || {};
            var path = args.path || '';
            var instance = args.instance || this._instance;
            var namespace = args.namespace || '';
            var fn = args.fn;
            var fn_args = args.fn_args;
            var once = args.once;

            if (fn) {
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
        jsp.on_before_set = function(args) {
            var args = args || {};
            var path = args.path || '';
            var instance = args.instance || this._instance;
            var namespace = args.namespace || '';
            var fn = args.fn;

            if (fn) {
                // instance.sub.rules.push({'path':path,'fn':fn, 'namespace': namespace});
                // todo index subs for unsubbing index[path] = {all:{subcribers_index},'namespace':[]}
            }
        }
        jsp.off_before_set = function(args) {}

        jsp.mirror = function(args){
            var cur_inst = this;
            var inst = args.instance;

            var path = args.path || '';
            var from_path = args.from_path || '';
            // copy from whom ? inst always?
            cur_inst.set({'path':path,'value':inst.get()});

            var i_regex = new RegExp(from_path+'.*','gm');
            inst.on({'path':i_regex,'once':true,'fn':function(e){
                cur_inst.set({'path':path,'value':inst.get({'path':from_path})});
            }});

            var ci_regex = new RegExp(path+'.*','gm');
            cur_inst.on({'path':ci_regex,'once': true, 'fn': function(e){
                inst.set({'path':from_path,'value':cur_inst.get({'path':path})});
            }});
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
            'catch_error': true
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
            // console.log('---- Missions started ----');
            this.next();
        }
        ap.next = function(){
            var instance = this._instance;

            if (instance.current > -1) {
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
                // console.log('- no missions added to run -');
            }
            else {
                // console.log('---- Missions finished ----');
            }
        }

        
        // package? run scripts on change? guids as uid? use jSub?
        function Depender(args){}
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
                    }
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
        // swing = Math.sin((Math.PI/2)*progress_precent)




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
                        for (var i in val) {
                            var v = val[i];
                            if (options.beautify) {
                                jss_parts.push('\n');
                            }
                            jss_parts.push('"' + i + '":');
                            this.stringify_recursive({
                                'val': v,
                                'jss_parts': jss_parts,
                                'options': options
                            }, level + 1);
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
            return eval(ref);
        }
        // jkp.parse_recursive = function(args, level) {}
        
        
        function jMarkup(args) {}
        var jmp = jMarkup.prototype;
        jkp.jMarkup = jMarkup;
        
        jmp.parse = function(args){
            var markups = [];
            var cur_val = args.cur_val;
            this.parse_recursive({'markups': markups, 'cur_val': cur_val});
            var markup_strings = [];
            this.stringify_recursive({'markups': markups, 'markup_strings': markup_strings});
            var markup = markup_strings.join('');
            return markup;
        }
        jmp.stringify_recursive = function(args){
            var mstrs = args.markup_strings;
            var ms = args.markups;
            for (var i = 0; i < ms.length; i++) {
                var m = ms[i];
                mstrs.push('<'+m.tag); // start tag
                var attr_strs = []; // tag attrs
                for (var attr_i in m.attrs) {
                    var attr = m.attrs[attr_i];
                    if (attr) {
                        attr_strs.push(attr_i+'="'+attr+'"');
                    }
                    else {
                        attr_strs.push(attr_i);
                    }
                }
                if (attr_strs.length) { mstrs.push(' '); mstrs.push(attr_strs.join(' ')); }
                mstrs.push('>');// start tag end

                if (m.inner.length) { mstrs.push(m.inner.join(' ')); } // innerhtml

                if (m.children.length) { // recursive child tags
                    this.stringify_recursive({'markups': m.children, 'markup_strings': mstrs});
                }

                if (m.options.closed !== 1) {
                    mstrs.push('</'+m.tag+'>');
                };
            }
        }
        jmp.parse_recursive = function(args){
            var markups = args.markups;
            var parent = args.parent;
            var cur_val = args.cur_val;
            var typeof_cur_val = jk.typeof(cur_val);
            if (/array/.test(typeof_cur_val)) {
                for (var i = 0; i < cur_val.length; i++) {
                    var v = cur_val[i];
                    this.parse_recursive({
                        'markups': markups, 'cur_val': v, 'parent': parent
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
                }
                if (markup) {
                    var gt_val = cur_val['>'];
                    var gt_typeof = jk.typeof(gt_val);
                    if (gt_typeof == 'array') {
                        for (var i = 0; i < gt_val.length; i++) {
                            var v = gt_val[i];
                            this.parse_recursive({
                                'markups': markup.children, 'cur_val': v, 'parent': markups
                            });
                        }
                    }
                    else if (gt_val === '') { markup.options['closed'] = 1; }
                    else if (gt_typeof == 'string') {
                        markup.inner.push(gt_val);
                    }

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
        


        jkp.diff = function( old_str, new_str, options ) {
            var options = jk.typeof(options) == 'object' ? options : {};
            var splitter = options.splitter != undefined ? options.splitter : '\n';

            var o = old_str == "" ? [] : old_str.split(splitter);
            var n = new_str == "" ? [] : new_str.split(splitter);

            var ns = {};
            var os = {};
            
            for (var i = 0; i < n.length; i++) {
                if ( ns[ n[i] ] == undefined ) { ns[ n[i] ] = { rows: [] }; }
                ns[ n[i] ].rows.push( i );
            }
            for (var i = 0; i < o.length; i++) {
                if ( os[ o[i] ] == undefined ) { os[ o[i] ] = { rows: [] }; }
                os[ o[i] ].rows.push( i );
            }
            for (var i in ns) {
                if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
                    n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
                    o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
                }
            }
            for (var i = 0; i < n.length - 1; i++) {
                if (n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length 
                    && o[ n[i].row + 1 ].text == null && n[i+1] == o[ n[i].row + 1 ]) {
                    n[i+1] = { text: n[i+1], row: n[i].row + 1 };
                    o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
                }
            }
            for (var i = n.length - 1; i > 0; i--) {
                if (n[i].text != null && n[i-1].text == null && n[i].row > 0 
                    && o[ n[i].row - 1 ].text == null && n[i-1] == o[ n[i].row - 1 ]) {
                    n[i-1] = { text: n[i-1], row: n[i].row - 1 };
                    o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
                }
            }

            var changes = [];
            var prev_change_type;

            function add_change(cur_change) {
                if (prev_change_type === cur_change.t) {
                    changes[changes.length-1].v += cur_change.v;
                }
                else {
                    changes.push(cur_change);
                }
                prev_change_type = cur_change.t;
            }
            
            if (n.length == 0) {
                for (var i = 0; i < o.length; i++) {
                    add_change({'t':'del','v': o[i]});
                }
            } else {
                if (n[0].text == null) {
                    for (j = 0; j < o.length && o[j].text == null; j++) {
                        add_change({'t':'del','v': o[j]});
                    }
                }
                for ( var i = 0; i < n.length; i++ ) {
                    if (n[i].text == null) {
                        add_change({'t':'add','v': n[i]});
                    } else {
                        add_change({'t':'same','v': n[i].text});
                        for (var j = n[i].row + 1; j < o.length && o[j].text == null; j++ ) {
                            add_change({'t':'del','v': o[j]});
                        }
                    }
                }
            }

            return changes;
        }
        jkp.diff_lines = function( o, n ) { return this.diff(o, n, {'splitter':'\n'} ); }
        jkp.diff_words = function( o, n ) { return this.diff(o, n, {'splitter':/\s+/} ); }
        jkp.diff_chars = function( o, n ) { return this.diff(o, n, {'splitter':''} ); }
        
        return jk;
    })();
});