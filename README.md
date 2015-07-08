# jsub
> JavaScript subset to build formulas.


[![NPM version](https://badge.fury.io/js/jsub.png)](https://npmjs.org/package/jsub) [![Build status](https://secure.travis-ci.org/SimpliField/jsub.png)](https://travis-ci.org/SimpliField/jsub) [![Dependency Status](https://david-dm.org/SimpliField/jsub.png)](https://david-dm.org/SimpliField/jsub) [![devDependency Status](https://david-dm.org/SimpliField/jsub/dev-status.png)](https://david-dm.org/SimpliField/jsub#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/SimpliField/jsub/badge.png?branch=master)](https://coveralls.io/r/SimpliField/jsub?branch=master) [![Code Climate](https://codeclimate.com/github/SimpliField/jsub.png)](https://codeclimate.com/github/SimpliField/jsub)

## Usage

First, require jsub:

```js
var jsub = require('jsub');

var myScript = '2 * (fruits.length - vegetables.length)';
var myOptions = {
  context: {
    categories: {
      fruits: [],
      vegetables: []
    }
  },
  allow: [{
    type: 'MemberExpression',
    _: function memberExpressionChecker(node, parents) {
      // WIP...
    }
  }, {
    type: 'BinaryExpression',
    operator: { $in: ['+', '-'] }
  }, {
    type: 'LogicalExpression',,
    operator: { $in: ['||', '&&'] }
  }, {
    type: 'LitteralExpression',
    value : {
      $and: [{
        $match: /([0-9]{1,5}|false|true)/
      }, {
        function matchLitteral(value) {
          return 'number' === typeof value ||
            'boolean' === typeof value;
        }
      }]
    }
  }]
};


jsub(myScript, myOptions);
// []
// returns an empty array since there is no syntax violation

```

## API

### jsub(script:String, options:Object):Array

Parse the given `script` according to the `options`, returns an array
 containing syntax violations according to the given conditions.

## Stats
[![NPM](https://nodei.co/npm/jsub.png?downloads=true&stars=true)](https://nodei.co/npm/jsub/)
[![NPM](https://nodei.co/npm-dl/jsub.png)](https://nodei.co/npm/jsub/)

