var assert = require('assert');
var jsub = require('../src');

describe('jsub', function() {

  describe('with autorized contents', function() {

    it('should work with simple arithmetics', function() {
      var errors = jsub('1 + 1', {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'Program'
        }, {
          type: 'BinaryExpression',
          operator: '+'
        }, {
          type: 'Literal',
          raw: /([0-9]{1,5}|false|true)/
        }]
      });
      assert.equal(errors.length, 0);
    });

  });

  describe('with unautorized contents', function() {

    it('should fail when some simple value conds aren\'t matching', function() {
      var errors = jsub('1 + 1', {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'Program'
        }, {
          type: 'BinaryExpression',
          operator: '-' // Here
        }, {
          type: 'Literal',
          raw: /([0-9]{1,5}|false|true)/
        }]
      });
      assert.equal(errors.length, 2);
    });

    it('should fail when some regExp conds aren\'t matching', function() {
      var errors = jsub('1 + 1', {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'Program'
        }, {
          type: 'BinaryExpression',
          operator: '+'
        }, {
          type: 'Literal',
          raw: /(false|true)/ // Here
        }]
      });
      console.log(errors);
      assert.equal(errors.length, 4);
    });

  });

});
