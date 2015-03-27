require('./orbitcontrols');
var THREE = require('./vendor').three;

function Scene($container) {
  var width = $container.width();
  var height = $container.height();

  // camera
  var camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000);
  camera.position.z = 3;
  this.camera = camera;

  // scene
  var scene = new THREE.Scene();

  // lights
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(-1, -1, -1);
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x222222));

  // var debugBox = new THREE.Mesh(
  //     new THREE.BoxGeometry(1, 1, 0.1),
  //     new THREE.MeshLambertMaterial({color: 0xff0000}));
  // debugBox.position.set(0,0,-0.05);
  // scene.add(debugBox);

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
