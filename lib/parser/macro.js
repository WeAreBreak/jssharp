/**
 * Macro Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    TRUE: "true"
};

/// state ///
var internalState = {
    regionLevel: 0,
    conditionalStack: []
};

/// methods ///
var utils = {

    normalizeString: function(text) {
        return text.substring(1, text.length - 2);
    },

    flag: function(state) {
        var name = state.token.data;
        state.next();

        if(!state.token || state.token.type !== "literal" || state.token.subtype !== "boolean") return state.error("Unexpected token after #" + name + ".");

        var value = (state.token.data === constants.TRUE);
        state.next();

        state.preprocessor.flag(name, value);
    },

    option: function(state, type) {
        var name = state.token.data;
        state.next();

        if(!state.token || state.token.type !== "literal" || state.token.subtype !== type) return state.error("Unexpected token after #" + name + ".");

        var value = state.token.data;
        if(type === "string") value = utils.normalizeString(value);
        state.next();

        state.preprocessor.option(name, value);
    },

    variable: function(state, define) {
        state.next(); //Skip the macro name.

        if(!state.token || state.token.type != "identifier") return state.error("Unexpected token after macro.");

        var name = state.token.data;
        state.next();

        var value = undefined;
        if(define) {
            value = null;
            if (state.token && state.token.type === "literal") {
                if(state.token.subtype === "null") return state.error("Null literal is not supported in macros.");

                value = state.token.data;
                if (state.token.subtype === "string") value = utils.normalizeString(value);
                state.next();
            }
        }

        state.preprocessor.set(name, value);
    },

    skipUntil: function(state, tokens) {
        while(state.token && (state.token.type !== "macro" || tokens.indexOf(state.token.data) == -1)) {
            state.next();
        }
    },

    conditional: function(state, positive, condition) {
        state.next(); //Skip the if macro.

        if(!state.token || state.token.type != "identifier") return state.error("Unexpected token after macro.");

        var name = state.token.data;
        var value1 = state.preprocessor.get(name);
        state.next();

        if(condition === undefined) {
            //TODO: Add support for simple operators and conditions.
            return state.error("This version of the parser only supports ifdef and ifndef conditional macros.");
        }

        var result = false;
        if(positive) result = (value1 === condition);
        else result = (value1 !== condition);
        internalState.conditionalStack.push(result);

        if(!result) {
            utils.skipUntil(state, [ "elif", "elifn", "else", "endif" ]);
        }
    },

    conditionalPart: function(state) {
        if(!internalState.conditionalStack.length) return state.error("Missing conditional macro.");

        var previousResult;
        switch(state.token.data) {
            case "endif":
                internalState.conditionalStack.pop();
                state.next();
                break;
            case "else":
                previousResult = internalState.conditionalStack.pop();
                if(previousResult) {
                    utils.skipUntil(state, [ "endif" ]);
                }
                else {
                    internalState.conditionalStack.push(true);
                    state.next();
                }
                break;
            case "elif":
            case "elifn":
                previousResult = internalState.conditionalStack.pop();
                if(previousResult) {
                    utils.skipUntil(state, [ "endif" ]);
                }
                else {
                    utils.conditional(state, (state.token.data === "elif"));
                }
                break;
        }
    },

    region: function(state, begin) {
        if(begin) {
            internalState.regionLevel++;
        }
        else {
            internalState.regionLevel--;
            if(internalState.regionLevel < 0) return state.error("Missing #region macro.");
        }

        state.next();
    }

};

var macros = {
    "strict": function(state) { utils.flag(state) },
    "typechecks": function(state) { utils.flag(state) },
    "minify": function(state) { utils.flag(state) },
    "cell": function(state) { utils.option(state, "string") },
    "define": function(state) { utils.variable(state, true) },
    "constant": function(state) { utils.variable(state, true) },
    "const": function(state) { utils.variable(state, true) },
    "undef": function(state) { utils.variable(state, false) },
    "if": function(state) { utils.conditional(state, true) },
    "ifn": function(state) { utils.conditional(state, false) },
    "ifdef": function(state) { utils.conditional(state, true, null) },
    "ifndef": function(state) { utils.conditional(state, false, null) },
    "else": function(state) { utils.conditionalPart(state) },
    "elif": function(state) { utils.conditionalPart(state) },
    "elifn": function(state) { utils.conditionalPart(state) },
    "endif": function(state) { utils.conditionalPart(state) },
    "region": function(state) { utils.region(state, true) },
    "endregion": function(state) { utils.region(state, false) }
};

/// public interface ///
module.exports = {

    tokenType: "macro",
    name: "plus/macro.js",

    canProcess: function(state) {
        return state.token.type === "macro";
    },

    process: function(state) {
        var macro = macros[state.token.data];
        if(macro) {
            macro(state);
        }
        else {
            state.error("Unexpected macro: " + state.token.data + ".");
        }
    },

    end: function(state) {
        if(internalState.regionLevel != 0) return state.error("Missing #endregion macro.");
        if(internalState.conditionalStack.length != 0) return state.error("Missing #endif macro.");
    }

};