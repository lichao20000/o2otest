/* -*- coding: utf-8 -*- */

var Tokens = {
    sp: {type: 'pattern', pattern: () => /^\s+/},
    v: {type: 'pattern', pattern: () => /^[-]?\d+(?:\.\d+)?/, parse: parseFloat},
    comma: {type: 'pattern', pattern: () => { return /^\,/; } }
};

Tokens.coords = {
    type: 'dsv',
    delimiter: Tokens.sp,
    value: Tokens.v,
    names: ['x', 'y', 'z', 'm']
};

Tokens.coordsList = {
    type: 'dsv',
    delimiter: Tokens.comma,
    value: Tokens.coords
};

Tokens.ring = {
    type: 'seq',
    value: ['(', Tokens.coordsList, ')'],
    names: ['', 'points']
};

Tokens.rings = {
    type: 'dsv',
    delimiter: Tokens.comma,
    value: Tokens.ring
};

Tokens.pointName = {
    type: 'any',
    value: ['POINT ZM', 'POINT Z', 'POINT']
};

Tokens.point = {
    type: 'seq',
    value: [Tokens.pointName, '(', Tokens.coords, ')'],
    names: ['type', '', 'coords', '']
};

Tokens.multiPoints = {
    type: 'seq',
    value: ['MULTIPOINT', '(', Tokens.coordsList, ')'],
    names: ['type', '', 'points']
};

Tokens.lineString = {
    type: 'seq',
    value: [{type: 'any', value: ['LINESTRING Z', 'LINESTRING']}, Tokens.ring],
    names: ['type', 'ring']
};

Tokens.polygonName = {
    type: 'any',
    value: ['POLYGON Z', 'POLYGON']
};

Tokens.polygon = {
    type: 'seq',
    value: [Tokens.polygonName, '(', Tokens.rings, ')'],
    names: ['type', '', 'rings']
};

Tokens.polygonNoName = {
    type: 'seq',
    value: ['(', Tokens.rings, ')'],
    names: ['', 'rings']
};

Tokens.multiPolygonName = {
    type: 'any',
    value: ['MULTIPOLYGON', 'MultiPolygon']
};

Tokens._polygons = {
    type: 'dsv',
    delimiter: Tokens.comma,
    value: Tokens.polygonNoName
};

Tokens.multiPolygon = {
    type: 'seq',
    value: [Tokens.multiPolygonName, '(', Tokens._polygons, ')'],
    names: ['type', '', 'polygons']
};

Tokens.any = {
    type: 'any',
    value: [Tokens.point,
            Tokens.multiPoints,
            Tokens.lineString,
            Tokens.polygon,
            Tokens.multiPolygon]
};


var _convertNames = function(names, vals){
    var obj = {};
    for(var i=0;i<names.length && i < vals.length;i++){
        var name = names[i];
        var v = vals[i];
        if(name){
            obj[name] = v;
        }
    }
    return obj;
}

var parseSpaces = function(text, start){
    var m = /^\s+/gi.exec(text.substring(start));
    if(m){
        return {result: m[0], len: m[0].length};
    }
    return {result: '', len: 0};
};

var _console = {
    info: function(){
        // console.info.apply(console, arguments);
    },
    log: function(){
        // console.log.apply(console, arguments);
    }
};

var parseToken = function(token, text, start){
    _console.log('----------------------');
    _console.log('parseToken: ', token);
    if(typeof token == 'string'){
        var spaces = parseSpaces(text, start);
        start += spaces.len;
        var _head = text.substring(start, start + token.length);
        // if(text.indexOf(token, start) == start){
        if(_head.toUpperCase() == token.toUpperCase()){
            var r = {result: token.toUpperCase(), len: token.length};
            _console.info(r);
            return r;
        }
    }else if(token.type == 'any'){
        var spaces = parseSpaces(text, start);
        start += spaces.len;
        for(var i=0;i<token.value.length;i++){
            var _token = token.value[i];
            var result = parseToken(_token, text, start);
            if(result){
                _console.info(result);
                return result;
            }
        }
    }else if(token.type == 'seq'){
        var seq = {result: [], len: 0};
        for(var i=0;i<token.value.length;i++){
            var spaces = parseSpaces(text, start);
            start += spaces.len;
            var _token = token.value[i];
            var result = parseToken(_token, text, start);
            if(!result){
                _console.info(null);
                return null;
            }
            seq.result.push(result.result);
            seq.len += result.len;
            start += result.len;
        }
        if(token.names){
            seq.result = _convertNames(token.names, seq.result);
        }
        _console.info(seq);
        return seq;
    }else if(token.type == 'dsv'){
        var spaces = parseSpaces(text, start);
        start += spaces.len;
        var dsv = {result: [], len: 0};
        var result0 = parseToken(token.value, text, start);
        if(!result0){
            _console.info(null);
            return null;
        }
        start += result0.len;
        dsv.len += result0.len;
        dsv.result.push(result0.result);
        while(true){
            var deli = parseToken(token.delimiter, text, start);
            if(!deli){
                break;
            }
            start += deli.len;
            dsv.len += deli.len;
            var spaces = parseSpaces(text, start);
            start += spaces.len;
            dsv.len += spaces.len;
            var value = parseToken(token.value, text, start);
            if(!value){
                // console.info(null);
                return null;
            }
            start += value.len;
            dsv.len += value.len;
            dsv.result.push(value.result);
        }
        if(token.names){
            dsv.result = _convertNames(token.names, dsv.result);
        }
        _console.info(dsv);
        return dsv;
    }else if(token.type == 'pattern'){
        var pattern = token.pattern();
        var m = pattern.exec(text.substring(start));
        if(!m){
            _console.info(null);
            return null;
        }
        var v = m[0];
        if(token.parse){
            v = token.parse(v);
        }
        var r = {result: v, len: m[0].length};
        _console.info(r);
        return r;
    }
    _console.info(null);
    return null;
};

var parseWkt = function(wkt){
    var item = parseToken(Tokens.any, wkt, 0);
    return item ? item.result : null;
};

if(typeof window != 'undefined' && !window.parseWkt){
    window.parseWkt = parseWkt;
}

module.exports.parseWkt = parseWkt;

// console.info(parseWkt('POINT Z(30 10 20)'));
// console.info(parseWkt('LINESTRING (30 10, 10 30, 40 40)'));
// console.info(parseWkt('POLYGON Z ((35 10, 45 45, 15 40, 10 20, 35 10),(20 30, 35 35, 30 20, 20 30))'));
// console.info(parseToken(Tokens.lineString, 'LINESTRING Z(30 10, 40 50)', 0));
// // parseToken(Tokens.ring, '(30 10, 50 60)', 0);
// // parseToken(Tokens.rings, '(30 10, 50 60),(1 2, 3 4)', 0);
// console.info(parseWkt('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'));
