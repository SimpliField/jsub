# jsub
> JavaScript subset to build formulas.


[![NPM version](https://badge.fury.io/js/jsub.png)](https://npmjs.org/package/jsub) [![Build status](https://secure.travis-ci.org/SimpliField/jsub.png)](https://travis-ci.org/SimpliField/jsub) [![Dependency Status](https://david-dm.org/SimpliField/jsub.png)](https://david-dm.org/SimpliField/jsub) [![devDependency Status](https://david-dm.org/SimpliField/jsub/dev-status.png)](https://david-dm.org/SimpliField/jsub#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/SimpliField/jsub/badge.png?branch=master)](https://coveralls.io/r/SimpliField/jsub?branch=master) [![Code Climate](https://codeclimate.com/github/SimpliField/jsub.png)](https://codeclimate.com/github/SimpliField/jsub)

## Usage

First, require jsub:

```js
var jsub = require('jsub');

var myScript = '2 * (lengthOf('fruits') - lengthOf('vegetables'))';
var myOptions = {
  context: {
    categories: {
      fruits: [],
      vegetables: []
    }
  },
  conditions: [{
    type: 'MemberExpression',
    _: function memberExpressionChecker(node, parents) {
      // WIP...
    }
  }, {
    type: 'BinaryExpression',
    operator: ['*', '-']
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

You can now run my script safely!

```js

var myScript = '2 * (lengthOf("fruits") - lengthOf("vegetables"))';
console.log((new Function(
  'var fruits = this.fruits;\n' +
  'var vegetables = this.vegetables;\n' +
  'var lengthOf = this.lengthOf;\n' +
  'return (' + myScript + ');'
)).call({
  vegetables: [],
  fruites: [],
  lengthOf: function(arr) {
    return arr.length;
  }
}));
// -8
```

## API

### jsub(script:String, options:Object):Array

Parse the given `script` according to the `options`, returns an array
 containing syntax violations according to the given conditions.

## Stats
[![NPM](https://nodei.co/npm/jsub.png?downloads=true&stars=true)](https://nodei.co/npm/jsub/)
[![NPM](https://nodei.co/npm-dl/jsub.png)](https://nodei.co/npm/jsub/)

