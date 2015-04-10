
// // From THREE.js Color
// // https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
// function hslToRgb(h, s, l) {

//   // h,s,l ranges are in 0.0 - 1.0
//   if ( s === 0 ) {
//     return [l, l, l];
//   } else {

//     var hue2rgb = function(p, q, t) {
//       if (t < 0 ) {
//         t += 1;
//       }
//       if (t > 1 ) {
//         t -= 1;
//       }
//       if (t < 1 / 6) {
//         return p + ( q - p ) * 6 * t;
//       }
//       if (t < 1 / 2) {
//         return q;
//       }
//       if (t < 2 / 3) {
//         return p + ( q - p ) * 6 * ( 2 / 3 - t );
//       }
//       return p;
//     };

//     var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
//     var q = (2 * l) - p;

//     return [
//       hue2rgb(q, p, h + 1 / 3),
//       hue2rgb(q, p, h ),
//       hue2rgb(q, p, h - 1 / 3),
//     ];
//   }
// }

function precon(t) {
  if ((t < 0) || (t > 1.0)) {
    throw new Error('invalid value for t:' + t);
  }
}

module.exports.blackredyellow = function(t) {
  precon(t);
  if (t < 0.5) {
    return [1.0*t*2, 0, 0, 1.0];
  } else {
    return [1.0, (t-0.5)*2*1.0, 0, 1.0];
  } 
};

module.exports.bluecyangreenyellowred = function(t) {
  precon(t);
  if (t < 0.25) {
    return [0, t*4, 1.0];
  } else if ((t >= 0.25) && (t < 0.5)) {
    return [0, 1.0, 1.0 - (t - 0.25)*4];
  } else if ((t >= 0.5) && (t < 0.75)) {
    return [(t - 0.5)*4, 1.0, 0];
  } else {
    return [1.0, 1.0 - (t - 0.75)*4, 0];
  }
};
