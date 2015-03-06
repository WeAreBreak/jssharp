/**
 * Function Processor for the JavaScript+ to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    methods: {

        'body': function (leaf, state) {
            var param;
            for (var i = 0; i < leaf.parameters.length; ++i) {
                param = leaf.parameters[i];

                if(param.rest) {
                    state.print(param.name);
                    state.print(' = ');
                    state.print('Array.prototype.slice.call(arguments, ');
                    state.print(i);
                    state.println(");");

                    if (param.defaultValueExpression) {
                        state.print("if(!" + param.name);
                        state.print(".length) ");
                        state.print(param.name);
                        state.print(" = ");
                        state.processor.leaf(param.defaultValueExpression, state);
                        state.println(";");
                    }
                }
                else if (param.defaultValueExpression) {
                    state.print("if(" + param.name);
                    state.print(" === ");
                    state.print("undefined) ");
                    state.print(param.name);
                    state.print(" = ");
                    state.processor.leaf(param.defaultValueExpression, state);
                    state.println(";");
                }
            }

            if (state.preprocessor.flag("typechecks")) {
                for (var j = 0; j < leaf.parameters.length; ++j) {
                    param = leaf.parameters[j];
                    if (param.type !== undefined) {
                        state.println("if(typeof " + param.name + " !== '" + param.type + "') throw 'Invalid value specified for argument " + param.name + ".';");
                    }
                }
            }
        }

    }

};