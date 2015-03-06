/**
 * Foreach Statement Processor for the CellScript Parser
 */

var parserUtils = require("../../../library/parser/utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants;

/// methods ///
var utils = {

    foreach_: function(state) {
        state.next(); //Skip foreach keyword.
    },

    segmentStart: function(state) {
        if(!validators.isSegmentStart(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment start.
    },

    var_: function(state) {
        //if(!validators.isLet(state)) return state.error(constants.unexpectedToken);
        //state.next(); //Skip let keyword.

        if(validators.isVar(state)) {
            state.item.scope = "local";
            state.next(); //Skip var keyword.
        }
        else if(validators.isLet(state)) {
            state.item.scope = "block";
            state.next(); //Skip var keyword.
        }
        else {
            state.item.scope = "global";
        }
    },

    name: function(state) {
        if(!validators.isIdentifier(state)) return state.error(constants.unexpectedToken);
        state.item.name = state.token.data;
        state.next();
    },

    in_: function(state) {
        if(!validators.isIn(state)) return state.error(constants.unexpectedToken);
        state.next(); // Skip semicolon.
    },

    expression: function(state) {
        state.item.expression = {};
        state.prepareLeaf(state.item.expression);
        if(!state.expressionProcessor.token(state, ["expression"])) return state.error(constants.unexpectedToken);
        state.clearLeaf();
    },

    segmentEnd: function(state) {
        if(!validators.isSegmentEnd(state)) return state.error(constants.unexpectedToken);
        state.next(); //Skip segment end.
    },

    statement: function(state) {
        state.item.statement = {};
        state.levelDown("iteration");
        state.prepareLeaf(state.item.statement);
        state.processor.token(state);
        state.clearLeaf();
        state.levelUp();
    }

};

/// public interface ///
module.exports = {

    name: "plus/foreach.js",
    tokenType: "keyword/"+constants.foreachKeyword,

    canProcess: function(state) {
        return validators.isForeach(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = "iteration";
        state.item.subtype = "foreach";

        utils.foreach_(state);
        utils.segmentStart(state);
        utils.var_(state);
        utils.name(state);
        utils.in_(state);
        utils.expression(state);
        utils.segmentEnd(state);
        utils.statement(state);
    }

};