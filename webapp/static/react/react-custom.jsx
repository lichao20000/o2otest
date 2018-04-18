(function(exports){
  var React = require('react')  
  var ReactDOM = require('react-dom')
  if(typeof window != 'undefined'){
    window.React = React;
    window.ReactDOM = ReactDOM;
    }

})(this ? this : (module ? module.exports:{}))

