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
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      });
      assert.equal(errors.length, 0);
    });

    it('should work with defined functions calls', function() {
      var errors = jsub('1 + 1 + taskValue("abbacacaabbacacaabbacaca")', {
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
          raw: /^([0-9]{1,5}|false|true)$/
        }, {
          type: 'CallExpression',
          '$_': function(expression) {
            return expression.callee &&
              'Identifier' === expression.callee.type &&
              'taskValue' === expression.callee.name &&
              1 === expression.arguments.length &&
              'Literal' === expression.arguments[0].type &&
              /^([0-9a-f]{24})$/.test(expression.arguments[0].value);
          }
        }]
      });
      assert.equal(errors.length, 0);
    });

    it('should work with array conds', function() {
      var errors = jsub('3 + 9 * 5 - 6', {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'Program'
        }, {
          type: 'BinaryExpression',
          operator: ['+', '-', '*', '/']
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
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
          raw: /^([0-9]{1,5}|false|true)$/
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
          raw: /^(false|true)$/ // Here
        }]
      });
      assert.equal(errors.length, 4);
    });

    it('should throw when conds aren\'t recognized', function() {
      assert.throws(function() {
        jsub('1 + 1', {
          conditions: [{
            ahah: null
          }, {
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
            raw: /^([0-9]{1,5}|false|true)$/
          }]
        });
      });
    });

  });

});
