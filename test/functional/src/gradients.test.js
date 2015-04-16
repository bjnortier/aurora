var flow = require('flow');
var $ = flow.$;
var Model = flow.Model;
var SVGScene = flow.scenes.SVGScene;
var SVGView = flow.views.SVGView;

var gradients = require('../../../').gradients;

var scene = new SVGScene($('#viewport'));

function GradientsModel(f) {
  Model.call(this);
  this.f = f;
}

GradientsModel.prototype = Object.create(Model.prototype);

function GradientsView(scene, model, options) {
  SVGView.call(this, scene, model);
  this.label = options.label;
  if ((options !== undefined) && (options.position !== undefined)) {
    console.log(this.group);
    this.group.move(options.position.x, options.position.y);
  }
  this.render();
}

GradientsView.prototype = Object.create(SVGView.prototype);

GradientsView.prototype.render = function() {
  SVGView.prototype.render.call(this);
  this.group.text(this.label);
  for (var i = 0; i < 255; ++i) {
    var rgba = this.model.f(i/255);
    var colorString = 'rgb(' + 
        Math.round(rgba[0]*255) + ',' +
        Math.round(rgba[1]*255) + ',' +
        Math.round(rgba[2]*255) + ')';
    this.group.line(i, 30, i, 80).stroke({width: 1, color: colorString});
  }
  this.group.rect(255, 50).move(0, 30).fill('none').stroke({width: 1, color: 'black'});
};

var m1 = new GradientsModel(gradients.blackredyellow);
var m2 = new GradientsModel(gradients.bluecyangreenyellowred);

new GradientsView(scene, m1, {position: {x: 0, y: 0}, label: 'blackredyellow'});
new GradientsView(scene, m2, {position: {x: 0, y: 100}, label: 'bluecyangreenyellowred'});

