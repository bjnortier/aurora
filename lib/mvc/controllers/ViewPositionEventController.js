var flow = require('flow');
var Controller = flow.Controller;

class ViewPositionEventController extends Controller {

  constructor(model, sourceView, coordinateLabelView) {
    super(model);

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

}

module.exports = ViewPositionEventController;