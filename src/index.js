'use strict';

var YError = require('yerror');
var debug = require('debug')('jsub');

function jsub(options, ast) {
  return checkExpression([], options.conditions || [], ast);
}

function checkExpression(errors, conditions, expression) {
  var expressionErrors = [];

  debug('Checking expression:', expression);
  // Check alls conditions
  conditions.some(function checkConditions(condition, index) {
    var conditionErrors = checkCondition(condition, index, expression);

    debug(
      'Condition check of:',
      condition,
      ' led to ',
      conditionErrors.length,
      ' errors.'
    );
    if (conditionErrors.length) {
      expressionErrors = expressionErrors.concat(conditionErrors);
      return false;
    }
    expressionErrors = conditionErrors;
    return true;
  });
  if (expressionErrors.length) {
    errors.push(
      new YError(
        'E_BAD_EXPRESSION',
        expression,
        expressionErrors.length,
        expressionErrors
      )
    );
  }
  // By-pass child expressions checking when having a custom parser
  // Warning: Using this feature may cause security issues!
  if (
    conditions.some(function(condition) {
      return condition.type === expression.type && condition.$_;
    })
  ) {
    debug('Child expression cancelled with a custom parser:', expression);
    return errors;
  }
  // Check child expressions
  if ('Program' === expression.type) {
    errors = expression.body.reduce(function processProgram(
      errors,
      expression
    ) {
      return errors.concat(checkExpression(errors, conditions, expression));
    },
    errors);
  } else if ('ExpressionStatement' === expression.type) {
    errors = checkExpression(errors, conditions, expression.expression);
  } else if ('BinaryExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.left);
    errors = checkExpression(errors, conditions, expression.right);
  } else if ('LogicalExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.left);
    errors = checkExpression(errors, conditions, expression.right);
  } else if ('UnaryExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.argument);
  } else if ('ConditionalExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.test);
    errors = checkExpression(errors, conditions, expression.consequent);
    errors = checkExpression(errors, conditions, expression.alternate);
  } else if ('NewExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.callee);
    errors = expression.arguments.reduce(function(errors, expression) {
      return errors.concat(checkExpression(errors, conditions, expression));
    }, errors);
  } else if ('MemberExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.object);
    errors = checkExpression(errors, conditions, expression.property);
  } else if ('CallExpression' === expression.type) {
    errors = checkExpression(errors, conditions, expression.callee);
    errors = expression.arguments.reduce(function(errors, expression) {
      return errors.concat(checkExpression(errors, conditions, expression));
    }, errors);
  } else if (-1 === ['Identifier', 'Literal'].indexOf(expression.type)) {
    errors = [new YError('E_UNHANDLED_EXPRESSION', expression.type)];
  }
  return errors;
}

function checkCondition(condition, index, expression) {
  var errors = [];

  if (!condition.type) {
    throw new Error('E_NO_CONDITION_TYPE');
  }

  // Always check type first
  errors = checkConditionKey(condition, expression, errors, 'type');

  // If type doesn't match, do not parse the all condition keys
  if (errors.length) {
    return errors;
  }

  // Add other checks
  errors = Object.keys(condition)
    .filter(function(key) {
      return 'type' !== key;
    })
    .reduce(checkConditionKey.bind(null, condition, expression), errors);

  return errors;
}

function checkConditionKey(condition, expression, errors, property) {
  // Simple value based condition
  if (
    -1 !== ['boolean', 'string', 'number'].indexOf(typeof condition[property])
  ) {
    if (condition[property] !== expression[property]) {
      errors.push(
        new YError(
          'E_DIFFERENT_VALUES',
          condition[property],
          expression[property]
        )
      );
    }
    // RegExp based condition
  } else if (condition[property] instanceof RegExp) {
    if (!condition[property].test(expression[property])) {
      errors.push(
        new YError('E_NO_MATCH', condition[property], expression[property])
      );
    }
    // Array based condition
  } else if (condition[property] instanceof Array) {
    if (-1 === condition[property].indexOf(expression[property])) {
      errors.push(
        new YError('E_NO_MATCH', condition[property], expression[property])
      );
    }
    // Expression check based condition
  } else if ('$_' === property) {
    if (!(condition[property] instanceof Function)) {
      throw new YError(
        'E_BAD_EXPRESSION_CHECKER',
        property,
        condition[property]
      );
    }
    errors = errors.concat(condition[property](expression));
    // Bad condition property
  } else {
    throw new YError(
      'E_BAD_CONDITION_PROPERTY',
      condition,
      property,
      condition[property]
    );
  }
  if (errors.length) {
    debug('Property check:', property, 'led to', errors);
  }
  return errors;
}

module.exports = jsub;
