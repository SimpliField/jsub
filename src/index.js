var YError = require('yerror');
var debug = require('debug')('jsub');

function jsub(options, ast) {
  return checkExpression([], options.conditions || [], ast);
}

function checkExpression(errors, conditions, expression) {
  var expressionErrors = [];
  debug('Checking expression:', expression);
  // Check alls conditions
  conditions.some(function(condition, index) {
    var conditionErrors = checkCondition(condition, index, expression);
    debug('Condition check of:', condition, ' led to ', conditionErrors.length, ' errors.');
    if(conditionErrors.length) {
      expressionErrors = expressionErrors.concat(conditionErrors);
    } else {
      expressionErrors = conditionErrors;
      return true;
    }
  });
  if(expressionErrors.length) {
    errors.push(new YError('E_BAD_EXPRESSION', expression, expressionErrors.length, expressionErrors));
  }
  // Check child expressions
  if('Program' == expression.type) {
    errors = expression.body.reduce(function(errors, expression) {
      return errors.concat(checkExpression(errors, conditions, expression));
    }, errors);
  } else if('ExpressionStatement' == expression.type) {
    errors = checkExpression(errors, conditions, expression.expression);
  } else if('BinaryExpression' == expression.type) {
    errors = checkExpression(errors, conditions, expression.left);
    errors = checkExpression(errors, conditions, expression.right);
  }
  return errors;
}

function checkCondition(condition, index, expression) {
  var errors = [];
  Object.keys(condition).forEach(function(property) {
    var error = null;
    // Simple value based condition
    if(-1 !== ['boolean', 'string', 'number'].indexOf(typeof condition[property])) {
      if(condition[property] !== expression[property]) {
        error = new YError('E_DIFFERENT_VALUES', condition[property], expression[property]);
      }
    // RegExp based condition
    } else if(condition[property] instanceof RegExp) {
      if(!condition[property].test(expression[property])) {
        error = new YError('E_NO_MATCH', condition[property], expression[property]);
      }
    // Array based condition
    } else if(condition[property] instanceof Array) {
      if(-1 === condition[property].indexOf(expression[property])) {
        error = new YError('E_NO_MATCH', condition[property], expression[property]);
      }
    // Expression check based condition
    } else if('$_' === property) {
      if(!(condition[property] instanceof Function)) {
        throw new YError('E_BAD_EXPRESSION_CHECKER', property, condition[property]);
      }
      if(!condition[property](expression)) {
        error = new YError('E_NO_MATCH', condition[property], expression[property]);
      }
    // Bad condition property
    } else {
      throw new YError('E_BAD_CONDITION_PROPERTY', condition, property, condition[property]);
    }
    if(null !== error) {
      debug('Property check:', property, 'led to', error);
      errors.push(property);
    }
  });

  return errors;
}

module.exports = jsub;
