/**
 * The following bind functions are borrowed from Google closure and are
 * found in //javascript/closure/base.js.  The goog prefix has been removed
 * as well as the reference to goog.global, which does not exist.
 */
bind = function(fn, self, var_args) { 
  var boundArgs = fn.boundArgs_;

  if (arguments.length > 2) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (boundArgs) {
      args.unshift.apply(args, boundArgs);
    }
    boundArgs = args;
  }

  self = fn.boundSelf_ || self;
  fn = fn.boundFn_ || fn;

  var newfn;

  if (boundArgs) {
    newfn = function() {
      // Combine the static args and the new args into one big array
      var args = Array.prototype.slice.call(arguments);
      args.unshift.apply(args, boundArgs);
      return fn.apply(self, args);
    }
  } else {
    newfn = function() {
      return fn.apply(self, arguments);
    }
  }

  newfn.boundArgs_ = boundArgs;
  newfn.boundSelf_ = self;
  newfn.boundFn_ = fn;

  return newfn;
};

Function.prototype.bind = function(self, var_args) {
  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this, self);
    return bind.apply(null, args);
  } else {
    return bind(this, self);
  }
};

Function.prototype.inherits = function(parentCtor) {
  inherits(this, parentCtor);
};

inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};

var goog = window.goog ? window.goog : {};
window.goog = goog;

/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of
 * @return {string} The name of the type
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // We cannot use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.slice here throws an exception, so we
      // can't use goog.isFunction. Calling typeof directly returns 'unknown' so
      // that will work. In this case, this function will return false and most
      // array functions will still work because the array is still array-like
      // (supports length and []) even though it has lost its prototype.
      // Custom object cannot have non enumerable length and NodeLists don't
      // have a slice method.
      if (typeof value.length == 'number' &&
          typeof value.splice == 'function' &&
          typeof value.propertyIsEnumerable == 'function' &&
          !value.propertyIsEnumerable('length')) {
        return 'array';
      }
    } else {
      return 'null';
    }
  }
  return s;
};

function htmlEscape(str) {
	var result = str;
	result = result.replace(/&/g, '&amp;');
	result = result.replace(/</g, '&lt;');
	result = result.replace(/>/g, '&gt;');
	return result;
}
