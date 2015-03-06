/**
 * Function Processor for the CellScript to JS Compiler.
 */

var utils = {
    scope: function(leaf, state) {
        if(leaf.scope == "block") {
            state.print("let");
            state.meaningfulSpace();
        }
        else if(leaf.scope == "local") {
            state.print("var");
            state.meaningfulSpace();
        }
        else {
            //Nothing to do for global scope.
        }
    }
};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "iteration" && leaf.subtype === "foreach";
    },

    process: function(leaf, state) {
        /*
        for(<scope> <name> in <expression>) {
            if(<expression>.hasOwnProperty(<name>)) {
                <name> = <expression>[<name>];
                <statement>
            }
         }
         */

        //TODO: In the case of local and global variables the post-loop variable value might be incorrect.

        state.print("for ");
        state.print("(");
        utils.scope(leaf, state);
        state.print(leaf.name);
        state.meaningfulSpace();
        state.print("in");
        state.meaningfulSpace();
        state.processor.leaf(leaf.expression, state);
        state.print(") ");
        state.println("{");
        state.levelDown();
            state.print("if(");
            state.processor.leaf(leaf.expression, state);
            state.print(".hasOwnProperty(");
            state.print(leaf.name);
            state.print(")) ");
            state.println("{");
            state.levelDown();
                state.print(leaf.name);
                state.print(" = ");
                state.processor.leaf(leaf.expression, state);
                state.println("[" + leaf.name + "];");
                if (leaf.statement.type == "block") state.processor.level(leaf.statement.items, state);
                else state.processor.leaf(leaf.statement, state);
            state.levelUp();
            state.println("}");
        state.levelUp();
        state.println("}");
    }

};