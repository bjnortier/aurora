var flow = require('flow');
var Controller = flow.Controller;

function ViewPositionEventController(model, sourceView, coordinateLabelView) {
  Controller.call(this, model);

  sourceView.on('mouseenter', function() {
    coordinateLabelView.show();
  });

  sourceView.on('mouseover', function(event, position) {
    coordinateLabelView.update(position);
  });

  sourceView.on('mouseleave', function() {
    coordinateLabelView.hide();
  });

}

ViewPositionEventController.prototype = Object.create(Controller.prototype);

module.exports = ViewPositionEventController;