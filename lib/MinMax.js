// Immutable MinMax
function MinMax(minmax) {
  var min = ((minmax !== undefined) && minmax.hasOwnProperty('min')) ? 
    minmax.min : Infinity;
  var max = ((minmax !== undefined) && minmax.hasOwnProperty('max')) ? 
    minmax.max : -Infinity;

  this.__defineGetter__('min', function() {
    return min;
  });

  this.__defineGetter__('max', function() {
    return max;
  });
}

MinMax.prototype.reduceArray = function(arr, filterFunction) {
  var min = this.min;
  var max = this.max;
  arr.forEach(function(value) {
    if (((filterFunction !== undefined) && filterFunction(value)) ||
        (filterFunction === undefined)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  });
  return new MinMax({min: min, max: max});
};

MinMax.prototype.toString = function() {
  return JSON.stringify(this);
};

module.exports = MinMax;