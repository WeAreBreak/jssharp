/**
 * Function Declaration Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    operators: [ "=>", "*>", "*=>", "*->", "->" ]
};

/// methods ///
var overrides = {

    assignment: function (state, functionScope, utils, validators) {
        state.leaf();
        state.item.type = "assignment";

        var _self = state.item;

        if(functionScope) state.levelDown("function");
        state.levelDown((functionScope ? "lambda" : "assignment"));
        if(utils.conditional(state)) {
            if(validators.isOperator(state)) {
                //HACK: TODO: What the hell?
                state.levelUp();
                var leftHandSide = null;
                var level = _self;
                while (level.items.length === 1) {
                    level = level.items[0];
                    if (level.type === "lefthandside") {
                        leftHandSide = level;
                        break;
                    }
                }

                if (leftHandSide) {
                    _self.items = [leftHandSide];
                    state.item = _self;
                }
                else {
                    return false;
                }
                state.levelDown();

                //if(!utils.leftHandSide(state)) return false;
                if (!utils.operator(state, _self)) return false;
                if (!overrides.assignment(state, _self.subtype == "=>" || _self.subtype == "*>" || _self.subtype == "*->" || _self.subtype == "*=>" || _self.subtype == "->", utils, validators)) return false;
            }
        }
        else {
            return false;
        }
        state.levelUp();
        if(functionScope) state.levelUp();

        return true;
    }

};

/// public interface ///
module.exports = {

    constants: constants,

    methods: {
        process: function (state, utils, validators) {
            return overrides.assignment(state, false, utils, validators);
        }
    }

};