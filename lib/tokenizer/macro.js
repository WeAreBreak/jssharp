/**
 * Preprocessor Macro Processor for the CellScript Tokenizer
 */

var constants = {
    macros: [ "typechecks", "if", "ifn", "elif", "elifn", "else", "endif", "ifdef", "ifndef", "define", "undef", "region", "endregion", "strict", "minify", "const", "constant" ],
    startCharacter: "#",
    partCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
};

var validators = {
    isStart: function (char) { return (constants.startCharacter === char) },
    isPart: function (char) { return (constants.partCharacters.indexOf(char) != -1) },

    isMacro: function (token) { return (constants.macros.indexOf(token) != -1); }
};

module.exports = {
    name: "macro",
    priority: true,

    canProcess: function(state) {
        return validators.isStart(state.char) && validators.isPart(state.lookahead);
    },

    process: function (state) {
        state.next(); //Skip the start character.

        while(state.char && validators.isPart(state.char)) {
            state.add();
            state.next();
        }

        if(validators.isMacro(state.tokenValue)) {
            state.token("macro");
        }
        else {
            state.error("Unsupported preprocessor macro: " + state.tokenValue + ".");
        }
    }
};
