module.exports.blackredyellow = function(t) {
  if (t < 0.5) {
    return [1.0*t*2, 0, 0, 1.0];
  } else {
    return [1.0, (t-0.5)*2*1.0, 0, 1.0];
  }
};