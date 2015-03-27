var $ = require('./vendor').$;

require('./orbitcontrols');
var Scene = require('./Scene');

function TestCase() {

  var $testcaseContainer = $(
    '<div class="testcase">' + 
      '<div class="viewport"></div>' +
    '</div>');
  $('body').append($testcaseContainer);

  new Scene($testcaseContainer.find('.viewport'));

}

new TestCase();
