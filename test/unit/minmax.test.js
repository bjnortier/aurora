var chai = require('chai');
var assert = chai.assert;

var MinMax = require('../../lib/MinMax');

describe('MinMax', function() {

  it('can determine the min/max of an array', function() {

    var m1 = new MinMax();
    assert.equal(m1.min, Infinity);
    assert.equal(m1.max, -Infinity);

    var m2 = new MinMax({min: 0, max: 0});
    assert.equal(m2.min, 0);
    assert.equal(m2.max, 0);

    var m3 = new MinMax().reduceArray([]);
    assert.equal(m3.min, Infinity);
    assert.equal(m3.max, -Infinity);

    var m4 = new MinMax().reduceArray([-3, 50, 4, 20]);
    assert.equal(m4.min, -3);
    assert.equal(m4.max, 50);

  });

});