var assert = require('assert');
var jsub = require('../src');
var esprima = require('esprima');

function getErrorCode(error) {
  return error.code;
}

describe('jsub', function() {

  describe('with autorized contents', function() {

    it('should work with simple arithmetics', function() {
      var script = '1 + 1';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: '+'
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      };

      assert.deepEqual(
        jsub(syntax, ast),
        []
      );
    });

    it('should work with defined functions calls', function() {
      var script = '1 + 1 + taskValue("abbacacaabbacacaabbacaca")';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
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
      };

      assert.deepEqual(
        jsub(syntax, ast),
        []
      );
    });

    it('should work with array conds', function() {
      var script = '3 + 9 * 5 - 6';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: ['+', '-', '*', '/']
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      };

      assert.deepEqual(
        jsub(syntax, ast),
        []
      );
    });

    it('should work with complexer nested expressions', function() {
      var script = '(taskValue("abbacacaabbacacaabbacaca") > 1  ||' +
        ' taskValue("abbacacaabbacacaabbacaca") < 2) && (1+2 == 3)';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: ['>', '<', '+', '==']
        }, {
          type: 'LogicalExpression',
          operator: ['||', '&&']
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
      };

      assert.deepEqual(
        jsub(syntax, ast),
        []
      );
    });

    it('should work with the README sample', function() {
      var script = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        context: {
          categories: {
            fruits: [],
            vegetables: []
          }
        },
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: ['*', '-']
        }, {
          type: 'Literal',
          raw: /^[0-9]{1,5}$/
        }, {
          type: 'CallExpression',
          '$_': function(expression) {
            return expression.callee &&
              'Identifier' === expression.callee.type &&
              'lengthOf' === expression.callee.name &&
              1 === expression.arguments.length &&
              'Literal' === expression.arguments[0].type &&
              /^fruits|vegetables$/.test(expression.arguments[0].value);
          }
        }]
      };

      assert.deepEqual(
        jsub(syntax, ast),
        []
      );
    });

  });

  describe('with unautorized contents', function() {

    it('should fail when some simple value conds aren\'t matching', function() {
      var script = '1 + 1';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: '-' // Here
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      };
      assert.deepEqual(
        jsub(syntax, ast).map(getErrorCode),
        ['E_BAD_EXPRESSION', 'E_BAD_EXPRESSION']
      );
    });

    it('should fail when trying to access window', function() {
      var script = 'document.cookies;';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: '-' // Here
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      };

      assert.deepEqual(
        jsub(syntax, ast).map(getErrorCode),
        ['E_BAD_EXPRESSION', 'E_BAD_EXPRESSION']
      );
    });

    it('should fail when some regExp conds aren\'t matching', function() {
      var script = '1 + 1';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: '+'
        }, {
          type: 'Literal',
          raw: /^(false|true)$/ // Here
        }]
      };

      assert.deepEqual(
        jsub(syntax, ast).map(getErrorCode),
        [
          'E_BAD_EXPRESSION', 'E_BAD_EXPRESSION',
          'E_BAD_EXPRESSION', 'E_BAD_EXPRESSION'
        ]
      );
    });

    it('should throw when conds aren\'t recognized', function() {
      var script = '1 + 1';
      var ast = esprima.parse(script, {loc: true});
      var syntax = {
        conditions: [{
          ahah: null
        }, {
          type: 'Program'
        }, {
          type: 'ExpressionStatement'
        }, {
          type: 'BinaryExpression',
          operator: '-' // Here
        }, {
          type: 'Literal',
          raw: /^([0-9]{1,5}|false|true)$/
        }]
      };
      assert.throws(function() {
        jsub(syntax, ast);
      });
    });

  });

});
