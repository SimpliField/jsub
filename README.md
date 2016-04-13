# jsub
> JavaScript library to create JavaScript subsets.

[![NPM version](https://badge.fury.io/js/jsub.svg)](https://npmjs.org/package/jsub)
[![Build status](https://secure.travis-ci.org/SimpliField/jsub.svg)](https://travis-ci.org/SimpliField/jsub)
[![Dependency Status](https://david-dm.org/SimpliField/jsub.svg)](https://david-dm.org/SimpliField/jsub)
[![devDependency Status](https://david-dm.org/SimpliField/jsub/dev-status.svg)](https://david-dm.org/SimpliField/jsub#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/SimpliField/jsub/badge.svg?branch=master)](https://coveralls.io/r/SimpliField/jsub?branch=master)
[![Code Climate](https://codeclimate.com/github/SimpliField/jsub.svg)](https://codeclimate.com/github/SimpliField/jsub)

## Usage

Simply require `jsub` and test your scripts against your own JavaScript subset
 syntax definition. Scripts must be provided as
 [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) with tools like
 Esprima or the [Reflect.parse](https://github.com/estree/estree) API:

```js
var jsub = require('jsub');
var esprima = require('esprima');

var syntax = {
  context: {
    categories: {
      fruits: [],
      vegetables: [],
    },
  },
  conditions: [{
    type: 'Program',
  }, {
    type: 'ExpressionStatement',
  }, {
    type: 'BinaryExpression',
    operator: ['*', '-'],
  }, {
    type: 'Literal',
    raw: /^[0-9]{1,5}$/,
  }, {
    type: 'CallExpression',
    // The $_ property creates a custom parser that will by-pass the actual
    // jsub embedded child expression checker. You should use this extremely
    // carefully and heavily test it. It must return an array of errors that
    // prevented the rule to apply, empty if it successfully applied.
    '$_': function(expression) {
      // Check function name
      if(
        (!expression.callee) ||
        'Identifier' !== expression.callee.type ||
        'lengthOf' !== expression.callee.name
      ) {
        return [new Error('E_BAD_FUNCTION_NAME')];
      }
      if(
        1 !== expression.arguments.length ||
        'Literal' !== expression.arguments[0].type ||
        !/^fruits|vegetables$/.test(expression.arguments[0].value)
      ) {
        return [new Error('E_BAD_FUNCTION_ARGS')];
      }
      return [];
    },
  }, {
    type: 'CallExpression',
    // The $_ property is also usefull to check sub syntaxes
    '$_': function(expression) {
      return jsub.bind(null, {
        type: 'Literal',
        raw: /^[0-9]{1,5}$/,
      });
    },
  }],
};

var checkJavaScriptSubset = jsub.bind(null, syntax);

var script = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';

var javaScriptAST = esprima.parse(script);

checkJavaScriptSubset(javaScriptAST);
// []
// returns an empty array since there is no syntax violation

```

`jsub` uses a white list to check every AST node of your application so it
  fallbacks to security, you can now run your script safely without having to
  sandbox it!

```js
var script = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';

var context = {
  vegetables: ['salad', 'potato'],
  fruits: ['cherry'],
  lengthOf: function(arrayName) {
    return context[arrayName].length;
  },
};

runFunction = new Function(
  'var fruits = this.fruits;\n' +
  'var vegetables = this.vegetables;\n' +
  'var lengthOf = this.lengthOf;\n' +
  'return (' + script + ');'
);

console.log(runFunction.call(context));
// -2
```

## API

### jsub(syntax:Object, ast:Object):Array

Check the given `ast` script according to the `syntax` definition, returns an
 array containing the script syntax violations according to the definition.

## Stats
[![NPM](https://nodei.co/npm/jsub.png?downloads=true&stars=true)](https://nodei.co/npm/jsub/)
[![NPM](https://nodei.co/npm-dl/jsub.png)](https://nodei.co/npm/jsub/)
