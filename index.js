/**
 * Compiler Module Definition for the InqScript Language.
 */

module.exports = function compilerModuleDefinition() {
    this.language = "JS#";

    this.tokens = {
        'punctuation': require('./lib/tokenizer/punctuation'),
        'identifier': require('./lib/tokenizer/identifier'),
        'macro': require('./lib/tokenizer/macro'),
        'number': require('./lib/tokenizer/number'),
        'separator': require('./lib/tokenizer/separator')
    };

    this.parsers = {
        'foreach': require('./lib/parser/foreach'),
        'macro': require('./lib/parser/macro'),
        'function.js': require('./lib/parser/function')
    };

    this.expressionParsers = {
        'assignment': require('./lib/expressionParser/assignment'),
        'assignmentNoIn': require('./lib/expressionParser/assignmentNoIn'),
        'function': require('./lib/expressionParser/function'),
        'unary': require('./lib/expressionParser/unary')
    };

    this.compilers = {
        'foreach': require('./lib/compiler/foreach'),
        'assignment': require('./lib/compiler/assignment'),
        'lambda': require('./lib/compiler/lambda'),
        'function': require('./lib/compiler/function'),
        'unary': require('./lib/compiler/unary'),
        'literal': require('./lib/compiler/literal')
    };
};