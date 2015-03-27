require('./orbitcontrols');
var THREE = require('./vendor').three;

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