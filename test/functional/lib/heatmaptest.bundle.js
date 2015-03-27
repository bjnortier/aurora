webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(3).$;
	
	__webpack_require__(4);
	var Scene = __webpack_require__(5);
	
	function TestCase() {
	
	  var $testcaseContainer = $(
	    '<div class="testcase">' + 
	      '<div class="viewport"></div>' +
	    '</div>');
	  $('body').append($testcaseContainer);
	
	  new Scene($testcaseContainer.find('.viewport'));
	
	}
	
	new TestCase();


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports.$ = __webpack_require__(2);
	module.exports.three = __webpack_require__(1);

/***/ },
/* 4 */
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
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
	      new THREE.BoxGeometry(0.5, 0.5, 0.5),
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
	
	  window.addEventListener('resize', resize, false);
	  controls.addEventListener('change', render);
	
	  animate();
	
	  // Resize on the next event loop tick since a scroll bar may have been added
	  // in the meantime.
	  setTimeout(resize, 0);
	
	}
	
	module.exports = Scene;


/***/ }
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL2hlYXRtYXB0ZXN0LmpzIiwid2VicGFjazovLy8uL3Rlc3QvZnVuY3Rpb25hbC9zcmMvdmVuZG9yLmpzIiwid2VicGFjazovLy8uL3Rlc3QvZnVuY3Rpb25hbC9zcmMvb3JiaXRjb250cm9scy5qcyIsIndlYnBhY2s6Ly8vLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL1NjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7Ozs7Ozs7OztBQ2pCQTtBQUNBLCtDOzs7Ozs7QUNEQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0NBQStCO0FBQy9COztBQUVBLHVEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMEJBQXlCOztBQUV6QjtBQUNBO0FBQ0EsOEJBQTZCOztBQUU3QjtBQUNBO0FBQ0EsMEJBQXlCO0FBQ3pCLGdDQUErQjs7QUFFL0I7QUFDQTs7QUFFQTtBQUNBLGdCQUFlOztBQUVmO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxnQkFBZTs7QUFFZjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLHNCQUFxQjtBQUNyQixxQkFBb0I7QUFDcEIsbUJBQWtCOztBQUVsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSw0Q0FBMkM7QUFDM0M7QUFDQSxNQUFLLHlDQUF5QztBQUM5QztBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsb0U7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsNkVBQTRFOztBQUU1RTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7OztBQ2xrQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQ0FBcUMsZ0JBQWdCOztBQUVyRDtBQUNBLDJDQUEwQyxnQkFBZ0I7QUFDMUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSIsInNvdXJjZXNDb250ZW50IjpbInZhciAkID0gcmVxdWlyZSgnLi92ZW5kb3InKS4kO1xuXG5yZXF1aXJlKCcuL29yYml0Y29udHJvbHMnKTtcbnZhciBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxuZnVuY3Rpb24gVGVzdENhc2UoKSB7XG5cbiAgdmFyICR0ZXN0Y2FzZUNvbnRhaW5lciA9ICQoXG4gICAgJzxkaXYgY2xhc3M9XCJ0ZXN0Y2FzZVwiPicgKyBcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld3BvcnRcIj48L2Rpdj4nICtcbiAgICAnPC9kaXY+Jyk7XG4gICQoJ2JvZHknKS5hcHBlbmQoJHRlc3RjYXNlQ29udGFpbmVyKTtcblxuICBuZXcgU2NlbmUoJHRlc3RjYXNlQ29udGFpbmVyLmZpbmQoJy52aWV3cG9ydCcpKTtcblxufVxuXG5uZXcgVGVzdENhc2UoKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL2hlYXRtYXB0ZXN0LmpzXG4gKiogbW9kdWxlIGlkID0gMFxuICoqIG1vZHVsZSBjaHVua3MgPSAxXG4gKiovIiwibW9kdWxlLmV4cG9ydHMuJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xubW9kdWxlLmV4cG9ydHMudGhyZWUgPSByZXF1aXJlKCd0aHJlZScpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi90ZXN0L2Z1bmN0aW9uYWwvc3JjL3ZlbmRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMVxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9yNjYvZXhhbXBsZXMvanMvY29udHJvbHMvT3JiaXRDb250cm9scy5qc1xuXG4vKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKiBAYXV0aG9yIGVyaWNoNjY2IC8gaHR0cDovL2VyaWNoYWluZXMuY29tXG4gKi9cblxuLy8gVGhpcyBzZXQgb2YgY29udHJvbHMgcGVyZm9ybXMgb3JiaXRpbmcsIGRvbGx5aW5nICh6b29taW5nKSwgYW5kIHBhbm5pbmcuIEl0IG1haW50YWluc1xuLy8gdGhlIFwidXBcIiBkaXJlY3Rpb24gYXMgK1ksIHVubGlrZSB0aGUgVHJhY2tiYWxsQ29udHJvbHMuIFRvdWNoIG9uIHRhYmxldCBhbmQgcGhvbmVzIGlzXG4vLyBzdXBwb3J0ZWQuXG4vL1xuLy8gICAgT3JiaXQgLSBsZWZ0IG1vdXNlIC8gdG91Y2g6IG9uZSBmaW5nZXIgbW92ZVxuLy8gICAgWm9vbSAtIG1pZGRsZSBtb3VzZSwgb3IgbW91c2V3aGVlbCAvIHRvdWNoOiB0d28gZmluZ2VyIHNwcmVhZCBvciBzcXVpc2hcbi8vICAgIFBhbiAtIHJpZ2h0IG1vdXNlLCBvciBhcnJvdyBrZXlzIC8gdG91Y2g6IHRocmVlIGZpbnRlciBzd2lwZVxuLy9cbi8vIFRoaXMgaXMgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAobW9zdCkgVHJhY2tiYWxsQ29udHJvbHMgdXNlZCBpbiBleGFtcGxlcy5cbi8vIFRoYXQgaXMsIGluY2x1ZGUgdGhpcyBqcyBmaWxlIGFuZCB3aGVyZXZlciB5b3Ugc2VlOlxuLy8gICAgICBjb250cm9scyA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyggY2FtZXJhICk7XG4vLyAgICAgIGNvbnRyb2xzLnRhcmdldC56ID0gMTUwO1xuLy8gU2ltcGxlIHN1YnN0aXR1dGUgXCJPcmJpdENvbnRyb2xzXCIgYW5kIHRoZSBjb250cm9sIHNob3VsZCB3b3JrIGFzLWlzLlxuXG52YXIgVEhSRUUgPSByZXF1aXJlKCcuL3ZlbmRvcicpLnRocmVlO1xuXG5USFJFRS5PcmJpdENvbnRyb2xzID0gZnVuY3Rpb24ob2JqZWN0LCBkb21FbGVtZW50KXtcbiAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XG4gIHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cbiAgLy8gQVBJXG5cbiAgLy8gU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBjb250cm9sXG4gIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgLy8gXCJ0YXJnZXRcIiBzZXRzIHRoZSBsb2NhdGlvbiBvZiBmb2N1cywgd2hlcmUgdGhlIGNvbnRyb2wgb3JiaXRzIGFyb3VuZFxuICAvLyBhbmQgd2hlcmUgaXQgcGFucyB3aXRoIHJlc3BlY3QgdG8uXG4gIHRoaXMudGFyZ2V0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICAvLyBjZW50ZXIgaXMgb2xkLCBkZXByZWNhdGVkOyB1c2UgXCJ0YXJnZXRcIiBpbnN0ZWFkXG4gIHRoaXMuY2VudGVyID0gdGhpcy50YXJnZXQ7XG5cbiAgLy8gVGhpcyBvcHRpb24gYWN0dWFsbHkgZW5hYmxlcyBkb2xseWluZyBpbiBhbmQgb3V0OyBsZWZ0IGFzIFwiem9vbVwiIGZvclxuICAvLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICB0aGlzLm5vWm9vbSA9IGZhbHNlO1xuICB0aGlzLnpvb21TcGVlZCA9IDEuMDtcblxuICAvLyBMaW1pdHMgdG8gaG93IGZhciB5b3UgY2FuIGRvbGx5IGluIGFuZCBvdXRcbiAgdGhpcy5taW5EaXN0YW5jZSA9IDA7XG4gIHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuICAvLyBTZXQgdG8gdHJ1ZSB0byBkaXNhYmxlIHRoaXMgY29udHJvbFxuICB0aGlzLm5vUm90YXRlID0gZmFsc2U7XG4gIHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB0aGlzIGNvbnRyb2xcbiAgdGhpcy5ub1BhbiA9IGZhbHNlO1xuICB0aGlzLmtleVBhblNwZWVkID0gNy4wOyAvLyBwaXhlbHMgbW92ZWQgcGVyIGFycm93IGtleSBwdXNoXG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gYXV0b21hdGljYWxseSByb3RhdGUgYXJvdW5kIHRoZSB0YXJnZXRcbiAgdGhpcy5hdXRvUm90YXRlID0gZmFsc2U7XG4gIHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciByb3VuZCB3aGVuIGZwcyBpcyA2MFxuXG4gIC8vIEhvdyBmYXIgeW91IGNhbiBvcmJpdCB2ZXJ0aWNhbGx5LCB1cHBlciBhbmQgbG93ZXIgbGltaXRzLlxuICAvLyBSYW5nZSBpcyAwIHRvIE1hdGguUEkgcmFkaWFucy5cbiAgdGhpcy5taW5Qb2xhckFuZ2xlID0gMDsgLy8gcmFkaWFuc1xuICB0aGlzLm1heFBvbGFyQW5nbGUgPSBNYXRoLlBJOyAvLyByYWRpYW5zXG5cbiAgLy8gU2V0IHRvIHRydWUgdG8gZGlzYWJsZSB1c2Ugb2YgdGhlIGtleXNcbiAgdGhpcy5ub0tleXMgPSBmYWxzZTtcblxuICAvLyBUaGUgZm91ciBhcnJvdyBrZXlzXG4gIHRoaXMua2V5cyA9IHtMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDB9O1xuXG4gIC8vLy8vLy8vLy8vL1xuICAvLyBpbnRlcm5hbHNcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBFUFMgPSAwLjAwMDAwMTtcblxuICB2YXIgcm90YXRlU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgcm90YXRlRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHJvdGF0ZURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuICB2YXIgcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHBhbkRlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcbiAgdmFyIHBhbk9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgdmFyIG9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgdmFyIGRvbGx5U3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgZG9sbHlFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuICB2YXIgZG9sbHlEZWx0YSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cbiAgdmFyIHBoaURlbHRhID0gMDtcbiAgdmFyIHRoZXRhRGVsdGEgPSAwO1xuICB2YXIgc2NhbGUgPSAxO1xuICB2YXIgcGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICB2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuICB2YXIgU1RBVEUgPSB7Tk9ORSA6IC0xLCBST1RBVEUgOiAwLCBET0xMWSA6IDEsIFBBTiA6IDIsIFRPVUNIX1JPVEFURSA6IDMsIFRPVUNIX0RPTExZIDogNCwgVE9VQ0hfUEFOIDogNX07XG5cbiAgdmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuICAvLyBmb3IgcmVzZXRcblxuICB0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuICB0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cbiAgLy8gZXZlbnRzXG5cbiAgdmFyIGNoYW5nZUV2ZW50ID0ge3R5cGU6ICdjaGFuZ2UnfTtcbiAgdmFyIHN0YXJ0RXZlbnQgPSB7dHlwZTogJ3N0YXJ0J307XG4gIHZhciBlbmRFdmVudCA9IHt0eXBlOiAnZW5kJ307XG5cbiAgdGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24oYW5nbGUpe1xuICAgIGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcbiAgICB9XG4gICAgdGhldGFEZWx0YSAtPSBhbmdsZTtcbiAgfTtcblxuICB0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24oYW5nbGUpe1xuICAgIGlmICggYW5nbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcbiAgICB9XG4gICAgcGhpRGVsdGEgLT0gYW5nbGU7XG4gIH07XG5cbiAgLy8gcGFzcyBpbiBkaXN0YW5jZSBpbiB3b3JsZCBzcGFjZSB0byBtb3ZlIGxlZnRcbiAgdGhpcy5wYW5MZWZ0ID0gZnVuY3Rpb24oZGlzdGFuY2Upe1xuICAgIHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcbiAgICAvLyBnZXQgWCBjb2x1bW4gb2YgbWF0cml4XG4gICAgcGFuT2Zmc2V0LnNldCggdGVbIDAgXSwgdGVbIDEgXSwgdGVbIDIgXSApO1xuICAgIHBhbk9mZnNldC5tdWx0aXBseVNjYWxhcigtZGlzdGFuY2UpO1xuICAgIHBhbi5hZGQoIHBhbk9mZnNldCApO1xuICB9O1xuXG4gIC8vIHBhc3MgaW4gZGlzdGFuY2UgaW4gd29ybGQgc3BhY2UgdG8gbW92ZSB1cFxuICB0aGlzLnBhblVwID0gZnVuY3Rpb24oZGlzdGFuY2Upe1xuICAgIHZhciB0ZSA9IHRoaXMub2JqZWN0Lm1hdHJpeC5lbGVtZW50cztcbiAgICAvLyBnZXQgWSBjb2x1bW4gb2YgbWF0cml4XG4gICAgcGFuT2Zmc2V0LnNldCggdGVbIDQgXSwgdGVbIDUgXSwgdGVbIDYgXSApO1xuICAgIHBhbk9mZnNldC5tdWx0aXBseVNjYWxhciggZGlzdGFuY2UgKTtcbiAgICBwYW4uYWRkKCBwYW5PZmZzZXQgKTtcbiAgfTtcbiAgXG4gIC8vIHBhc3MgaW4geCx5IG9mIGNoYW5nZSBkZXNpcmVkIGluIHBpeGVsIHNwYWNlLFxuICAvLyByaWdodCBhbmQgZG93biBhcmUgcG9zaXRpdmVcbiAgdGhpcy5wYW4gPSBmdW5jdGlvbihkZWx0YVgsIGRlbHRhWSl7XG4gICAgdmFyIGVsZW1lbnQgPSBfdGhpcy5kb21FbGVtZW50ID09PSBkb2N1bWVudCA/IF90aGlzLmRvbUVsZW1lbnQuYm9keSA6IF90aGlzLmRvbUVsZW1lbnQ7XG5cbiAgICBpZiAoIF90aGlzLm9iamVjdC5mb3YgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIHBlcnNwZWN0aXZlXG4gICAgICB2YXIgcG9zaXRpb24gPSBfdGhpcy5vYmplY3QucG9zaXRpb247XG4gICAgICB2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIoIF90aGlzLnRhcmdldCApO1xuICAgICAgdmFyIHRhcmdldERpc3RhbmNlID0gb2Zmc2V0Lmxlbmd0aCgpO1xuXG4gICAgICAvLyBoYWxmIG9mIHRoZSBmb3YgaXMgY2VudGVyIHRvIHRvcCBvZiBzY3JlZW5cbiAgICAgIHRhcmdldERpc3RhbmNlICo9IE1hdGgudGFuKCAoIF90aGlzLm9iamVjdC5mb3YgLyAyICkgKiBNYXRoLlBJIC8gMTgwLjAgKTtcblxuICAgICAgLy8gd2UgYWN0dWFsbHkgZG9uJ3QgdXNlIHNjcmVlbldpZHRoLCBzaW5jZSBwZXJzcGVjdGl2ZSBjYW1lcmEgaXMgZml4ZWQgdG8gc2NyZWVuIGhlaWdodFxuICAgICAgX3RoaXMucGFuTGVmdCggMiAqIGRlbHRhWCAqIHRhcmdldERpc3RhbmNlIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcbiAgICAgIF90aGlzLnBhblVwKCAyICogZGVsdGFZICogdGFyZ2V0RGlzdGFuY2UgLyBlbGVtZW50LmNsaWVudEhlaWdodCApO1xuICAgIH0gZWxzZSBpZiAoIF90aGlzLm9iamVjdC50b3AgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIG9ydGhvZ3JhcGhpY1xuICAgICAgX3RoaXMucGFuTGVmdCggZGVsdGFYICogKF90aGlzLm9iamVjdC5yaWdodCAtIF90aGlzLm9iamVjdC5sZWZ0KSAvIGVsZW1lbnQuY2xpZW50V2lkdGggKTtcbiAgICAgIF90aGlzLnBhblVwKCBkZWx0YVkgKiAoX3RoaXMub2JqZWN0LnRvcCAtIF90aGlzLm9iamVjdC5ib3R0b20pIC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FtZXJhIG5laXRoZXIgb3J0aG9ncmFwaGljIG9yIHBlcnNwZWN0aXZlXG4gICAgICBjb25zb2xlLndhcm4oICdXQVJOSU5HOiBPcmJpdENvbnRyb2xzLmpzIGVuY291bnRlcmVkIGFuIHVua25vd24gY2FtZXJhIHR5cGUgLSBwYW4gZGlzYWJsZWQuJyApO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLmRvbGx5SW4gPSBmdW5jdGlvbihkb2xseVNjYWxlKXtcbiAgICBpZiAoIGRvbGx5U2NhbGUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGRvbGx5U2NhbGUgPSBnZXRab29tU2NhbGUoKTtcbiAgICB9XG4gICAgc2NhbGUgLz0gZG9sbHlTY2FsZTtcbiAgfTtcblxuICB0aGlzLmRvbGx5T3V0ID0gZnVuY3Rpb24oZG9sbHlTY2FsZSl7XG4gICAgaWYgKCBkb2xseVNjYWxlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBkb2xseVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG4gICAgfVxuICAgIHNjYWxlICo9IGRvbGx5U2NhbGU7XG4gIH07XG5cbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMub2JqZWN0LnBvc2l0aW9uO1xuXG4gICAgb2Zmc2V0LmNvcHkoIHBvc2l0aW9uICkuc3ViKCB0aGlzLnRhcmdldCApO1xuXG4gICAgLy8gYW5nbGUgZnJvbSB6LWF4aXMgYXJvdW5kIHktYXhpc1xuXG4gICAgdmFyIHRoZXRhID0gTWF0aC5hdGFuMiggb2Zmc2V0LngsIG9mZnNldC56ICk7XG5cbiAgICAvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG4gICAgdmFyIHBoaSA9IE1hdGguYXRhbjIoIE1hdGguc3FydCggb2Zmc2V0LnggKiBvZmZzZXQueCArIG9mZnNldC56ICogb2Zmc2V0LnogKSwgb2Zmc2V0LnkgKTtcblxuICAgIGlmICggdGhpcy5hdXRvUm90YXRlICkge1xuICAgICAgdGhpcy5yb3RhdGVMZWZ0KCBnZXRBdXRvUm90YXRpb25BbmdsZSgpICk7XG4gICAgfVxuXG4gICAgdGhldGEgKz0gdGhldGFEZWx0YTtcbiAgICBwaGkgKz0gcGhpRGVsdGE7XG5cbiAgICAvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuICAgIHBoaSA9IE1hdGgubWF4KCB0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKCB0aGlzLm1heFBvbGFyQW5nbGUsIHBoaSApICk7XG5cbiAgICAvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG4gICAgcGhpID0gTWF0aC5tYXgoIEVQUywgTWF0aC5taW4oIE1hdGguUEkgLSBFUFMsIHBoaSApICk7XG5cbiAgICB2YXIgcmFkaXVzID0gb2Zmc2V0Lmxlbmd0aCgpICogc2NhbGU7XG5cbiAgICAvLyByZXN0cmljdCByYWRpdXMgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuICAgIHJhZGl1cyA9IE1hdGgubWF4KCB0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbiggdGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzICkgKTtcbiAgICBcbiAgICAvLyBtb3ZlIHRhcmdldCB0byBwYW5uZWQgbG9jYXRpb25cbiAgICB0aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG4gICAgb2Zmc2V0LnggPSByYWRpdXMgKiBNYXRoLnNpbiggcGhpICkgKiBNYXRoLnNpbiggdGhldGEgKTtcbiAgICBvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKCBwaGkgKTtcbiAgICBvZmZzZXQueiA9IHJhZGl1cyAqIE1hdGguc2luKCBwaGkgKSAqIE1hdGguY29zKCB0aGV0YSApO1xuXG4gICAgcG9zaXRpb24uY29weSggdGhpcy50YXJnZXQgKS5hZGQoIG9mZnNldCApO1xuXG4gICAgdGhpcy5vYmplY3QubG9va0F0KCB0aGlzLnRhcmdldCApO1xuXG4gICAgdGhldGFEZWx0YSA9IDA7XG4gICAgcGhpRGVsdGEgPSAwO1xuICAgIHNjYWxlID0gMTtcbiAgICBwYW4uc2V0KCAwLCAwLCAwICk7XG5cbiAgICBpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvKCB0aGlzLm9iamVjdC5wb3NpdGlvbiApID4gMCApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcbiAgICAgIGxhc3RQb3NpdGlvbi5jb3B5KCB0aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuICAgIH1cbiAgfTtcblxuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuICAgIHRoaXMudGFyZ2V0LmNvcHkoIHRoaXMudGFyZ2V0MCApO1xuICAgIHRoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIHRoaXMucG9zaXRpb24wICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCl7XG4gICAgcmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIF90aGlzLmF1dG9Sb3RhdGVTcGVlZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpe1xuICAgIHJldHVybiBNYXRoLnBvdyggMC45NSwgX3RoaXMuem9vbVNwZWVkICk7XG4gIH1cblxuICBmdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICggZXZlbnQuYnV0dG9uID09PSAwICkge1xuICAgICAgaWYgKCBfdGhpcy5ub1JvdGF0ZSA9PT0gdHJ1ZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuICAgICAgcm90YXRlU3RhcnQuc2V0KCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZICk7XG4gICAgfSBlbHNlIGlmICggZXZlbnQuYnV0dG9uID09PSAxICkge1xuICAgICAgaWYgKCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc3RhdGUgPSBTVEFURS5ET0xMWTtcblxuICAgICAgZG9sbHlTdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICB9IGVsc2UgaWYgKCBldmVudC5idXR0b24gPT09IDIgKSB7XG4gICAgICBpZiAoIF90aGlzLm5vUGFuID09PSB0cnVlICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN0YXRlID0gU1RBVEUuUEFOO1xuXG4gICAgICBwYW5TdGFydC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICB9XG5cbiAgICBfdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UgKTtcbiAgICBfdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwLCBmYWxzZSApO1xuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTW91c2VNb3ZlKGV2ZW50KXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgZWxlbWVudCA9IF90aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gX3RoaXMuZG9tRWxlbWVudC5ib2R5IDogX3RoaXMuZG9tRWxlbWVudDtcblxuICAgIGlmICggc3RhdGUgPT09IFNUQVRFLlJPVEFURSApIHtcbiAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcm90YXRlRW5kLnNldCggZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSApO1xuICAgICAgcm90YXRlRGVsdGEuc3ViVmVjdG9ycyggcm90YXRlRW5kLCByb3RhdGVTdGFydCApO1xuXG4gICAgICAvLyByb3RhdGluZyBhY3Jvc3Mgd2hvbGUgc2NyZWVuIGdvZXMgMzYwIGRlZ3JlZXMgYXJvdW5kXG4gICAgICBfdGhpcy5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogX3RoaXMucm90YXRlU3BlZWQgKTtcblxuICAgICAgLy8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG4gICAgICBfdGhpcy5yb3RhdGVVcCggMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gZWxlbWVudC5jbGllbnRIZWlnaHQgKiBfdGhpcy5yb3RhdGVTcGVlZCApO1xuXG4gICAgICByb3RhdGVTdGFydC5jb3B5KCByb3RhdGVFbmQgKTtcbiAgICB9IGVsc2UgaWYgKCBzdGF0ZSA9PT0gU1RBVEUuRE9MTFkgKSB7XG4gICAgICBpZiAoIF90aGlzLm5vWm9vbSA9PT0gdHJ1ZSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkb2xseUVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICAgIGRvbGx5RGVsdGEuc3ViVmVjdG9ycyggZG9sbHlFbmQsIGRvbGx5U3RhcnQgKTtcblxuICAgICAgaWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuICAgICAgICBfdGhpcy5kb2xseUluKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5kb2xseU91dCgpO1xuICAgICAgfVxuICAgICAgZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuICAgIH0gZWxzZSBpZiAoIHN0YXRlID09PSBTVEFURS5QQU4gKSB7XG4gICAgICBpZiAoIF90aGlzLm5vUGFuID09PSB0cnVlICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHBhbkVuZC5zZXQoIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkgKTtcbiAgICAgIHBhbkRlbHRhLnN1YlZlY3RvcnMoIHBhbkVuZCwgcGFuU3RhcnQgKTtcbiAgICAgIFxuICAgICAgX3RoaXMucGFuKCBwYW5EZWx0YS54LCBwYW5EZWx0YS55ICk7XG5cbiAgICAgIHBhblN0YXJ0LmNvcHkoIHBhbkVuZCApO1xuICAgIH1cblxuICAgIF90aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Nb3VzZVVwKCAvKiBldmVudCAqLyApe1xuICAgIGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX3RoaXMuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIGZhbHNlICk7XG4gICAgX3RoaXMuZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UgKTtcbiAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uTW91c2VXaGVlbChldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSB8fCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciBkZWx0YSA9IDA7XG5cbiAgICBpZiAoIGV2ZW50LndoZWVsRGVsdGEgIT09IHVuZGVmaW5lZCApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG4gICAgICBkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG4gICAgfSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICE9PSB1bmRlZmluZWQgKSB7IC8vIEZpcmVmb3hcbiAgICAgIGRlbHRhID0gLWV2ZW50LmRldGFpbDtcbiAgICB9XG5cbiAgICBpZiAoIGRlbHRhID4gMCApIHtcbiAgICAgIF90aGlzLmRvbGx5T3V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF90aGlzLmRvbGx5SW4oKTtcbiAgICB9XG5cbiAgICBfdGhpcy51cGRhdGUoKTtcbiAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG4gICAgX3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSB8fCBfdGhpcy5ub0tleXMgPT09IHRydWUgfHwgX3RoaXMubm9QYW4gPT09IHRydWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSl7XG4gICAgICBjYXNlIF90aGlzLmtleXMuVVA6IHtcbiAgICAgICAgX3RoaXMucGFuKCAwLCBfdGhpcy5rZXlQYW5TcGVlZCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIF90aGlzLmtleXMuQk9UVE9NOiB7XG4gICAgICAgIF90aGlzLnBhbiggMCwgLV90aGlzLmtleVBhblNwZWVkICk7XG4gICAgICAgIF90aGlzLnVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgX3RoaXMua2V5cy5MRUZUOiB7XG4gICAgICAgIF90aGlzLnBhbihfdGhpcy5rZXlQYW5TcGVlZCwgMCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIF90aGlzLmtleXMuUklHSFQ6IHtcbiAgICAgICAgX3RoaXMucGFuKC1fdGhpcy5rZXlQYW5TcGVlZCwgMCApO1xuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2hzdGFydChldmVudCl7XG4gICAgaWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG4gICAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cbiAgICAgICAgcm90YXRlU3RhcnQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMjoge1xuICAgICAgICAvLyB0d28tZmluZ2VyZWQgdG91Y2g6IGRvbGx5XG4gICAgICAgIGlmICggX3RoaXMubm9ab29tID09PSB0cnVlICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gU1RBVEUuVE9VQ0hfRE9MTFk7XG5cbiAgICAgICAgdmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuICAgICAgICB2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcbiAgICAgICAgZG9sbHlTdGFydC5zZXQoIDAsIGRpc3RhbmNlICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAzOiB7XG4gICAgICAgIC8vIHRocmVlLWZpbmdlcmVkIHRvdWNoOiBwYW5cbiAgICAgICAgaWYgKCBfdGhpcy5ub1BhbiA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IFNUQVRFLlRPVUNIX1BBTjtcblxuICAgICAgICBwYW5TdGFydC5zZXQoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBzdGF0ZSA9IFNUQVRFLk5PTkU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuICB9XG5cbiAgZnVuY3Rpb24gdG91Y2htb3ZlKGV2ZW50KXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB2YXIgZWxlbWVudCA9IF90aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ID8gX3RoaXMuZG9tRWxlbWVudC5ib2R5IDogX3RoaXMuZG9tRWxlbWVudDtcblxuICAgIHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIC8vIG9uZS1maW5nZXJlZCB0b3VjaDogcm90YXRlXG4gICAgICAgIGlmICggX3RoaXMubm9Sb3RhdGUgPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1JPVEFURSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByb3RhdGVFbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICByb3RhdGVEZWx0YS5zdWJWZWN0b3JzKCByb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0ICk7XG5cbiAgICAgICAgLy8gcm90YXRpbmcgYWNyb3NzIHdob2xlIHNjcmVlbiBnb2VzIDM2MCBkZWdyZWVzIGFyb3VuZFxuICAgICAgICBfdGhpcy5yb3RhdGVMZWZ0KCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBlbGVtZW50LmNsaWVudFdpZHRoICogX3RoaXMucm90YXRlU3BlZWQgKTtcbiAgICAgICAgLy8gcm90YXRpbmcgdXAgYW5kIGRvd24gYWxvbmcgd2hvbGUgc2NyZWVuIGF0dGVtcHRzIHRvIGdvIDM2MCwgYnV0IGxpbWl0ZWQgdG8gMTgwXG4gICAgICAgIF90aGlzLnJvdGF0ZVVwKCAyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnkgLyBlbGVtZW50LmNsaWVudEhlaWdodCAqIF90aGlzLnJvdGF0ZVNwZWVkICk7XG5cbiAgICAgICAgcm90YXRlU3RhcnQuY29weSggcm90YXRlRW5kICk7XG5cbiAgICAgICAgX3RoaXMudXBkYXRlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAyOiB7XG4gICAgICAgIC8vIHR3by1maW5nZXJlZCB0b3VjaDogZG9sbHlcbiAgICAgICAgaWYgKCBfdGhpcy5ub1pvb20gPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX0RPTExZICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcbiAgICAgICAgdmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cbiAgICAgICAgZG9sbHlFbmQuc2V0KCAwLCBkaXN0YW5jZSApO1xuICAgICAgICBkb2xseURlbHRhLnN1YlZlY3RvcnMoIGRvbGx5RW5kLCBkb2xseVN0YXJ0ICk7XG5cbiAgICAgICAgaWYgKCBkb2xseURlbHRhLnkgPiAwICkge1xuICAgICAgICAgIF90aGlzLmRvbGx5T3V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuZG9sbHlJbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9sbHlTdGFydC5jb3B5KCBkb2xseUVuZCApO1xuXG4gICAgICAgIF90aGlzLnVwZGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgMzoge1xuICAgICAgICAvLyB0aHJlZS1maW5nZXJlZCB0b3VjaDogcGFuXG4gICAgICAgIGlmICggX3RoaXMubm9QYW4gPT09IHRydWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICggc3RhdGUgIT09IFNUQVRFLlRPVUNIX1BBTiApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwYW5FbmQuc2V0KCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApO1xuICAgICAgICBwYW5EZWx0YS5zdWJWZWN0b3JzKCBwYW5FbmQsIHBhblN0YXJ0ICk7XG4gICAgICAgIFxuICAgICAgICBfdGhpcy5wYW4oIHBhbkRlbHRhLngsIHBhbkRlbHRhLnkgKTtcblxuICAgICAgICBwYW5TdGFydC5jb3B5KCBwYW5FbmQgKTtcblxuICAgICAgICBfdGhpcy51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHN0YXRlID0gU1RBVEUuTk9ORTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0b3VjaGVuZCggLyogZXZlbnQgKi8gKXtcbiAgICBpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG4gICAgc3RhdGUgPSBTVEFURS5OT05FO1xuICB9XG5cbiAgdGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uKGV2ZW50KXsgXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSwgZmFsc2UpO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG9uTW91c2VEb3duLCBmYWxzZSApO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7XG4gIHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuICB0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG4gIHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UgKTtcbn07XG5cblRIUkVFLk9yYml0Q29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3Rlc3QvZnVuY3Rpb25hbC9zcmMvb3JiaXRjb250cm9scy5qc1xuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMVxuICoqLyIsInJlcXVpcmUoJy4vb3JiaXRjb250cm9scycpO1xudmFyIFRIUkVFID0gcmVxdWlyZSgnLi92ZW5kb3InKS50aHJlZTtcblxuZnVuY3Rpb24gU2NlbmUoJGNvbnRhaW5lcikge1xuICB2YXIgd2lkdGggPSAkY29udGFpbmVyLndpZHRoKCk7XG4gIHZhciBoZWlnaHQgPSAkY29udGFpbmVyLmhlaWdodCgpO1xuXG4gIC8vIGNhbWVyYVxuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDYwLCB3aWR0aC9oZWlnaHQsIDAuMSwgMTAwMCApO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDM7XG4gIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuXG4gIC8vIHNjZW5lXG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIC8vIGxpZ2h0c1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmKTtcbiAgZGlyZWN0aW9uYWxMaWdodC5wb3NpdGlvbi5zZXQoLTEsIC0xLCAtMSk7XG4gIHNjZW5lLmFkZChkaXJlY3Rpb25hbExpZ2h0KTtcbiAgc2NlbmUuYWRkKG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHgyMjIyMjIpKTtcblxuICBzY2VuZS5hZGQobmV3IFRIUkVFLk1lc2goXG4gICAgICBuZXcgVEhSRUUuQm94R2VvbWV0cnkoMC41LCAwLjUsIDAuNSksXG4gICAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7Y29sb3I6IDB4ZmYwMDAwfSkpKTtcblxuICAvLyByZW5kZXJlclxuICB2YXIgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7YW50aWFsaWFzOiB0cnVlfSk7XG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHhmZmZmZmYsIDEpO1xuICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAkY29udGFpbmVyWzBdLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gIC8vIGNvbnRyb2xzXG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gIGNvbnRyb2xzLmRhbXBpbmcgPSAwLjI7XG4gIHRoaXMuY29udHJvbHMgPSBjb250cm9scztcbiAgXG4gIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uY29weShjYW1lcmEucG9zaXRpb24pO1xuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSAkY29udGFpbmVyLndpZHRoKCk7XG4gICAgdmFyIGhlaWdodCA9IE1hdGguZmxvb3Iod2lkdGgqOS8xNik7XG4gICAgJGNvbnRhaW5lci5oZWlnaHQoaGVpZ2h0KTtcbiAgICBjYW1lcmEuYXNwZWN0ID0gd2lkdGgvaGVpZ2h0O1xuICAgIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICByZW5kZXIoKTtcbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemUsIGZhbHNlKTtcbiAgY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgcmVuZGVyKTtcblxuICBhbmltYXRlKCk7XG5cbiAgLy8gUmVzaXplIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3AgdGljayBzaW5jZSBhIHNjcm9sbCBiYXIgbWF5IGhhdmUgYmVlbiBhZGRlZFxuICAvLyBpbiB0aGUgbWVhbnRpbWUuXG4gIHNldFRpbWVvdXQocmVzaXplLCAwKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjZW5lO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3Rlc3QvZnVuY3Rpb25hbC9zcmMvU2NlbmUuanNcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDFcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJoZWF0bWFwdGVzdC5idW5kbGUuanMifQ==