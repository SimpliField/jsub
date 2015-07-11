# jsub
> JavaScript subset to build formulas.

[![NPM version](https://badge.fury.io/js/jsub.svg)](https://npmjs.org/package/jsub) [![Build status](https://secure.travis-ci.org/SimpliField/jsub.svg)](https://travis-ci.org/SimpliField/jsub) [![Dependency Status](https://david-dm.org/SimpliField/jsub.svg)](https://david-dm.org/SimpliField/jsub) [![devDependency Status](https://david-dm.org/SimpliField/jsub/dev-status.svg)](https://david-dm.org/SimpliField/jsub#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/SimpliField/jsub/badge.svg?branch=master)](https://coveralls.io/r/SimpliField/jsub?branch=master) [![Code Climate](https://codeclimate.com/github/SimpliField/jsub.svg)](https://codeclimate.com/github/SimpliField/jsub)

## Usage

Simply require `jsub` and test your scripts against your own JavaScript sub
 syntax definition:

```js
var jsub = require('jsub');

var myScript = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';
var myOptions = {
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

jsub(myScript, myOptions);
// []
// returns an empty array since there is no syntax violation

```

You can now run your script safely without having to sandbow it!

```js
var myScript = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';

var myContext = {
  vegetables: ['salad', 'potato'],
  fruits: ['cherry'],
  lengthOf: function(arrayName) {
    return myContext[arrayName].length;
  }
};

myFunction = new Function(
  'var fruits = this.fruits;\n' +
  'var vegetables = this.vegetables;\n' +
  'var lengthOf = this.lengthOf;\n' +
  'return (' + myScript + ');'
);

console.log(myFunction.call(myContext));
// -2
```

## API

### jsub(script:String, options:Object):Array

Parse the given `script` according to the `options`, returns an array
 containing syntax violations according to the given conditions.

## Stats
[![NPM](https://nodei.co/npm/jsub.png?downloads=true&stars=true)](https://nodei.co/npm/jsub/)
[![NPM](https://nodei.co/npm-dl/jsub.png)](https://nodei.co/npm/jsub/)
