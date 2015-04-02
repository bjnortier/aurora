var bicycle = require('bicycle');
var $ = bicycle.$;
var Model = bicycle.Model;
var SVGScene = require('bicycle/lib/views/SVGScene');
var SVGView = require('bicycle/lib/views/SVGView');

var gradients = require('../../../').gradients;

var scene = new SVGScene($('#viewport'));

function GradientsModel(f) {
  Model.call(this);
  this.f = f;
}

GradientsModel.prototype = Object.create(Model.prototype);

function GradientsView(scene, model) {
  SVGView.call(this, scene, model);
  this.draw.fixSubPixelOffset();
}

GradientsView.prototype = Object.create(SVGView.prototype);

GradientsView.prototype.onChange = function() {
  SVGView.prototype.onChange.call(this);
  for (var i = 0; i < 255; ++i) {
    var rgba = this.model.f(i/255);
    var colorString = 'rgb(' + 
        Math.round(rgba[0]*255) + ',' +
        Math.round(rgba[1]*255) + ',' +
        Math.round(rgba[2]*255) + ')';
    this.draw.line(i, 0, i, 50).stroke({width: 1, color: colorString});
  }
  this.draw.rect(255, 50).fill('none').stroke({width: 1, color: 'black'});
};

var m1 = new GradientsModel(gradients.blackredyellow);

new GradientsView(scene, m1);

