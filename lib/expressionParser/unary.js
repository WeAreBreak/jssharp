/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    prefixPunctuations: [ "*>", "=>", "->", "*->", "*=>" ]
};

/// methods ///
var utils = {

    unaryLambda: function(state, unary) {
        var result = this.inject("lambda", this, state, unary);
        if(result.hasResult) return result.value;

        state.levelDown("function");
        state.levelDown("lambda");
            if(!unary(state)) return false;
        state.levelUp();
        state.levelUp();

        return true;
    }

};

/// public interface ///
module.exports = {

    constants: constants,

    methods: {
        '*>': utils.unaryLambda,
        '=>': utils.unaryLambda
    }

};