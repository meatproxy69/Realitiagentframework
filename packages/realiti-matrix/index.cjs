'use strict';
const spatial=require('./spatial.cjs');
const evidence=require('./evidence.cjs');
const bridge=require('./bridge.cjs');
module.exports=Object.freeze({...spatial,...evidence,...bridge});
