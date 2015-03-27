webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(3).$;
	var THREE = __webpack_require__(3).three;
	
	var Scene = __webpack_require__(4);
	var data = __webpack_require__(5);
	var MinMax = __webpack_require__(6);
	
	function TestCase() {
	
	  var $testcaseContainer = $(
	    '<div class="testcase">' + 
	      '<div class="viewport"></div>' +
	    '</div>');
	  $('body').append($testcaseContainer);
	
	  var scene = new Scene($testcaseContainer.find('.viewport'));
	
	  var xAxisMinMax = new MinMax().reduceArray(data.xAxis);
	  var yAxisMinMax = new MinMax().reduceArray(data.yAxis);
	  var valueMinMax = new MinMax();
	  for (var i = 0; i < data.values.length; ++i) {
	    valueMinMax = valueMinMax.reduceArray(data.values[i]);
	  }
	
	  console.log('x', xAxisMinMax.toString());
	  console.log('y', yAxisMinMax.toString());
	  console.log('v', valueMinMax.toString());
	
	  // Normalize to a box with max width or depth = 1
	  // and a height = 0.5
	  var dx = (xAxisMinMax.max - xAxisMinMax.min)/(data.xAxis.length - 1);
	  var dy = (yAxisMinMax.max - yAxisMinMax.min)/(data.yAxis.length - 1);
	  var dv = (valueMinMax.max - valueMinMax.min);
	
	  var xyScale = (dx > dy) ? 1/dx : 1/dy;
	  var hScale = 0.5/dv;
	  console.log('dx', dx);
	  console.log('dy', dy);
	  console.log('scales', xyScale, hScale);
	
	  function scaleVector(x,y,z) {
	    return new THREE.Vector3(
	      (x - xAxisMinMax.min)*xyScale,
	      (y - yAxisMinMax.min)*xyScale,
	      (z - valueMinMax.min)*hScale);
	  }
	
	  for (var iy = 0; iy < data.values.length - 1; ++iy) {
	    for(var ix = 0; ix < data.values[iy].length - 1; ++ix) {
	
	      var geom = new THREE.Geometry();
	      
	      geom.vertices.push(
	        scaleVector(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
	      geom.vertices.push(
	        scaleVector(data.xAxis[ix + 1], data.yAxis[iy], data.values[iy][ix + 1]));
	      geom.vertices.push(
	        scaleVector(data.xAxis[ix + 1], data.yAxis[iy + 1], data.values[iy + 1][ix + 1]));
	      geom.vertices.push(
	        scaleVector(data.xAxis[ix], data.yAxis[iy + 1], data.values[iy + 1][ix]));
	
	      geom.faces.push(new THREE.Face3(0,1,2));
	      geom.faces.push(new THREE.Face3(0,2,3));
	
	      geom.computeFaceNormals();
	
	      var mesh = new THREE.Mesh(
	        geom, 
	        new THREE.MeshLambertMaterial({color: 0x0000ff}));
	
	      scene.threeScene.add(mesh);
	    }
	  }
	
	}
	
	new TestCase();


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports.$ = __webpack_require__(1);
	module.exports.three = __webpack_require__(2);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(7);
	var THREE = __webpack_require__(3).three;
	
	function Scene($container) {
	  var width = $container.width();
	  var height = $container.height();
	
	  // camera
	  var camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000 );
	  camera.position.z = 3;
	  this.camera = camera;
	
	  // scene
	  var scene = new THREE.Scene();
	
	  // lights
	  var directionalLight = new THREE.DirectionalLight(0xffffff);
	  directionalLight.position.set(-1, -1, -1);
	  scene.add(directionalLight);
	  scene.add(new THREE.AmbientLight(0x222222));
	
	  scene.add(new THREE.Mesh(
	      new THREE.BoxGeometry(1, 1, 0.1),
	      new THREE.MeshLambertMaterial({color: 0xff0000})));
	
	  // renderer
	  var renderer = new THREE.WebGLRenderer({antialias: true});
	  renderer.setClearColor(0xffffff, 1);
	  renderer.setSize(width, height);
	  $container[0].appendChild(renderer.domElement);
	
	  // controls
	  var controls = new THREE.OrbitControls(camera, renderer.domElement);
	  controls.damping = 0.2;
	  this.controls = controls;
	  
	  function animate() {
	    requestAnimationFrame(animate);
	    controls.update();
	  }
	
	  function render() {
	    directionalLight.position.copy(camera.position);
	    renderer.render(scene, camera);
	  }
	
	  function resize() {
	    var width = $container.width();
	    var height = Math.floor(width*9/16);
	    $container.height(height);
	    camera.aspect = width/height;
	    camera.updateProjectionMatrix();
	    renderer.setSize(width, height);
	    render();
	  }
	
	  this.__defineGetter__('threeScene', function() {
	    return scene;
	  });
	
	  window.addEventListener('resize', resize, false);
	  controls.addEventListener('change', render);
	
	  animate();
	
	  // Resize on the next event loop tick since a scroll bar may have been added
	  // in the meantime.
	  setTimeout(resize, 0);
	
	}
	
	module.exports = Scene;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  xAxis: [5, 6, 7], 
	  yAxis: [1, 1.5, 2],
	  values: [
	    [10,10,12],
	    [11,15,13],
	    [12,13,14],
	  ]
	  // values: [
	  //   [30,33,36,41,47,56,68,86,112,153,217,317,467,662,847,967,1031,1064,1081,1089,1093,1093,1091,1086,1077,1064,1045,1014,967,893,777,609,409,242,143,90,63,47,38,32,29,26,25,23,23,22,22,21,21,21],
	  //   [43,48,55,64,76,92,113,141,179,230,299,388,496,618,735,829,895,938,964,979,987,988,984,975,961,939,910,868,812,737,641,526,403,290,203,143,104,78,61,49,41,36,32,29,27,26,24,23,23,22],
	  //   [57,65,76,88,104,124,150,182,223,274,336,410,494,583,669,745,804,847,876,894,904,905,901,890,873,848,816,773,719,653,575,488,397,311,238,180,137,106,84,68,56,47,41,36,33,30,28,27,25,24],
	  //   [71,81,93,107,125,147,174,206,244,289,341,400,464,530,595,653,701,739,766,784,794,796,792,781,764,740,709,670,624,569,508,441,373,308,248,198,158,126,102,84,70,59,51,44,39,36,33,30,28,27],
	  //   [82,92,105,120,139,160,185,214,248,286,329,375,425,475,523,568,606,638,661,677,686,688,684,675,659,638,611,578,540,496,448,396,344,293,246,204,168,139,115,96,81,69,59,52,46,41,37,34,32,30],
	  //   [89,100,113,128,145,165,187,213,242,273,308,345,383,421,458,493,523,548,568,581,589,591,588,580,567,549,526,499,468,433,395,355,314,274,236,201,171,144,122,104,89,76,66,58,51,46,42,38,35,33],
	  //   [94,104,117,130,146,164,183,205,229,255,283,312,342,371,400,426,450,470,485,496,503,505,503,496,485,471,452,430,405,378,348,316,284,252,222,193,168,145,125,108,93,81,71,63,56,50,45,42,38,35],
	  //   [96,106,117,130,143,159,176,194,214,235,258,281,304,327,350,370,389,404,417,426,431,433,431,426,417,406,391,373,353,331,307,282,257,231,207,183,162,142,124,109,96,84,75,66,59,54,49,44,41,38],
	  //   [97,106,116,127,139,153,167,183,200,217,236,255,273,292,310,326,341,354,364,371,376,377,376,372,365,355,343,329,313,295,276,256,235,214,193,174,155,138,123,109,97,86,77,69,62,56,51,47,43,40],
	  //   [96,104,114,124,134,146,159,172,186,201,216,231,247,262,276,290,302,312,320,327,330,332,331,328,322,314,305,293,280,265,249,233,215,198,181,164,148,134,120,108,97,87,78,71,64,58,53,49,45,42],
	  //   [94,102,110,119,128,138,149,160,172,184,197,209,222,234,246,257,266,275,282,287,290,291,290,288,283,277,269,260,249,237,224,211,196,182,168,154,140,128,116,105,95,86,78,71,65,59,55,50,47,43],
	  //   [92,98,106,113,121,130,139,149,159,169,179,190,200,210,220,228,236,243,249,253,255,256,256,254,250,245,239,231,223,213,202,191,179,167,156,144,132,122,111,102,93,85,78,71,65,60,55,51,48,45],
	  //   [89,95,101,108,115,122,130,138,147,155,164,172,181,189,197,204,210,216,220,224,226,227,227,225,222,218,213,207,200,192,183,174,164,154,144,134,125,115,106,98,90,83,77,71,65,60,56,52,48,45],
	  //   [86,91,97,103,109,115,122,129,136,144,151,158,165,172,179,185,190,195,199,202,204,205,204,203,201,198,193,188,182,175,168,160,152,143,135,126,118,110,102,95,88,81,75,70,65,60,56,52,49,46],
	  //   [82,87,92,97,103,108,114,120,126,132,138,144,150,156,161,166,171,175,178,180,182,183,183,182,180,177,174,169,164,159,153,146,139,132,125,118,111,104,97,91,84,79,73,68,64,60,56,52,49,46],
	  //   [79,83,87,92,97,101,106,111,117,122,127,132,137,142,146,150,154,157,160,162,163,164,164,163,162,159,157,153,149,144,139,134,128,122,116,110,104,98,92,86,81,76,71,67,62,59,55,52,49,46],
	  //   [75,79,83,87,91,95,99,104,108,113,117,121,125,129,133,137,140,142,145,146,148,148,148,147,146,144,142,139,136,132,128,123,118,113,108,103,98,92,87,82,78,73,69,65,61,57,54,51,48,46],
	  //   [72,75,79,82,86,89,93,97,101,104,108,112,115,119,122,125,127,130,131,133,134,134,134,134,133,131,129,127,124,121,117,113,109,105,101,96,92,87,83,78,74,70,66,63,59,56,53,50,48,46],
	  //   [69,72,75,78,81,84,87,90,94,97,100,103,106,109,112,114,116,118,120,121,122,122,122,122,121,120,118,116,114,111,108,105,101,98,94,90,86,82,79,75,71,68,64,61,58,55,52,50,47,45],
	  //   [66,68,71,74,76,79,82,85,87,90,93,96,98,101,103,105,107,108,110,111,112,112,112,112,111,110,109,107,105,103,100,97,94,91,88,85,81,78,75,71,68,65,62,59,56,54,51,49,47,45],
	  //   [64,66,68,71,73,76,78,81,83,86,88,91,93,95,97,99,101,102,103,104,105,105,105,105,105,104,103,101,99,97,95,93,90,87,84,81,78,75,72,69,66,63,61,58,55,53,51,48,46,44],
	  //   [61,63,65,67,69,72,74,76,78,80,82,84,86,88,90,92,93,94,95,96,97,97,97,97,96,96,95,93,92,90,88,86,84,82,79,76,74,71,69,66,63,61,58,56,54,51,49,47,45,44],
	  //   [58,60,62,64,66,68,70,72,73,75,77,79,81,82,84,85,86,87,88,89,90,90,90,90,89,89,88,87,85,84,82,81,79,77,74,72,70,68,65,63,61,58,56,54,52,50,48,46,44,43],
	  //   [56,57,59,61,62,64,66,68,69,71,72,74,75,77,78,79,80,81,82,83,83,83,83,83,83,82,82,81,80,78,77,75,74,72,70,68,66,64,62,60,58,56,54,52,50,48,47,45,43,42],
	  //   [54,55,57,58,59,61,62,64,65,67,68,70,71,72,73,74,75,76,77,77,77,78,78,78,77,77,76,75,75,73,72,71,69,68,66,65,63,61,59,57,56,54,52,50,49,47,46,44,43,41],
	  //   [51,53,54,55,57,58,59,61,62,63,64,66,67,68,69,70,70,71,72,72,72,73,73,73,72,72,71,71,70,69,68,67,66,64,63,61,60,58,57,55,53,52,50,49,47,46,44,43,42,40],
	  //   [50,51,52,53,54,55,56,58,59,60,61,62,63,64,65,65,66,67,67,68,68,68,68,68,68,68,67,66,66,65,64,63,62,61,60,58,57,56,54,53,51,50,49,47,46,44,43,42,41,40],
	  //   [48,49,50,51,52,53,54,55,56,57,58,59,60,60,61,62,62,63,63,64,64,64,64,64,64,64,63,63,62,61,61,60,59,58,57,56,54,53,52,51,49,48,47,46,44,43,42,41,40,39],
	  //   [46,47,48,49,50,51,52,52,53,54,55,56,57,57,58,58,59,59,60,60,60,61,61,60,60,60,60,59,59,58,58,57,56,55,54,53,52,51,50,49,48,47,45,44,43,42,41,40,39,38],
	  //   [44,45,46,47,48,49,49,50,51,52,52,53,54,54,55,56,56,56,57,57,57,57,57,57,57,57,57,56,56,55,55,54,53,53,52,51,50,49,48,47,46,45,44,43,42,41,40,39,38,37],
	  //   [43,44,44,45,46,47,47,48,49,49,50,51,51,52,52,53,53,54,54,54,54,54,54,54,54,54,54,54,53,53,52,52,51,50,49,49,48,47,46,45,44,43,43,42,41,40,39,38,37,36],
	  //   [42,42,43,44,44,45,46,46,47,47,48,49,49,50,50,50,51,51,51,52,52,52,52,52,52,52,51,51,51,50,50,49,49,48,47,47,46,45,45,44,43,42,41,40,40,39,38,37,37,36],
	  //   [40,41,42,42,43,43,44,44,45,46,46,47,47,47,48,48,49,49,49,49,49,49,49,49,49,49,49,49,48,48,48,47,47,46,46,45,44,44,43,42,42,41,40,39,39,38,37,36,36,35],
	  //   [39,40,40,41,41,42,42,43,43,44,44,45,45,46,46,46,47,47,47,47,47,47,47,47,47,47,47,47,46,46,46,45,45,44,44,43,43,42,42,41,40,40,39,38,38,37,36,36,35,34],
	  //   [38,39,39,40,40,41,41,41,42,42,43,43,44,44,44,44,45,45,45,45,45,45,46,45,45,45,45,45,45,44,44,44,43,43,42,42,41,41,40,40,39,39,38,37,37,36,36,35,34,34],
	  //   [37,37,38,38,39,39,40,40,41,41,41,42,42,42,43,43,43,43,43,44,44,44,44,44,44,44,43,43,43,43,43,42,42,41,41,41,40,40,39,39,38,38,37,36,36,35,35,34,34,33],
	  //   [36,36,37,37,38,38,38,39,39,40,40,40,41,41,41,41,42,42,42,42,42,42,42,42,42,42,42,42,42,41,41,41,40,40,40,39,39,38,38,38,37,37,36,36,35,35,34,34,33,33],
	  //   [35,36,36,36,37,37,37,38,38,38,39,39,39,39,40,40,40,40,40,41,41,41,41,41,41,41,40,40,40,40,40,39,39,39,38,38,38,37,37,37,36,36,35,35,34,34,33,33,32,32],
	  //   [34,35,35,35,36,36,36,37,37,37,38,38,38,38,38,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,38,38,38,38,37,37,37,36,36,36,35,35,34,34,34,33,33,32,32,31],
	  //   [34,34,34,35,35,35,35,36,36,36,36,37,37,37,37,37,38,38,38,38,38,38,38,38,38,38,38,38,38,37,37,37,37,37,36,36,36,35,35,35,34,34,34,33,33,33,32,32,31,31],
	  //   [33,33,33,34,34,34,35,35,35,35,35,36,36,36,36,36,37,37,37,37,37,37,37,37,37,37,37,37,37,36,36,36,36,36,35,35,35,35,34,34,34,33,33,33,32,32,32,31,31,30],
	  //   [33,33,34,34,34,35,35,35,35,36,36,36,36,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,36,36,36,36,35,35,35,34,34,34,33,33,33,32,32,32,31,31],
	  //   [32,33,33,33,33,34,34,34,34,35,35,35,35,35,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,36,35,35,35,35,34,34,34,34,33,33,33,32,32,32,31,31,31,30],
	  //   [32,32,32,32,33,33,33,33,34,34,34,34,34,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,34,34,34,34,34,33,33,33,33,32,32,32,31,31,31,30,30,30],
	  //   [31,31,32,32,32,32,32,33,33,33,33,33,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,34,33,33,33,33,33,32,32,32,32,31,31,31,31,30,30,30,29],
	  //   [31,31,31,31,31,32,32,32,32,32,32,33,33,33,33,33,33,33,33,33,33,33,34,33,33,33,33,33,33,33,33,33,33,33,32,32,32,32,32,31,31,31,31,31,30,30,30,29,29,29],
	  //   [30,30,30,31,31,31,31,31,31,32,32,32,32,32,32,32,32,33,33,33,33,33,33,33,33,33,33,33,32,32,32,32,32,32,32,32,31,31,31,31,31,30,30,30,30,30,29,29,29,29],
	  //   [29,30,30,30,30,30,31,31,31,31,31,31,31,31,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,31,31,31,31,31,31,31,30,30,30,30,30,29,29,29,29,29,28,28],
	  //   [29,29,29,29,30,30,30,30,30,30,30,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,30,30,30,30,30,30,29,29,29,29,29,28,28,28,28],
	  //   [29,29,29,29,29,29,29,30,30,30,30,30,30,30,30,30,30,30,31,31,31,31,31,31,31,31,31,31,30,30,30,30,30,30,30,30,30,30,29,29,29,29,29,29,28,28,28,28,28,27],
	  // ]
	};
	


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

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
	
	MinMax.prototype.reduceArray = function(arr) {
	  var min = this.min;
	  var max = this.max;
	  arr.forEach(function(value) {
	    min = Math.min(min, value);
	    max = Math.max(max, value);
	  });
	  return new MinMax({min: min, max: max});
	};
	
	MinMax.prototype.toString = function() {
	  return JSON.stringify(this);
	};
	
	module.exports = MinMax;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/mrdoob/three.js/blob/r66/examples/js/controls/OrbitControls.js
	
	/**
	 * @author qiao / https://github.com/qiao
	 * @author mrdoob / http://mrdoob.com
	 * @author alteredq / http://alteredqualia.com/
	 * @author WestLangley / http://github.com/WestLangley
	 * @author erich666 / http://erichaines.com
	 */
	
	// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
	// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
	// supported.
	//
	//    Orbit - left mouse / touch: one finger move
	//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
	//    Pan - right mouse, or arrow keys / touch: three finter swipe
	//
	// This is a drop-in replacement for (most) TrackballControls used in examples.
	// That is, include this js file and wherever you see:
	//      controls = new THREE.TrackballControls( camera );
	//      controls.target.z = 150;
	// Simple substitute "OrbitControls" and the control should work as-is.
	
	var THREE = __webpack_require__(3).three;
	
	THREE.OrbitControls = function(object, domElement){
	  this.object = object;
	  this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	  // API
	
	  // Set to false to disable this control
	  this.enabled = true;
	
	  // "target" sets the location of focus, where the control orbits around
	  // and where it pans with respect to.
	  this.target = new THREE.Vector3();
	
	  // center is old, deprecated; use "target" instead
	  this.center = this.target;
	
	  // This option actually enables dollying in and out; left as "zoom" for
	  // backwards compatibility
	  this.noZoom = false;
	  this.zoomSpeed = 1.0;
	
	  // Limits to how far you can dolly in and out
	  this.minDistance = 0;
	  this.maxDistance = Infinity;
	
	  // Set to true to disable this control
	  this.noRotate = false;
	  this.rotateSpeed = 1.0;
	
	  // Set to true to disable this control
	  this.noPan = false;
	  this.keyPanSpeed = 7.0; // pixels moved per arrow key push
	
	  // Set to true to automatically rotate around the target
	  this.autoRotate = false;
	  this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
	
	  // How far you can orbit vertically, upper and lower limits.
	  // Range is 0 to Math.PI radians.
	  this.minPolarAngle = 0; // radians
	  this.maxPolarAngle = Math.PI; // radians
	
	  // Set to true to disable use of the keys
	  this.noKeys = false;
	
	  // The four arrow keys
	  this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
	
	  ////////////
	  // internals
	
	  var _this = this;
	
	  var EPS = 0.000001;
	
	  var rotateStart = new THREE.Vector2();
	  var rotateEnd = new THREE.Vector2();
	  var rotateDelta = new THREE.Vector2();
	
	  var panStart = new THREE.Vector2();
	  var panEnd = new THREE.Vector2();
	  var panDelta = new THREE.Vector2();
	  var panOffset = new THREE.Vector3();
	
	  var offset = new THREE.Vector3();
	
	  var dollyStart = new THREE.Vector2();
	  var dollyEnd = new THREE.Vector2();
	  var dollyDelta = new THREE.Vector2();
	
	  var phiDelta = 0;
	  var thetaDelta = 0;
	  var scale = 1;
	  var pan = new THREE.Vector3();
	
	  var lastPosition = new THREE.Vector3();
	
	  var STATE = {NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5};
	
	  var state = STATE.NONE;
	
	  // for reset
	
	  this.target0 = this.target.clone();
	  this.position0 = this.object.position.clone();
	
	  // events
	
	  var changeEvent = {type: 'change'};
	  var startEvent = {type: 'start'};
	  var endEvent = {type: 'end'};
	
	  this.rotateLeft = function(angle){
	    if ( angle === undefined ) {
	      angle = getAutoRotationAngle();
	    }
	    thetaDelta -= angle;
	  };
	
	  this.rotateUp = function(angle){
	    if ( angle === undefined ) {
	      angle = getAutoRotationAngle();
	    }
	    phiDelta -= angle;
	  };
	
	  // pass in distance in world space to move left
	  this.panLeft = function(distance){
	    var te = this.object.matrix.elements;
	    // get X column of matrix
	    panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
	    panOffset.multiplyScalar(-distance);
	    pan.add( panOffset );
	  };
	
	  // pass in distance in world space to move up
	  this.panUp = function(distance){
	    var te = this.object.matrix.elements;
	    // get Y column of matrix
	    panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
	    panOffset.multiplyScalar( distance );
	    pan.add( panOffset );
	  };
	  
	  // pass in x,y of change desired in pixel space,
	  // right and down are positive
	  this.pan = function(deltaX, deltaY){
	    var element = _this.domElement === document ? _this.domElement.body : _this.domElement;
	
	    if ( _this.object.fov !== undefined ) {
	      // perspective
	      var position = _this.object.position;
	      var offset = position.clone().sub( _this.target );
	      var targetDistance = offset.length();
	
	      // half of the fov is center to top of screen
	      targetDistance *= Math.tan( ( _this.object.fov / 2 ) * Math.PI / 180.0 );
	
	      // we actually don't use screenWidth, since perspective camera is fixed to screen height
	      _this.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
	      _this.panUp( 2 * deltaY * targetDistance / element.clientHeight );
	    } else if ( _this.object.top !== undefined ) {
	      // orthographic
	      _this.panLeft( deltaX * (_this.object.right - _this.object.left) / element.clientWidth );
	      _this.panUp( deltaY * (_this.object.top - _this.object.bottom) / element.clientHeight );
	    } else {
	      // camera neither orthographic or perspective
	      console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
	    }
	  };
	
	  this.dollyIn = function(dollyScale){
	    if ( dollyScale === undefined ) {
	      dollyScale = getZoomScale();
	    }
	    scale /= dollyScale;
	  };
	
	  this.dollyOut = function(dollyScale){
	    if ( dollyScale === undefined ) {
	      dollyScale = getZoomScale();
	    }
	    scale *= dollyScale;
	  };
	
	  this.update = function(){
	    var position = this.object.position;
	
	    offset.copy( position ).sub( this.target );
	
	    // angle from z-axis around y-axis
	
	    var theta = Math.atan2( offset.x, offset.z );
	
	    // angle from y-axis
	
	    var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
	
	    if ( this.autoRotate ) {
	      this.rotateLeft( getAutoRotationAngle() );
	    }
	
	    theta += thetaDelta;
	    phi += phiDelta;
	
	    // restrict phi to be between desired limits
	    phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );
	
	    // restrict phi to be betwee EPS and PI-EPS
	    phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );
	
	    var radius = offset.length() * scale;
	
	    // restrict radius to be between desired limits
	    radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
	    
	    // move target to panned location
	    this.target.add( pan );
	
	    offset.x = radius * Math.sin( phi ) * Math.sin( theta );
	    offset.y = radius * Math.cos( phi );
	    offset.z = radius * Math.sin( phi ) * Math.cos( theta );
	
	    position.copy( this.target ).add( offset );
	
	    this.object.lookAt( this.target );
	
	    thetaDelta = 0;
	    phiDelta = 0;
	    scale = 1;
	    pan.set( 0, 0, 0 );
	
	    if ( lastPosition.distanceTo( this.object.position ) > 0 ) {
	      this.dispatchEvent( changeEvent );
	      lastPosition.copy( this.object.position );
	    }
	  };
	
	
	  this.reset = function(){
	    state = STATE.NONE;
	
	    this.target.copy( this.target0 );
	    this.object.position.copy( this.position0 );
	
	    this.update();
	  };
	
	  function getAutoRotationAngle(){
	    return 2 * Math.PI / 60 / 60 * _this.autoRotateSpeed;
	  }
	
	  function getZoomScale(){
	    return Math.pow( 0.95, _this.zoomSpeed );
	  }
	
	  function onMouseDown(event){
	    if ( _this.enabled === false ) {
	      return;
	    }
	    event.preventDefault();
	
	    if ( event.button === 0 ) {
	      if ( _this.noRotate === true ) {
	        return;
	      }
	
	      state = STATE.ROTATE;
	
	      rotateStart.set( event.clientX, event.clientY );
	    } else if ( event.button === 1 ) {
	      if ( _this.noZoom === true ) {
	        return;
	      }
	
	      state = STATE.DOLLY;
	
	      dollyStart.set( event.clientX, event.clientY );
	    } else if ( event.button === 2 ) {
	      if ( _this.noPan === true ) {
	        return;
	      }
	
	      state = STATE.PAN;
	
	      panStart.set( event.clientX, event.clientY );
	    }
	
	    _this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	    _this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	    _this.dispatchEvent( startEvent );
	  }
	
	  function onMouseMove(event){
	    if ( _this.enabled === false ) {
	      return;
	    }
	
	    event.preventDefault();
	
	    var element = _this.domElement === document ? _this.domElement.body : _this.domElement;
	
	    if ( state === STATE.ROTATE ) {
	      if ( _this.noRotate === true ) {
	        return;
	      }
	
	      rotateEnd.set( event.clientX, event.clientY );
	      rotateDelta.subVectors( rotateEnd, rotateStart );
	
	      // rotating across whole screen goes 360 degrees around
	      _this.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * _this.rotateSpeed );
	
	      // rotating up and down along whole screen attempts to go 360, but limited to 180
	      _this.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * _this.rotateSpeed );
	
	      rotateStart.copy( rotateEnd );
	    } else if ( state === STATE.DOLLY ) {
	      if ( _this.noZoom === true ) {
	        return;
	      }
	
	      dollyEnd.set( event.clientX, event.clientY );
	      dollyDelta.subVectors( dollyEnd, dollyStart );
	
	      if ( dollyDelta.y > 0 ) {
	        _this.dollyIn();
	      } else {
	        _this.dollyOut();
	      }
	      dollyStart.copy( dollyEnd );
	    } else if ( state === STATE.PAN ) {
	      if ( _this.noPan === true ) {
	        return;
	      }
	
	      panEnd.set( event.clientX, event.clientY );
	      panDelta.subVectors( panEnd, panStart );
	      
	      _this.pan( panDelta.x, panDelta.y );
	
	      panStart.copy( panEnd );
	    }
	
	    _this.update();
	  }
	
	  function onMouseUp( /* event */ ){
	    if ( _this.enabled === false ) {
	      return;
	    }
	
	    _this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
	    _this.domElement.removeEventListener( 'mouseup', onMouseUp, false );
	    _this.dispatchEvent( endEvent );
	    state = STATE.NONE;
	  }
	
	  function onMouseWheel(event){
	    if ( _this.enabled === false || _this.noZoom === true ) {
	      return;
	    }
	
	    event.preventDefault();
	
	    var delta = 0;
	
	    if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9
	      delta = event.wheelDelta;
	    } else if ( event.detail !== undefined ) { // Firefox
	      delta = -event.detail;
	    }
	
	    if ( delta > 0 ) {
	      _this.dollyOut();
	    } else {
	      _this.dollyIn();
	    }
	
	    _this.update();
	    _this.dispatchEvent( startEvent );
	    _this.dispatchEvent( endEvent );
	  }
	
	  function onKeyDown(event){
	    if ( _this.enabled === false || _this.noKeys === true || _this.noPan === true ) {
	      return;
	    }
	    
	    switch (event.keyCode){
	      case _this.keys.UP: {
	        _this.pan( 0, _this.keyPanSpeed );
	        _this.update();
	        break;
	      }
	      case _this.keys.BOTTOM: {
	        _this.pan( 0, -_this.keyPanSpeed );
	        _this.update();
	        break;
	      }
	      case _this.keys.LEFT: {
	        _this.pan(_this.keyPanSpeed, 0 );
	        _this.update();
	        break;
	      }
	      case _this.keys.RIGHT: {
	        _this.pan(-_this.keyPanSpeed, 0 );
	        _this.update();
	        break;
	      }
	    }
	  }
	
	  function touchstart(event){
	    if ( _this.enabled === false ) {
	      return;
	    }
	
	    switch ( event.touches.length ) {
	
	      case 1: {
	        // one-fingered touch: rotate
	        if ( _this.noRotate === true ) {
	          return;
	        }
	
	        state = STATE.TOUCH_ROTATE;
	
	        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	        break;
	      }
	      case 2: {
	        // two-fingered touch: dolly
	        if ( _this.noZoom === true ) {
	          return;
	        }
	
	        state = STATE.TOUCH_DOLLY;
	
	        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
	        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
	        var distance = Math.sqrt( dx * dx + dy * dy );
	        dollyStart.set( 0, distance );
	        break;
	      }
	      case 3: {
	        // three-fingered touch: pan
	        if ( _this.noPan === true ) {
	          return;
	        }
	
	        state = STATE.TOUCH_PAN;
	
	        panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	        break;
	      }
	      default: {
	        state = STATE.NONE;
	      }
	    }
	
	    _this.dispatchEvent( startEvent );
	  }
	
	  function touchmove(event){
	    if ( _this.enabled === false ) {
	      return;
	    }
	
	    event.preventDefault();
	    event.stopPropagation();
	
	    var element = _this.domElement === document ? _this.domElement.body : _this.domElement;
	
	    switch ( event.touches.length ) {
	      case 1: {
	        // one-fingered touch: rotate
	        if ( _this.noRotate === true ) {
	          return;
	        }
	        if ( state !== STATE.TOUCH_ROTATE ) {
	          return;
	        }
	
	        rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	        rotateDelta.subVectors( rotateEnd, rotateStart );
	
	        // rotating across whole screen goes 360 degrees around
	        _this.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * _this.rotateSpeed );
	        // rotating up and down along whole screen attempts to go 360, but limited to 180
	        _this.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * _this.rotateSpeed );
	
	        rotateStart.copy( rotateEnd );
	
	        _this.update();
	        break;
	      }
	      case 2: {
	        // two-fingered touch: dolly
	        if ( _this.noZoom === true ) {
	          return;
	        }
	        if ( state !== STATE.TOUCH_DOLLY ) {
	          return;
	        }
	
	        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
	        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
	        var distance = Math.sqrt( dx * dx + dy * dy );
	
	        dollyEnd.set( 0, distance );
	        dollyDelta.subVectors( dollyEnd, dollyStart );
	
	        if ( dollyDelta.y > 0 ) {
	          _this.dollyOut();
	        } else {
	          _this.dollyIn();
	        }
	
	        dollyStart.copy( dollyEnd );
	
	        _this.update();
	        break;
	      }
	      case 3: {
	        // three-fingered touch: pan
	        if ( _this.noPan === true ) {
	          return;
	        }
	        if ( state !== STATE.TOUCH_PAN ) {
	          return;
	        }
	
	        panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	        panDelta.subVectors( panEnd, panStart );
	        
	        _this.pan( panDelta.x, panDelta.y );
	
	        panStart.copy( panEnd );
	
	        _this.update();
	        break;
	      }
	      default: {
	        state = STATE.NONE;
	      }
	    }
	  }
	
	  function touchend( /* event */ ){
	    if ( _this.enabled === false ) {
	      return;
	    }
	
	    _this.dispatchEvent( endEvent );
	    state = STATE.NONE;
	  }
	
	  this.domElement.addEventListener( 'contextmenu', function(event){ 
	    event.preventDefault();
	  }, false);
	  this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	  this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	  this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	
	  this.domElement.addEventListener( 'touchstart', touchstart, false );
	  this.domElement.addEventListener( 'touchend', touchend, false );
	  this.domElement.addEventListener( 'touchmove', touchmove, false );
	
	  window.addEventListener( 'keydown', onKeyDown, false );
	};
	
	THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );


/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL2hlYXRtYXB0ZXN0LmpzIiwid2VicGFjazovLy8uL3Rlc3QvZnVuY3Rpb25hbC9zcmMvdmVuZG9yLmpzIiwid2VicGFjazovLy8uL3Rlc3QvZnVuY3Rpb25hbC9zcmMvU2NlbmUuanMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9mdW5jdGlvbmFsL3NyYy9oZWF0bWFwZGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9saWIvTWluTWF4LmpzIiwid2VicGFjazovLy8uL3Rlc3QvZnVuY3Rpb25hbC9zcmMvb3JiaXRjb250cm9scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUIsd0JBQXdCO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbUJBQWtCLDZCQUE2QjtBQUMvQyxvQkFBbUIsaUNBQWlDOztBQUVwRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLHdDQUF1QyxnQkFBZ0I7O0FBRXZEO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7Ozs7Ozs7O0FDNUVBO0FBQ0EsK0M7Ozs7OztBQ0RBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0NBQXFDLGdCQUFnQjs7QUFFckQ7QUFDQSwyQ0FBMEMsZ0JBQWdCO0FBQzFEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSCxzQkFBcUIsbUJBQW1CO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx5Qjs7Ozs7O0FDOUJBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBK0I7QUFDL0I7O0FBRUEsdURBQXNEO0FBQ3REO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBeUI7O0FBRXpCO0FBQ0E7QUFDQSw4QkFBNkI7O0FBRTdCO0FBQ0E7QUFDQSwwQkFBeUI7QUFDekIsZ0NBQStCOztBQUUvQjtBQUNBOztBQUVBO0FBQ0EsZ0JBQWU7O0FBRWY7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGdCQUFlOztBQUVmOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUEsc0JBQXFCO0FBQ3JCLHFCQUFvQjtBQUNwQixtQkFBa0I7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLDRDQUEyQztBQUMzQztBQUNBLE1BQUsseUNBQXlDO0FBQzlDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxvRTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSw2RUFBNEU7O0FBRTVFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBIiwic291cmNlc0NvbnRlbnQiOlsidmFyICQgPSByZXF1aXJlKCcuL3ZlbmRvcicpLiQ7XG52YXIgVEhSRUUgPSByZXF1aXJlKCcuL3ZlbmRvcicpLnRocmVlO1xuXG52YXIgU2NlbmUgPSByZXF1aXJlKCcuL1NjZW5lJyk7XG52YXIgZGF0YSA9IHJlcXVpcmUoJy4vaGVhdG1hcGRhdGEnKTtcbnZhciBNaW5NYXggPSByZXF1aXJlKCcuLi8uLi8uLi9saWIvTWluTWF4Jyk7XG5cbmZ1bmN0aW9uIFRlc3RDYXNlKCkge1xuXG4gIHZhciAkdGVzdGNhc2VDb250YWluZXIgPSAkKFxuICAgICc8ZGl2IGNsYXNzPVwidGVzdGNhc2VcIj4nICsgXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdwb3J0XCI+PC9kaXY+JyArXG4gICAgJzwvZGl2PicpO1xuICAkKCdib2R5JykuYXBwZW5kKCR0ZXN0Y2FzZUNvbnRhaW5lcik7XG5cbiAgdmFyIHNjZW5lID0gbmV3IFNjZW5lKCR0ZXN0Y2FzZUNvbnRhaW5lci5maW5kKCcudmlld3BvcnQnKSk7XG5cbiAgdmFyIHhBeGlzTWluTWF4ID0gbmV3IE1pbk1heCgpLnJlZHVjZUFycmF5KGRhdGEueEF4aXMpO1xuICB2YXIgeUF4aXNNaW5NYXggPSBuZXcgTWluTWF4KCkucmVkdWNlQXJyYXkoZGF0YS55QXhpcyk7XG4gIHZhciB2YWx1ZU1pbk1heCA9IG5ldyBNaW5NYXgoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnZhbHVlcy5sZW5ndGg7ICsraSkge1xuICAgIHZhbHVlTWluTWF4ID0gdmFsdWVNaW5NYXgucmVkdWNlQXJyYXkoZGF0YS52YWx1ZXNbaV0pO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ3gnLCB4QXhpc01pbk1heC50b1N0cmluZygpKTtcbiAgY29uc29sZS5sb2coJ3knLCB5QXhpc01pbk1heC50b1N0cmluZygpKTtcbiAgY29uc29sZS5sb2coJ3YnLCB2YWx1ZU1pbk1heC50b1N0cmluZygpKTtcblxuICAvLyBOb3JtYWxpemUgdG8gYSBib3ggd2l0aCBtYXggd2lkdGggb3IgZGVwdGggPSAxXG4gIC8vIGFuZCBhIGhlaWdodCA9IDAuNVxuICB2YXIgZHggPSAoeEF4aXNNaW5NYXgubWF4IC0geEF4aXNNaW5NYXgubWluKS8oZGF0YS54QXhpcy5sZW5ndGggLSAxKTtcbiAgdmFyIGR5ID0gKHlBeGlzTWluTWF4Lm1heCAtIHlBeGlzTWluTWF4Lm1pbikvKGRhdGEueUF4aXMubGVuZ3RoIC0gMSk7XG4gIHZhciBkdiA9ICh2YWx1ZU1pbk1heC5tYXggLSB2YWx1ZU1pbk1heC5taW4pO1xuXG4gIHZhciB4eVNjYWxlID0gKGR4ID4gZHkpID8gMS9keCA6IDEvZHk7XG4gIHZhciBoU2NhbGUgPSAwLjUvZHY7XG4gIGNvbnNvbGUubG9nKCdkeCcsIGR4KTtcbiAgY29uc29sZS5sb2coJ2R5JywgZHkpO1xuICBjb25zb2xlLmxvZygnc2NhbGVzJywgeHlTY2FsZSwgaFNjYWxlKTtcblxuICBmdW5jdGlvbiBzY2FsZVZlY3Rvcih4LHkseikge1xuICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyhcbiAgICAgICh4IC0geEF4aXNNaW5NYXgubWluKSp4eVNjYWxlLFxuICAgICAgKHkgLSB5QXhpc01pbk1heC5taW4pKnh5U2NhbGUsXG4gICAgICAoeiAtIHZhbHVlTWluTWF4Lm1pbikqaFNjYWxlKTtcbiAgfVxuXG4gIGZvciAodmFyIGl5ID0gMDsgaXkgPCBkYXRhLnZhbHVlcy5sZW5ndGggLSAxOyArK2l5KSB7XG4gICAgZm9yKHZhciBpeCA9IDA7IGl4IDwgZGF0YS52YWx1ZXNbaXldLmxlbmd0aCAtIDE7ICsraXgpIHtcblxuICAgICAgdmFyIGdlb20gPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICAgIFxuICAgICAgZ2VvbS52ZXJ0aWNlcy5wdXNoKFxuICAgICAgICBzY2FsZVZlY3RvcihkYXRhLnhBeGlzW2l4XSwgZGF0YS55QXhpc1tpeV0sIGRhdGEudmFsdWVzW2l5XVtpeF0pKTtcbiAgICAgIGdlb20udmVydGljZXMucHVzaChcbiAgICAgICAgc2NhbGVWZWN0b3IoZGF0YS54QXhpc1tpeCArIDFdLCBkYXRhLnlBeGlzW2l5XSwgZGF0YS52YWx1ZXNbaXldW2l4ICsgMV0pKTtcbiAgICAgIGdlb20udmVydGljZXMucHVzaChcbiAgICAgICAgc2NhbGVWZWN0b3IoZGF0YS54QXhpc1tpeCArIDFdLCBkYXRhLnlBeGlzW2l5ICsgMV0sIGRhdGEudmFsdWVzW2l5ICsgMV1baXggKyAxXSkpO1xuICAgICAgZ2VvbS52ZXJ0aWNlcy5wdXNoKFxuICAgICAgICBzY2FsZVZlY3RvcihkYXRhLnhBeGlzW2l4XSwgZGF0YS55QXhpc1tpeSArIDFdLCBkYXRhLnZhbHVlc1tpeSArIDFdW2l4XSkpO1xuXG4gICAgICBnZW9tLmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsMSwyKSk7XG4gICAgICBnZW9tLmZhY2VzLnB1c2gobmV3IFRIUkVFLkZhY2UzKDAsMiwzKSk7XG5cbiAgICAgIGdlb20uY29tcHV0ZUZhY2VOb3JtYWxzKCk7XG5cbiAgICAgIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goXG4gICAgICAgIGdlb20sIFxuICAgICAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IDB4MDAwMGZmfSkpO1xuXG4gICAgICBzY2VuZS50aHJlZVNjZW5lLmFkZChtZXNoKTtcbiAgICB9XG4gIH1cblxufVxuXG5uZXcgVGVzdENhc2UoKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL2hlYXRtYXB0ZXN0LmpzXG4gKiogbW9kdWxlIGlkID0gMFxuICoqIG1vZHVsZSBjaHVua3MgPSAxXG4gKiovIiwibW9kdWxlLmV4cG9ydHMuJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xubW9kdWxlLmV4cG9ydHMudGhyZWUgPSByZXF1aXJlKCd0aHJlZScpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL3ZlbmRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMVxuICoqLyIsInJlcXVpcmUoJy4vb3JiaXRjb250cm9scycpO1xudmFyIFRIUkVFID0gcmVxdWlyZSgnLi92ZW5kb3InKS50aHJlZTtcblxuZnVuY3Rpb24gU2NlbmUoJGNvbnRhaW5lcikge1xuICB2YXIgd2lkdGggPSAkY29udGFpbmVyLndpZHRoKCk7XG4gIHZhciBoZWlnaHQgPSAkY29udGFpbmVyLmhlaWdodCgpO1xuXG4gIC8vIGNhbWVyYVxuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCB3aWR0aC9oZWlnaHQsIDAuMSwgMTAwMCApO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDM7XG4gIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuXG4gIC8vIHNjZW5lXG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIC8vIGxpZ2h0c1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcbiAgZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoLTEsIC0xLCAtMSk7XG4gIHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KTtcbiAgc2NlbmUuYWRkKG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHgyMjIyMjIpKTtcblxuICBzY2VuZS5hZGQobmV3IFRIUkVFLk1lc2goXG4gICAgICBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMSwgMSwgMC4xKSxcbiAgICAgIG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHtjb2xvcjogMHhmZjAwMDB9KSkpO1xuXG4gIC8vIHJlbmRlcmVyXG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbnRpYWxpYXM6IHRydWV9KTtcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweGZmZmZmZiwgMSk7XG4gIHJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICRjb250YWluZXJbMF0uYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgLy8gY29udHJvbHNcbiAgdmFyIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcbiAgY29udHJvbHMuZGFtcGluZyA9IDAuMjtcbiAgdGhpcy5jb250cm9scyA9IGNvbnRyb2xzO1xuICBcbiAgZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5jb3B5KGNhbWVyYS5wb3NpdGlvbik7XG4gICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgIHZhciB3aWR0aCA9ICRjb250YWluZXIud2lkdGgoKTtcbiAgICB2YXIgaGVpZ2h0ID0gTWF0aC5mbG9vcih3aWR0aCo5LzE2KTtcbiAgICAkY29udGFpbmVyLmhlaWdodChoZWlnaHQpO1xuICAgIGNhbWVyYS5hc3BlY3QgPSB3aWR0aC9oZWlnaHQ7XG4gICAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgIHJlbmRlcigpO1xuICB9XG5cbiAgdGhpcy5fX2RlZmluZUdldHRlcl9fKCd0aHJlZVNjZW5lJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNjZW5lO1xuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplLCBmYWxzZSk7XG4gIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHJlbmRlcik7XG5cbiAgYW5pbWF0ZSgpO1xuXG4gIC8vIFJlc2l6ZSBvbiB0aGUgbmV4dCBldmVudCBsb29wIHRpY2sgc2luY2UgYSBzY3JvbGwgYmFyIG1heSBoYXZlIGJlZW4gYWRkZWRcbiAgLy8gaW4gdGhlIG1lYW50aW1lLlxuICBzZXRUaW1lb3V0KHJlc2l6ZSwgMCk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2VuZTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL1NjZW5lLmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAxXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHhBeGlzOiBbNSwgNiwgN10sIFxuICB5QXhpczogWzEsIDEuNSwgMl0sXG4gIHZhbHVlczogW1xuICAgIFsxMCwxMCwxMl0sXG4gICAgWzExLDE1LDEzXSxcbiAgICBbMTIsMTMsMTRdLFxuICBdXG4gIC8vIHZhbHVlczogW1xuICAvLyAgIFszMCwzMywzNiw0MSw0Nyw1Niw2OCw4NiwxMTIsMTUzLDIxNywzMTcsNDY3LDY2Miw4NDcsOTY3LDEwMzEsMTA2NCwxMDgxLDEwODksMTA5MywxMDkzLDEwOTEsMTA4NiwxMDc3LDEwNjQsMTA0NSwxMDE0LDk2Nyw4OTMsNzc3LDYwOSw0MDksMjQyLDE0Myw5MCw2Myw0NywzOCwzMiwyOSwyNiwyNSwyMywyMywyMiwyMiwyMSwyMSwyMV0sXG4gIC8vICAgWzQzLDQ4LDU1LDY0LDc2LDkyLDExMywxNDEsMTc5LDIzMCwyOTksMzg4LDQ5Niw2MTgsNzM1LDgyOSw4OTUsOTM4LDk2NCw5NzksOTg3LDk4OCw5ODQsOTc1LDk2MSw5MzksOTEwLDg2OCw4MTIsNzM3LDY0MSw1MjYsNDAzLDI5MCwyMDMsMTQzLDEwNCw3OCw2MSw0OSw0MSwzNiwzMiwyOSwyNywyNiwyNCwyMywyMywyMl0sXG4gIC8vICAgWzU3LDY1LDc2LDg4LDEwNCwxMjQsMTUwLDE4MiwyMjMsMjc0LDMzNiw0MTAsNDk0LDU4Myw2NjksNzQ1LDgwNCw4NDcsODc2LDg5NCw5MDQsOTA1LDkwMSw4OTAsODczLDg0OCw4MTYsNzczLDcxOSw2NTMsNTc1LDQ4OCwzOTcsMzExLDIzOCwxODAsMTM3LDEwNiw4NCw2OCw1Niw0Nyw0MSwzNiwzMywzMCwyOCwyNywyNSwyNF0sXG4gIC8vICAgWzcxLDgxLDkzLDEwNywxMjUsMTQ3LDE3NCwyMDYsMjQ0LDI4OSwzNDEsNDAwLDQ2NCw1MzAsNTk1LDY1Myw3MDEsNzM5LDc2Niw3ODQsNzk0LDc5Niw3OTIsNzgxLDc2NCw3NDAsNzA5LDY3MCw2MjQsNTY5LDUwOCw0NDEsMzczLDMwOCwyNDgsMTk4LDE1OCwxMjYsMTAyLDg0LDcwLDU5LDUxLDQ0LDM5LDM2LDMzLDMwLDI4LDI3XSxcbiAgLy8gICBbODIsOTIsMTA1LDEyMCwxMzksMTYwLDE4NSwyMTQsMjQ4LDI4NiwzMjksMzc1LDQyNSw0NzUsNTIzLDU2OCw2MDYsNjM4LDY2MSw2NzcsNjg2LDY4OCw2ODQsNjc1LDY1OSw2MzgsNjExLDU3OCw1NDAsNDk2LDQ0OCwzOTYsMzQ0LDI5MywyNDYsMjA0LDE2OCwxMzksMTE1LDk2LDgxLDY5LDU5LDUyLDQ2LDQxLDM3LDM0LDMyLDMwXSxcbiAgLy8gICBbODksMTAwLDExMywxMjgsMTQ1LDE2NSwxODcsMjEzLDI0MiwyNzMsMzA4LDM0NSwzODMsNDIxLDQ1OCw0OTMsNTIzLDU0OCw1NjgsNTgxLDU4OSw1OTEsNTg4LDU4MCw1NjcsNTQ5LDUyNiw0OTksNDY4LDQzMywzOTUsMzU1LDMxNCwyNzQsMjM2LDIwMSwxNzEsMTQ0LDEyMiwxMDQsODksNzYsNjYsNTgsNTEsNDYsNDIsMzgsMzUsMzNdLFxuICAvLyAgIFs5NCwxMDQsMTE3LDEzMCwxNDYsMTY0LDE4MywyMDUsMjI5LDI1NSwyODMsMzEyLDM0MiwzNzEsNDAwLDQyNiw0NTAsNDcwLDQ4NSw0OTYsNTAzLDUwNSw1MDMsNDk2LDQ4NSw0NzEsNDUyLDQzMCw0MDUsMzc4LDM0OCwzMTYsMjg0LDI1MiwyMjIsMTkzLDE2OCwxNDUsMTI1LDEwOCw5Myw4MSw3MSw2Myw1Niw1MCw0NSw0MiwzOCwzNV0sXG4gIC8vICAgWzk2LDEwNiwxMTcsMTMwLDE0MywxNTksMTc2LDE5NCwyMTQsMjM1LDI1OCwyODEsMzA0LDMyNywzNTAsMzcwLDM4OSw0MDQsNDE3LDQyNiw0MzEsNDMzLDQzMSw0MjYsNDE3LDQwNiwzOTEsMzczLDM1MywzMzEsMzA3LDI4MiwyNTcsMjMxLDIwNywxODMsMTYyLDE0MiwxMjQsMTA5LDk2LDg0LDc1LDY2LDU5LDU0LDQ5LDQ0LDQxLDM4XSxcbiAgLy8gICBbOTcsMTA2LDExNiwxMjcsMTM5LDE1MywxNjcsMTgzLDIwMCwyMTcsMjM2LDI1NSwyNzMsMjkyLDMxMCwzMjYsMzQxLDM1NCwzNjQsMzcxLDM3NiwzNzcsMzc2LDM3MiwzNjUsMzU1LDM0MywzMjksMzEzLDI5NSwyNzYsMjU2LDIzNSwyMTQsMTkzLDE3NCwxNTUsMTM4LDEyMywxMDksOTcsODYsNzcsNjksNjIsNTYsNTEsNDcsNDMsNDBdLFxuICAvLyAgIFs5NiwxMDQsMTE0LDEyNCwxMzQsMTQ2LDE1OSwxNzIsMTg2LDIwMSwyMTYsMjMxLDI0NywyNjIsMjc2LDI5MCwzMDIsMzEyLDMyMCwzMjcsMzMwLDMzMiwzMzEsMzI4LDMyMiwzMTQsMzA1LDI5MywyODAsMjY1LDI0OSwyMzMsMjE1LDE5OCwxODEsMTY0LDE0OCwxMzQsMTIwLDEwOCw5Nyw4Nyw3OCw3MSw2NCw1OCw1Myw0OSw0NSw0Ml0sXG4gIC8vICAgWzk0LDEwMiwxMTAsMTE5LDEyOCwxMzgsMTQ5LDE2MCwxNzIsMTg0LDE5NywyMDksMjIyLDIzNCwyNDYsMjU3LDI2NiwyNzUsMjgyLDI4NywyOTAsMjkxLDI5MCwyODgsMjgzLDI3NywyNjksMjYwLDI0OSwyMzcsMjI0LDIxMSwxOTYsMTgyLDE2OCwxNTQsMTQwLDEyOCwxMTYsMTA1LDk1LDg2LDc4LDcxLDY1LDU5LDU1LDUwLDQ3LDQzXSxcbiAgLy8gICBbOTIsOTgsMTA2LDExMywxMjEsMTMwLDEzOSwxNDksMTU5LDE2OSwxNzksMTkwLDIwMCwyMTAsMjIwLDIyOCwyMzYsMjQzLDI0OSwyNTMsMjU1LDI1NiwyNTYsMjU0LDI1MCwyNDUsMjM5LDIzMSwyMjMsMjEzLDIwMiwxOTEsMTc5LDE2NywxNTYsMTQ0LDEzMiwxMjIsMTExLDEwMiw5Myw4NSw3OCw3MSw2NSw2MCw1NSw1MSw0OCw0NV0sXG4gIC8vICAgWzg5LDk1LDEwMSwxMDgsMTE1LDEyMiwxMzAsMTM4LDE0NywxNTUsMTY0LDE3MiwxODEsMTg5LDE5NywyMDQsMjEwLDIxNiwyMjAsMjI0LDIyNiwyMjcsMjI3LDIyNSwyMjIsMjE4LDIxMywyMDcsMjAwLDE5MiwxODMsMTc0LDE2NCwxNTQsMTQ0LDEzNCwxMjUsMTE1LDEwNiw5OCw5MCw4Myw3Nyw3MSw2NSw2MCw1Niw1Miw0OCw0NV0sXG4gIC8vICAgWzg2LDkxLDk3LDEwMywxMDksMTE1LDEyMiwxMjksMTM2LDE0NCwxNTEsMTU4LDE2NSwxNzIsMTc5LDE4NSwxOTAsMTk1LDE5OSwyMDIsMjA0LDIwNSwyMDQsMjAzLDIwMSwxOTgsMTkzLDE4OCwxODIsMTc1LDE2OCwxNjAsMTUyLDE0MywxMzUsMTI2LDExOCwxMTAsMTAyLDk1LDg4LDgxLDc1LDcwLDY1LDYwLDU2LDUyLDQ5LDQ2XSxcbiAgLy8gICBbODIsODcsOTIsOTcsMTAzLDEwOCwxMTQsMTIwLDEyNiwxMzIsMTM4LDE0NCwxNTAsMTU2LDE2MSwxNjYsMTcxLDE3NSwxNzgsMTgwLDE4MiwxODMsMTgzLDE4MiwxODAsMTc3LDE3NCwxNjksMTY0LDE1OSwxNTMsMTQ2LDEzOSwxMzIsMTI1LDExOCwxMTEsMTA0LDk3LDkxLDg0LDc5LDczLDY4LDY0LDYwLDU2LDUyLDQ5LDQ2XSxcbiAgLy8gICBbNzksODMsODcsOTIsOTcsMTAxLDEwNiwxMTEsMTE3LDEyMiwxMjcsMTMyLDEzNywxNDIsMTQ2LDE1MCwxNTQsMTU3LDE2MCwxNjIsMTYzLDE2NCwxNjQsMTYzLDE2MiwxNTksMTU3LDE1MywxNDksMTQ0LDEzOSwxMzQsMTI4LDEyMiwxMTYsMTEwLDEwNCw5OCw5Miw4Niw4MSw3Niw3MSw2Nyw2Miw1OSw1NSw1Miw0OSw0Nl0sXG4gIC8vICAgWzc1LDc5LDgzLDg3LDkxLDk1LDk5LDEwNCwxMDgsMTEzLDExNywxMjEsMTI1LDEyOSwxMzMsMTM3LDE0MCwxNDIsMTQ1LDE0NiwxNDgsMTQ4LDE0OCwxNDcsMTQ2LDE0NCwxNDIsMTM5LDEzNiwxMzIsMTI4LDEyMywxMTgsMTEzLDEwOCwxMDMsOTgsOTIsODcsODIsNzgsNzMsNjksNjUsNjEsNTcsNTQsNTEsNDgsNDZdLFxuICAvLyAgIFs3Miw3NSw3OSw4Miw4Niw4OSw5Myw5NywxMDEsMTA0LDEwOCwxMTIsMTE1LDExOSwxMjIsMTI1LDEyNywxMzAsMTMxLDEzMywxMzQsMTM0LDEzNCwxMzQsMTMzLDEzMSwxMjksMTI3LDEyNCwxMjEsMTE3LDExMywxMDksMTA1LDEwMSw5Niw5Miw4Nyw4Myw3OCw3NCw3MCw2Niw2Myw1OSw1Niw1Myw1MCw0OCw0Nl0sXG4gIC8vICAgWzY5LDcyLDc1LDc4LDgxLDg0LDg3LDkwLDk0LDk3LDEwMCwxMDMsMTA2LDEwOSwxMTIsMTE0LDExNiwxMTgsMTIwLDEyMSwxMjIsMTIyLDEyMiwxMjIsMTIxLDEyMCwxMTgsMTE2LDExNCwxMTEsMTA4LDEwNSwxMDEsOTgsOTQsOTAsODYsODIsNzksNzUsNzEsNjgsNjQsNjEsNTgsNTUsNTIsNTAsNDcsNDVdLFxuICAvLyAgIFs2Niw2OCw3MSw3NCw3Niw3OSw4Miw4NSw4Nyw5MCw5Myw5Niw5OCwxMDEsMTAzLDEwNSwxMDcsMTA4LDExMCwxMTEsMTEyLDExMiwxMTIsMTEyLDExMSwxMTAsMTA5LDEwNywxMDUsMTAzLDEwMCw5Nyw5NCw5MSw4OCw4NSw4MSw3OCw3NSw3MSw2OCw2NSw2Miw1OSw1Niw1NCw1MSw0OSw0Nyw0NV0sXG4gIC8vICAgWzY0LDY2LDY4LDcxLDczLDc2LDc4LDgxLDgzLDg2LDg4LDkxLDkzLDk1LDk3LDk5LDEwMSwxMDIsMTAzLDEwNCwxMDUsMTA1LDEwNSwxMDUsMTA1LDEwNCwxMDMsMTAxLDk5LDk3LDk1LDkzLDkwLDg3LDg0LDgxLDc4LDc1LDcyLDY5LDY2LDYzLDYxLDU4LDU1LDUzLDUxLDQ4LDQ2LDQ0XSxcbiAgLy8gICBbNjEsNjMsNjUsNjcsNjksNzIsNzQsNzYsNzgsODAsODIsODQsODYsODgsOTAsOTIsOTMsOTQsOTUsOTYsOTcsOTcsOTcsOTcsOTYsOTYsOTUsOTMsOTIsOTAsODgsODYsODQsODIsNzksNzYsNzQsNzEsNjksNjYsNjMsNjEsNTgsNTYsNTQsNTEsNDksNDcsNDUsNDRdLFxuICAvLyAgIFs1OCw2MCw2Miw2NCw2Niw2OCw3MCw3Miw3Myw3NSw3Nyw3OSw4MSw4Miw4NCw4NSw4Niw4Nyw4OCw4OSw5MCw5MCw5MCw5MCw4OSw4OSw4OCw4Nyw4NSw4NCw4Miw4MSw3OSw3Nyw3NCw3Miw3MCw2OCw2NSw2Myw2MSw1OCw1Niw1NCw1Miw1MCw0OCw0Niw0NCw0M10sXG4gIC8vICAgWzU2LDU3LDU5LDYxLDYyLDY0LDY2LDY4LDY5LDcxLDcyLDc0LDc1LDc3LDc4LDc5LDgwLDgxLDgyLDgzLDgzLDgzLDgzLDgzLDgzLDgyLDgyLDgxLDgwLDc4LDc3LDc1LDc0LDcyLDcwLDY4LDY2LDY0LDYyLDYwLDU4LDU2LDU0LDUyLDUwLDQ4LDQ3LDQ1LDQzLDQyXSxcbiAgLy8gICBbNTQsNTUsNTcsNTgsNTksNjEsNjIsNjQsNjUsNjcsNjgsNzAsNzEsNzIsNzMsNzQsNzUsNzYsNzcsNzcsNzcsNzgsNzgsNzgsNzcsNzcsNzYsNzUsNzUsNzMsNzIsNzEsNjksNjgsNjYsNjUsNjMsNjEsNTksNTcsNTYsNTQsNTIsNTAsNDksNDcsNDYsNDQsNDMsNDFdLFxuICAvLyAgIFs1MSw1Myw1NCw1NSw1Nyw1OCw1OSw2MSw2Miw2Myw2NCw2Niw2Nyw2OCw2OSw3MCw3MCw3MSw3Miw3Miw3Miw3Myw3Myw3Myw3Miw3Miw3MSw3MSw3MCw2OSw2OCw2Nyw2Niw2NCw2Myw2MSw2MCw1OCw1Nyw1NSw1Myw1Miw1MCw0OSw0Nyw0Niw0NCw0Myw0Miw0MF0sXG4gIC8vICAgWzUwLDUxLDUyLDUzLDU0LDU1LDU2LDU4LDU5LDYwLDYxLDYyLDYzLDY0LDY1LDY1LDY2LDY3LDY3LDY4LDY4LDY4LDY4LDY4LDY4LDY4LDY3LDY2LDY2LDY1LDY0LDYzLDYyLDYxLDYwLDU4LDU3LDU2LDU0LDUzLDUxLDUwLDQ5LDQ3LDQ2LDQ0LDQzLDQyLDQxLDQwXSxcbiAgLy8gICBbNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTYsNTcsNTgsNTksNjAsNjAsNjEsNjIsNjIsNjMsNjMsNjQsNjQsNjQsNjQsNjQsNjQsNjQsNjMsNjMsNjIsNjEsNjEsNjAsNTksNTgsNTcsNTYsNTQsNTMsNTIsNTEsNDksNDgsNDcsNDYsNDQsNDMsNDIsNDEsNDAsMzldLFxuICAvLyAgIFs0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Miw1Myw1NCw1NSw1Niw1Nyw1Nyw1OCw1OCw1OSw1OSw2MCw2MCw2MCw2MSw2MSw2MCw2MCw2MCw2MCw1OSw1OSw1OCw1OCw1Nyw1Niw1NSw1NCw1Myw1Miw1MSw1MCw0OSw0OCw0Nyw0NSw0NCw0Myw0Miw0MSw0MCwzOSwzOF0sXG4gIC8vICAgWzQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDQ5LDUwLDUxLDUyLDUyLDUzLDU0LDU0LDU1LDU2LDU2LDU2LDU3LDU3LDU3LDU3LDU3LDU3LDU3LDU3LDU3LDU2LDU2LDU1LDU1LDU0LDUzLDUzLDUyLDUxLDUwLDQ5LDQ4LDQ3LDQ2LDQ1LDQ0LDQzLDQyLDQxLDQwLDM5LDM4LDM3XSxcbiAgLy8gICBbNDMsNDQsNDQsNDUsNDYsNDcsNDcsNDgsNDksNDksNTAsNTEsNTEsNTIsNTIsNTMsNTMsNTQsNTQsNTQsNTQsNTQsNTQsNTQsNTQsNTQsNTQsNTQsNTMsNTMsNTIsNTIsNTEsNTAsNDksNDksNDgsNDcsNDYsNDUsNDQsNDMsNDMsNDIsNDEsNDAsMzksMzgsMzcsMzZdLFxuICAvLyAgIFs0Miw0Miw0Myw0NCw0NCw0NSw0Niw0Niw0Nyw0Nyw0OCw0OSw0OSw1MCw1MCw1MCw1MSw1MSw1MSw1Miw1Miw1Miw1Miw1Miw1Miw1Miw1MSw1MSw1MSw1MCw1MCw0OSw0OSw0OCw0Nyw0Nyw0Niw0NSw0NSw0NCw0Myw0Miw0MSw0MCw0MCwzOSwzOCwzNywzNywzNl0sXG4gIC8vICAgWzQwLDQxLDQyLDQyLDQzLDQzLDQ0LDQ0LDQ1LDQ2LDQ2LDQ3LDQ3LDQ3LDQ4LDQ4LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ5LDQ4LDQ4LDQ4LDQ3LDQ3LDQ2LDQ2LDQ1LDQ0LDQ0LDQzLDQyLDQyLDQxLDQwLDM5LDM5LDM4LDM3LDM2LDM2LDM1XSxcbiAgLy8gICBbMzksNDAsNDAsNDEsNDEsNDIsNDIsNDMsNDMsNDQsNDQsNDUsNDUsNDYsNDYsNDYsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDcsNDYsNDYsNDYsNDUsNDUsNDQsNDQsNDMsNDMsNDIsNDIsNDEsNDAsNDAsMzksMzgsMzgsMzcsMzYsMzYsMzUsMzRdLFxuICAvLyAgIFszOCwzOSwzOSw0MCw0MCw0MSw0MSw0MSw0Miw0Miw0Myw0Myw0NCw0NCw0NCw0NCw0NSw0NSw0NSw0NSw0NSw0NSw0Niw0NSw0NSw0NSw0NSw0NSw0NSw0NCw0NCw0NCw0Myw0Myw0Miw0Miw0MSw0MSw0MCw0MCwzOSwzOSwzOCwzNywzNywzNiwzNiwzNSwzNCwzNF0sXG4gIC8vICAgWzM3LDM3LDM4LDM4LDM5LDM5LDQwLDQwLDQxLDQxLDQxLDQyLDQyLDQyLDQzLDQzLDQzLDQzLDQzLDQ0LDQ0LDQ0LDQ0LDQ0LDQ0LDQ0LDQzLDQzLDQzLDQzLDQzLDQyLDQyLDQxLDQxLDQxLDQwLDQwLDM5LDM5LDM4LDM4LDM3LDM2LDM2LDM1LDM1LDM0LDM0LDMzXSxcbiAgLy8gICBbMzYsMzYsMzcsMzcsMzgsMzgsMzgsMzksMzksNDAsNDAsNDAsNDEsNDEsNDEsNDEsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDIsNDEsNDEsNDEsNDAsNDAsNDAsMzksMzksMzgsMzgsMzgsMzcsMzcsMzYsMzYsMzUsMzUsMzQsMzQsMzMsMzNdLFxuICAvLyAgIFszNSwzNiwzNiwzNiwzNywzNywzNywzOCwzOCwzOCwzOSwzOSwzOSwzOSw0MCw0MCw0MCw0MCw0MCw0MSw0MSw0MSw0MSw0MSw0MSw0MSw0MCw0MCw0MCw0MCw0MCwzOSwzOSwzOSwzOCwzOCwzOCwzNywzNywzNywzNiwzNiwzNSwzNSwzNCwzNCwzMywzMywzMiwzMl0sXG4gIC8vICAgWzM0LDM1LDM1LDM1LDM2LDM2LDM2LDM3LDM3LDM3LDM4LDM4LDM4LDM4LDM4LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM5LDM4LDM4LDM4LDM4LDM3LDM3LDM3LDM2LDM2LDM2LDM1LDM1LDM0LDM0LDM0LDMzLDMzLDMyLDMyLDMxXSxcbiAgLy8gICBbMzQsMzQsMzQsMzUsMzUsMzUsMzUsMzYsMzYsMzYsMzYsMzcsMzcsMzcsMzcsMzcsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzgsMzcsMzcsMzcsMzcsMzcsMzYsMzYsMzYsMzUsMzUsMzUsMzQsMzQsMzQsMzMsMzMsMzMsMzIsMzIsMzEsMzFdLFxuICAvLyAgIFszMywzMywzMywzNCwzNCwzNCwzNSwzNSwzNSwzNSwzNSwzNiwzNiwzNiwzNiwzNiwzNywzNywzNywzNywzNywzNywzNywzNywzNywzNywzNywzNywzNywzNiwzNiwzNiwzNiwzNiwzNSwzNSwzNSwzNSwzNCwzNCwzNCwzMywzMywzMywzMiwzMiwzMiwzMSwzMSwzMF0sXG4gIC8vICAgWzMzLDMzLDM0LDM0LDM0LDM1LDM1LDM1LDM1LDM2LDM2LDM2LDM2LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM3LDM2LDM2LDM2LDM2LDM1LDM1LDM1LDM0LDM0LDM0LDMzLDMzLDMzLDMyLDMyLDMyLDMxLDMxXSxcbiAgLy8gICBbMzIsMzMsMzMsMzMsMzMsMzQsMzQsMzQsMzQsMzUsMzUsMzUsMzUsMzUsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzYsMzUsMzUsMzUsMzUsMzQsMzQsMzQsMzQsMzMsMzMsMzMsMzIsMzIsMzIsMzEsMzEsMzEsMzBdLFxuICAvLyAgIFszMiwzMiwzMiwzMiwzMywzMywzMywzMywzNCwzNCwzNCwzNCwzNCwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNSwzNCwzNCwzNCwzNCwzNCwzMywzMywzMywzMywzMiwzMiwzMiwzMSwzMSwzMSwzMCwzMCwzMF0sXG4gIC8vICAgWzMxLDMxLDMyLDMyLDMyLDMyLDMyLDMzLDMzLDMzLDMzLDMzLDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDM0LDMzLDMzLDMzLDMzLDMzLDMyLDMyLDMyLDMyLDMxLDMxLDMxLDMxLDMwLDMwLDMwLDI5XSxcbiAgLy8gICBbMzEsMzEsMzEsMzEsMzEsMzIsMzIsMzIsMzIsMzIsMzIsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzQsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzMsMzIsMzIsMzIsMzIsMzIsMzEsMzEsMzEsMzEsMzEsMzAsMzAsMzAsMjksMjksMjldLFxuICAvLyAgIFszMCwzMCwzMCwzMSwzMSwzMSwzMSwzMSwzMSwzMiwzMiwzMiwzMiwzMiwzMiwzMiwzMiwzMywzMywzMywzMywzMywzMywzMywzMywzMywzMywzMywzMiwzMiwzMiwzMiwzMiwzMiwzMiwzMiwzMSwzMSwzMSwzMSwzMSwzMCwzMCwzMCwzMCwzMCwyOSwyOSwyOSwyOV0sXG4gIC8vICAgWzI5LDMwLDMwLDMwLDMwLDMwLDMxLDMxLDMxLDMxLDMxLDMxLDMxLDMxLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMyLDMxLDMxLDMxLDMxLDMxLDMxLDMxLDMwLDMwLDMwLDMwLDMwLDI5LDI5LDI5LDI5LDI5LDI4LDI4XSxcbiAgLy8gICBbMjksMjksMjksMjksMzAsMzAsMzAsMzAsMzAsMzAsMzAsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzEsMzAsMzAsMzAsMzAsMzAsMzAsMjksMjksMjksMjksMjksMjgsMjgsMjgsMjhdLFxuICAvLyAgIFsyOSwyOSwyOSwyOSwyOSwyOSwyOSwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMSwzMSwzMSwzMSwzMSwzMSwzMSwzMSwzMSwzMSwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwzMCwyOSwyOSwyOSwyOSwyOSwyOSwyOCwyOCwyOCwyOCwyOCwyN10sXG4gIC8vIF1cbn07XG5cblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL2hlYXRtYXBkYXRhLmpzXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAxXG4gKiovIiwiLy8gSW1tdXRhYmxlIE1pbk1heFxuZnVuY3Rpb24gTWluTWF4KG1pbm1heCkge1xuICB2YXIgbWluID0gKChtaW5tYXggIT09IHVuZGVmaW5lZCkgJiYgbWlubWF4Lmhhc093blByb3BlcnR5KCdtaW4nKSkgPyBcbiAgICBtaW5tYXgubWluIDogSW5maW5pdHk7XG4gIHZhciBtYXggPSAoKG1pbm1heCAhPT0gdW5kZWZpbmVkKSAmJiBtaW5tYXguaGFzT3duUHJvcGVydHkoJ21heCcpKSA/IFxuICAgIG1pbm1heC5tYXggOiAtSW5maW5pdHk7XG5cbiAgdGhpcy5fX2RlZmluZUdldHRlcl9fKCdtaW4nLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbWluO1xuICB9KTtcblxuICB0aGlzLl9fZGVmaW5lR2V0dGVyX18oJ21heCcsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBtYXg7XG4gIH0pO1xufVxuXG5NaW5NYXgucHJvdG90eXBlLnJlZHVjZUFycmF5ID0gZnVuY3Rpb24oYXJyKSB7XG4gIHZhciBtaW4gPSB0aGlzLm1pbjtcbiAgdmFyIG1heCA9IHRoaXMubWF4O1xuICBhcnIuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgIG1pbiA9IE1hdGgubWluKG1pbiwgdmFsdWUpO1xuICAgIG1heCA9IE1hdGgubWF4KG1heCwgdmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuIG5ldyBNaW5NYXgoe21pbjogbWluLCBtYXg6IG1heH0pO1xufTtcblxuTWluTWF4LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1pbk1heDtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbGliL01pbk1heC5qc1xuICoqIG1vZHVsZSBpZCA9IDZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMVxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9yNjYvZXhhbXBsZXMvanMvY29udHJvbHMvT3JiaXRDb250cm9scy5qc1xuXG4vKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGVyaWNoNjY2IC8gaHR0cDovL2VyaWNoYWluZXMuY29tXG4gKi9cblxuLy8gVGhpcyBzZXQgb2YgY29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuIEl0IG1haW50YWluc1xuLy8gdGhlIFwidXBcIiBkaXJlY3Rpb24gYXMgK1ksIHVubGlrZSB0aGUgVHJhY2tiYWxsQ29udHJvbHMuIFRvdWNoIG9uIHRhYmxldCBhbmQgcGhvbmVzIGlzXG4vLyBzdXBwb3J0ZWQuXG4vL1xuLy8gICAgT3JiaXQgLSBsZWZ0IG1vdXNlIC8gdG91Y2g6IG9uZSBmaW5nZXIgbW92ZVxuLy8gICAgWm9vbSAtIG1pZGRsZSBtb3VzZSwgb3IgbW91c2V3aGVlbCAvIHRvdWNoOiB0d28gZmluZ2VyIHNwcmVhZCBvciBzcXVpc2hcbi8vICAgIFBhbiAtIHJpZ2h0IG1vdXNlLCBvciBhcnJvdyBrZXlzIC8gdG91Y2g6IHRocmVlIGZpbnRlciBzd2lwZVxuLy9cbi8vIFRoaXMgaXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAobW9zdCkgVHJhY2tiYWxsQ29udHJvbHMgdXNlZCBpbiBleGFtcGxlcy5cbi8vIFRoYXQgaXMsIGluY2x1ZGUgdGhpcyBqcyBmaWxlIGFuZCB3aGVyZXZlciB5b3Ugc2VlOlxuLy8gICAgICBjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhICk7XG4vLyAgICAgIGNvbnRyb2xzLnRhcmdldC56ID0gMTUwO1xuLy8gU2ltcGxlIHN1YnN0aXR1dGUgXCJPcmJpdENvbnRyb2xzXCIgYW5kIHRoZSBjb250cm9sIHNob3VsZCB3b3JrIGFzLWlzLlxuXG52YXIgVEhSRUUgPSByZXF1aXJlKCcuL3ZlbmRvcicpLnRocmVlO1xuXG5USFJFRS5PcmJpdENvbnRyb2xzID0gZnVuY3Rpb24ob2JqZWN0LCBkb21FbGVtZW50KXtcbiAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gIHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cbiAgLy8gQVBJXG5cbiAgLy8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG4gIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgLy8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIGNvbnRyb2wgb3JiaXRzIGFyb3VuZFxuICAvLyBhbmQgd2hlcmUgaXQgcGFucyB3aXRoIHJlc3BlY3QgdG8uXG4gIHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICAvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG4gIHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cbiAgLy8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICB0aGlzLm5vWm9vbSA9IGZhbHNlO1xuICB0aGlzLnpvb21TcGVlZCA9IDEuMDtcblxuICAvLyBMaW1pdHMgdG8gaG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXRcbiAgdGhpcy5taW5EaXN0YW5jZSA9IDA7XG4gIHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuICAvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuICB0aGlzLm5vUm90YXRlID0gZmFsc2U7XG4gIHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcbiAgdGhpcy5ub1BhbiA9IGZhbHNlO1xuICB0aGlzLmtleVBhblNwZWVkID0gNy4wOyAvLyBwaXhlbHMgbW92ZWQgcGVyIGFycm93IGtleSBwdXNoXG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gYXV0b21hdGljYWxseSByb3RhdGUgYXJvdW5kIHRoZSB0YXJnZXRcbiAgdGhpcy5hdXRvUm90YXRlID0gZmFsc2U7XG4gIHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciByb3VuZCB3aGVuIGZwcyBpcyA2MFxuXG4gIC8vIEhvdyBmYXIgeW91IGNhbiBvcmJpdCB2ZXJ0aWNhbGx5LCB1cHBlciBhbmQgbG93ZXIgbGltaXRzLlxuICAvLyBSYW5nZSBpcyAwIHRvIE1hdGguUEkgcmFkaWFucy5cbiAgdGhpcy5taW5Qb2xhckFuZ2xlID0gMDsgLy8gcmFkaWFuc1xuICB0aGlzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJOyAvLyByYWRpYW5zXG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB1c2Ugb2YgdGhlIGtleXNcbiAgdGhpcy5ub0tleXMgPSBmYWxzZTtcblxuICAvLyBUaGUgZm91ciBhcnJvdyBrZXlzXG4gIHRoaXMua2V5cyA9IHtMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDB9O1xuXG4gIC8vLy8vLy8vLy8vL1xuICAvLyBpbnRlcm5hbHNcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBFUFMgPSAwLjAwMDAwMTtcblxuICB2YXIgcm90YXRlU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgcm90YXRlRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHJvdGF0ZURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuICB2YXIgcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHBhbkRlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHBhbk9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgdmFyIG9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgdmFyIGRvbGx5U3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgZG9sbHlFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgZG9sbHlEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cbiAgdmFyIHBoaURlbHRhID0gMDtcbiAgdmFyIHRoZXRhRGVsdGEgPSAwO1xuICB2YXIgc2NhbGUgPSAxO1xuICB2YXIgcGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICB2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICB2YXIgU1RBVEUgPSB7Tk9ORSA6IC0xLCBST1RBVEUgOiAwLCBET0xMWSA6IDEsIFBBTiA6IDIsIFRPVUNIX1JPVEFURSA6IDMsIFRPVUNIX0RPTExZIDogNCwgVE9VQ0hfUEFOIDogNX07XG5cbiAgdmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuICAvLyBmb3IgcmVzZXRcblxuICB0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuICB0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cbiAgLy8gZXZlbnRzXG5cbiAgdmFyIGNoYW5nZUV2ZW50ID0ge3R5cGU6ICdjaGFuZ2UnfTtcbiAgdmFyIHN0YXJ0RXZlbnQgPSB7dHlwZTogJ3N0YXJ0J307XG4gIHZhciBlbmRFdmVudCA9IHt0eXBlOiAnZW5kJ307XG5cbiAgdGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24oYW5nbGUpe1xuICAgIGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcbiAgICB9XG4gICAgdGhldGFEZWx0YSAtPSBhbmdsZTtcbiAgfTtcblxuICB0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24oYW5nbGUpe1xuICAgIGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcbiAgICB9XG4gICAgcGhpRGVsdGEgLT0gYW5nbGU7XG4gIH07XG5cbiAgLy8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIGxlZnRcbiAgdGhpcy5wYW5MZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2Upe1xuICAgIHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcbiAgICAvLyBnZXQgWCBjb2x1bW4gb2YgbWF0cml4XG4gICAgcGFuT2Zmc2V0LnNldCggdGVbIDAgXSwgdGVbIDEgXSwgdGVbIDIgXSApO1xuICAgIHBhbk9mZnNldC5tdWx0aXBseVNjYWxhcigtZGlzdGFuY2UpO1xuICAgIHBhbi5hZGQoIHBhbk9mZnNldCApO1xuICB9O1xuXG4gIC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSB1cFxuICB0aGlzLnBhblVwID0gZnVuY3Rpb24oZGlzdGFuY2Upe1xuICAgIHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcbiAgICAvLyBnZXQgWSBjb2x1bW4gb2YgbWF0cml4XG4gICAgcGFuT2Zmc2V0LnNldCggdGVbIDQgXSwgdGVbIDUgXSwgdGVbIDYgXSApO1xuICAgIHBhbk9mZnNldC5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKTtcbiAgICBwYW4uYWRkKCBwYW5PZmZzZXQgKTtcbiAgfTtcbiAgXG4gIC8vIHBhc3MgaW4geCx5IG9mIGNoYW5nZSBkZXNpcmVkIGluIHBpeGVsIHNwYWNlLFxuICAvLyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcbiAgdGhpcy5wYW4gPSBmdW5jdGlvbihkZWx0YVgsIGRlbHRhWSl7XG4gICAgdmFyIGVsZW1lbnQgPSBfdGhpcy5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IF90aGlzLmRvbUVsZW1lbnQuYm9keSA6IF90aGlzLmRvbUVsZW1lbnQ7XG5cbiAgICBpZiAoIF90aGlzLm9iamVjdC5mb3YgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIHBlcnNwZWN0aXZlXG4gICAgICB2YXIgcG9zaXRpb24gPSBfdGhpcy5vYmplY3QucG9zaXRpb247XG4gICAgICB2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIF90aGlzLnRhcmdldCApO1xuICAgICAgdmFyIHRhcmdldERpc3RhbmNlID0gb2Zmc2V0Lmxlbmd0aCgpO1xuXG4gICAgICAvLyBoYWxmIG9mIHRoZSBmb3YgaXMgY2VudGVyIHRvIHRvcCBvZiBzY3JlZW5cbiAgICAgIHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKCAoIF90aGlzLm9iamVjdC5mb3YgLyAyICkgKiBNYXRoLlBJIC8gMTgwLjAgKTtcblxuICAgICAgLy8gd2UgYWN0dWFsbHkgZG9uJ3QgdXNlIHNjcmVlbldpZHRoLCBzaW5jZSBwZXJzcGVjdGl2ZSBjYW1lcmEgaXMgZml4ZWQgdG8gc2NyZWVuIGhlaWdodFxuICAgICAgX3RoaXMucGFuTGVmdCggMiAqIGRlbHRhWCAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcbiAgICAgIF90aGlzLnBhblVwKCAyICogZGVsdGFZICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuICAgIH0gZWxzZSBpZiAoIF90aGlzLm9iamVjdC50b3AgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIG9ydGhvZ3JhcGhpY1xuICAgICAgX3RoaXMucGFuTGVmdCggZGVsdGFYICogKF90aGlzLm9iamVjdC5yaWdodCAtIF90aGlzLm9iamVjdC5sZWZ0KSAvIGVsZW1lbnQuY2xpZW50V2lkdGggKTtcbiAgICAgIF90aGlzLnBhblVwKCBkZWx0YVkgKiAoX3RoaXMub2JqZWN0LnRvcCAtIF90aGlzLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FtZXJhIG5laXRoZXIgb3J0aG9ncmFwaGljIG9yIHBlcnNwZWN0aXZlXG4gICAgICBjb25zb2xlLndhcm4oICdXQVJOSU5HOiBPcmJpdENvbnRyb2xzLmpzIGVuY291bnRlcmVkIGFuIHVua25vd24gY2FtZXJhIHR5cGUgLSBwYW4gZGlzYWJsZWQuJyApO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmRvbGx5SW4gPSBmdW5jdGlvbihkb2xseVNjYWxlKXtcbiAgICBpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcbiAgICB9XG4gICAgc2NhbGUgLz0gZG9sbHlTY2FsZTtcbiAgfTtcblxuICB0aGlzLmRvbGx5T3V0ID0gZnVuY3Rpb24oZG9sbHlTY2FsZSl7XG4gICAgaWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG4gICAgfVxuICAgIHNjYWxlICo9IGRvbGx5U2NhbGU7XG4gIH07XG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMub2JqZWN0LnBvc2l0aW9uO1xuXG4gICAgb2Zmc2V0LmNvcHkoIHBvc2l0aW9uICkuc3ViKCB0aGlzLnRhcmdldCApO1xuXG4gICAgLy8gYW5nbGUgZnJvbSB6LWF4aXMgYXJvdW5kIHktYXhpc1xuXG4gICAgdmFyIHRoZXRhID0gTWF0aC5hdGFuMiggb2Zmc2V0LngsIG9mZnNldC56ICk7XG5cbiAgICAvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG4gICAgdmFyIHBoaSA9IE1hdGguYXRhbjIoIE1hdGguc3FydCggb2Zmc2V0LnggKiBvZmZzZXQueCArIG9mZnNldC56ICogb2Zmc2V0LnogKSwgb2Zmc2V0LnkgKTtcblxuICAgIGlmICggdGhpcy5hdXRvUm90YXRlICkge1xuICAgICAgdGhpcy5yb3RhdGVMZWZ0KCBnZXRBdXRvUm90YXRpb25BbmdsZSgpICk7XG4gICAgfVxuXG4gICAgdGhldGEgKz0gdGhldGFEZWx0YTtcbiAgICBwaGkgKz0gcGhpRGVsdGE7XG5cbiAgICAvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuICAgIHBoaSA9IE1hdGgubWF4KCB0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heFBvbGFyQW5nbGUsIHBoaSApICk7XG5cbiAgICAvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG4gICAgcGhpID0gTWF0aC5tYXgoIEVQUywgTWF0aC5taW4oIE1hdGguUEkgLSBFUFMsIHBoaSApICk7XG5cbiAgICB2YXIgcmFkaXVzID0gb2Zmc2V0Lmxlbmd0aCgpICogc2NhbGU7XG5cbiAgICAvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuICAgIHJhZGl1cyA9IE1hdGgubWF4KCB0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbiggdGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzICkgKTtcbiAgICBcbiAgICAvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cbiAgICB0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG4gICAgb2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcbiAgICBvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcbiAgICBvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG4gICAgcG9zaXRpb24uY29weSggdGhpcy50YXJnZXQgKS5hZGQoIG9mZnNldCApO1xuXG4gICAgdGhpcy5vYmplY3QubG9va0F0KCB0aGlzLnRhcmdldCApO1xuXG4gICAgdGhldGFEZWx0YSA9IDA7XG4gICAgcGhpRGVsdGEgPSAwO1xuICAgIHNjYWxlID0gMTtcbiAgICBwYW4uc2V0KCAwLCAwLCAwICk7XG5cbiAgICBpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvKCB0aGlzLm9iamVjdC5wb3NpdGlvbiApID4gMCApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcbiAgICAgIGxhc3RQb3NpdGlvbi5jb3B5KCB0aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuICAgIH1cbiAgfTtcblxuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuICAgIHRoaXMudGFyZ2V0LmNvcHkoIHRoaXMudGFyZ2V0MCApO1xuICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIHRoaXMucG9zaXRpb24wICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCl7XG4gICAgcmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIF90aGlzLmF1dG9Sb3RhdGVTcGVlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpe1xuICAgIHJldHVybiBNYXRoLnBvdyggMC45NSwgX3RoaXMuem9vbVNwZWVkICk7XG4gIH1cblxuICBmdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICggZXZlbnQuYnV0dG9uID09PSAwICkge1xuICAgICAgaWYgKCBfdGhpcy5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuICAgICAgcm90YXRlU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG4gICAgfSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAxICkge1xuICAgICAgaWYgKCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc3RhdGUgPSBTVEFURS5ET0xMWTtcblxuICAgICAgZG9sbHlTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICB9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDIgKSB7XG4gICAgICBpZiAoIF90aGlzLm5vUGFuID09PSB0cnVlICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN0YXRlID0gU1RBVEUuUEFOO1xuXG4gICAgICBwYW5TdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICB9XG5cbiAgICBfdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcbiAgICBfdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTW91c2VNb3ZlKGV2ZW50KXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZWxlbWVudCA9IF90aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gX3RoaXMuZG9tRWxlbWVudC5ib2R5IDogX3RoaXMuZG9tRWxlbWVudDtcblxuICAgIGlmICggc3RhdGUgPT09IFNUQVRFLlJPVEFURSApIHtcbiAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcm90YXRlRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuICAgICAgcm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG4gICAgICAvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG4gICAgICBfdGhpcy5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogX3RoaXMucm90YXRlU3BlZWQgKTtcblxuICAgICAgLy8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG4gICAgICBfdGhpcy5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBfdGhpcy5yb3RhdGVTcGVlZCApO1xuXG4gICAgICByb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcbiAgICB9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuRE9MTFkgKSB7XG4gICAgICBpZiAoIF90aGlzLm5vWm9vbSA9PT0gdHJ1ZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkb2xseUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICAgIGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuICAgICAgaWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuICAgICAgICBfdGhpcy5kb2xseUluKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5kb2xseU91dCgpO1xuICAgICAgfVxuICAgICAgZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuICAgIH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5QQU4gKSB7XG4gICAgICBpZiAoIF90aGlzLm5vUGFuID09PSB0cnVlICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHBhbkVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICAgIHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcbiAgICAgIFxuICAgICAgX3RoaXMucGFuKCBwYW5EZWx0YS54LCBwYW5EZWx0YS55ICk7XG5cbiAgICAgIHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuICAgIH1cblxuICAgIF90aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Nb3VzZVVwKCAvKiBldmVudCAqLyApe1xuICAgIGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX3RoaXMuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG4gICAgX3RoaXMuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcbiAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTW91c2VXaGVlbChldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSB8fCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBkZWx0YSA9IDA7XG5cbiAgICBpZiAoIGV2ZW50LndoZWVsRGVsdGEgIT09IHVuZGVmaW5lZCApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG4gICAgICBkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG4gICAgfSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICE9PSB1bmRlZmluZWQgKSB7IC8vIEZpcmVmb3hcbiAgICAgIGRlbHRhID0gLWV2ZW50LmRldGFpbDtcbiAgICB9XG5cbiAgICBpZiAoIGRlbHRhID4gMCApIHtcbiAgICAgIF90aGlzLmRvbGx5T3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLmRvbGx5SW4oKTtcbiAgICB9XG5cbiAgICBfdGhpcy51cGRhdGUoKTtcbiAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG4gICAgX3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSB8fCBfdGhpcy5ub0tleXMgPT09IHRydWUgfHwgX3RoaXMubm9QYW4gPT09IHRydWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSl7XG4gICAgICBjYXNlIF90aGlzLmtleXMuVVA6IHtcbiAgICAgICAgX3RoaXMucGFuKCAwLCBfdGhpcy5rZXlQYW5TcGVlZCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIF90aGlzLmtleXMuQk9UVE9NOiB7XG4gICAgICAgIF90aGlzLnBhbiggMCwgLV90aGlzLmtleVBhblNwZWVkICk7XG4gICAgICAgIF90aGlzLnVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgX3RoaXMua2V5cy5MRUZUOiB7XG4gICAgICAgIF90aGlzLnBhbihfdGhpcy5rZXlQYW5TcGVlZCwgMCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIF90aGlzLmtleXMuUklHSFQ6IHtcbiAgICAgICAgX3RoaXMucGFuKC1fdGhpcy5rZXlQYW5TcGVlZCwgMCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hzdGFydChldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG4gICAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cbiAgICAgICAgcm90YXRlU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICAvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG4gICAgICAgIGlmICggX3RoaXMubm9ab29tID09PSB0cnVlICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gU1RBVEUuVE9VQ0hfRE9MTFk7XG5cbiAgICAgICAgdmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuICAgICAgICB2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcbiAgICAgICAgZG9sbHlTdGFydC5zZXQoIDAsIGRpc3RhbmNlICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAzOiB7XG4gICAgICAgIC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cbiAgICAgICAgaWYgKCBfdGhpcy5ub1BhbiA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuICAgICAgICBwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2htb3ZlKGV2ZW50KXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgZWxlbWVudCA9IF90aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gX3RoaXMuZG9tRWxlbWVudC5ib2R5IDogX3RoaXMuZG9tRWxlbWVudDtcblxuICAgIHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG4gICAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1JPVEFURSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByb3RhdGVFbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICByb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cbiAgICAgICAgLy8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuICAgICAgICBfdGhpcy5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogX3RoaXMucm90YXRlU3BlZWQgKTtcbiAgICAgICAgLy8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG4gICAgICAgIF90aGlzLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIF90aGlzLnJvdGF0ZVNwZWVkICk7XG5cbiAgICAgICAgcm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cbiAgICAgICAgX3RoaXMudXBkYXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAyOiB7XG4gICAgICAgIC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcbiAgICAgICAgaWYgKCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX0RPTExZICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcbiAgICAgICAgdmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cbiAgICAgICAgZG9sbHlFbmQuc2V0KCAwLCBkaXN0YW5jZSApO1xuICAgICAgICBkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cbiAgICAgICAgaWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuICAgICAgICAgIF90aGlzLmRvbGx5T3V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuZG9sbHlJbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG4gICAgICAgIF90aGlzLnVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMzoge1xuICAgICAgICAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG4gICAgICAgIGlmICggX3RoaXMubm9QYW4gPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1BBTiApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwYW5FbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICBwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG4gICAgICAgIFxuICAgICAgICBfdGhpcy5wYW4oIHBhbkRlbHRhLngsIHBhbkRlbHRhLnkgKTtcblxuICAgICAgICBwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblxuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaGVuZCggLyogZXZlbnQgKi8gKXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG4gICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICB9XG5cbiAgdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKGV2ZW50KXsgXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSwgZmFsc2UpO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG9uTW91c2VEb3duLCBmYWxzZSApO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7XG4gIHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG4gIHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UgKTtcbn07XG5cblRIUkVFLk9yYml0Q29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3Rlc3QvZnVuY3Rpb25hbC9zcmMvb3JiaXRjb250cm9scy5qc1xuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMVxuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImhlYXRtYXB0ZXN0LmJ1bmRsZS5qcyJ9