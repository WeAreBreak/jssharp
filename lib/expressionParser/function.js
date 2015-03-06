/**
 * Function Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

validators = validators.extend({

    isEllipse: function(state) {
        return state.token && state.token.type == "...";
    }

});

/// methods ///
overrides = {

    parameters: function(state) {
        if(!validators.isSegmentStart(state)) return state.error("Missing function parameters.");
        state.next(); //Skip segment start.

        var parameter, wasRest = false;
        state.item.parameters = [];
        while(state.token && (validators.isIdentifier(state) || validators.isEllipse(state)) && !wasRest) {
            parameter = { type: "parameter" };
            if(state.token.type == "...") {
                parameter.rest = true;
                state.next();
                if(!validators.isIdentifier(state)) return state.error("Missing rest parameter name.");
                wasRest = true;
            }

            parameter.name = state.token.data;
            state.item.parameters.push(parameter);
            state.next();

            if(validators.isParameterSeparator(state)) {
                state.next();
            }
            else if (validators.isSegmentEnd(state)) break;
            else {
                if (validators.isEqualSign(state)) {
                    state.next(); //Skip equal sign.

                    parameter.defaultValueExpression = {};
                    state.prepareLeaf(parameter.defaultValueExpression);
                    if(!state.expressionProcessor.token(state, ["conditional", "lefthandside"])) return state.error("Unexpected token ILLEGAL.");
                    parameter.type = state.item.subtype;
                    state.clearLeaf();
                }
                else if (validators.isTypeSpecifierSign(state)) {
                    state.next(); //Skip type specifier sign.
                    if (validators.isIdentifier(state)) {
                        parameter.type = state.token.data;
                    }
                    else return state.error("Unexpected token ILLEGAL.");

                    state.next(); //Skip processed default value or type.
                }
                else {
                    return state.error("Unexpected token ILLEGAL.");
                }

                if (validators.isParameterSeparator(state)) {
                    state.next();
                }
                else if (validators.isSegmentEnd(state)) break;
                else return state.error("Unexpected token ILLEGAL.");
            }
        }

        if(!validators.isSegmentEnd(state)) return state.error("Unexpected token ILLEGAL.");
        state.next(); //Skip segment end.

        return true;
    }

};

var utils;

/// public interface ///
module.exports = {

    methods: {
        process: function(state, _utils) {
            if(!utils) {
                _utils.parameters = overrides.parameters;
                utils = _utils;
            }
        }
    }

};