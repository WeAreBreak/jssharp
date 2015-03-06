/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return (leaf.type == "unary" || leaf.type === "assignment") && (leaf.subtype == "=>" || leaf.subtype == "*>");
    },

    process: function(leaf, state) {
        if(leaf.subtype == '->' || leaf.subtype == '*->' || leaf.subtype == '*>') state.print('(');
        state.print("function");
        if(leaf.subtype[0] == "*") state.print("* ");

        if(leaf.items.length == 1) {
            state.print("()");
        }
        else {
            var expression = leaf.items[0];
            if (expression.items[0] && expression.items[0].type == "group") {
                state.processor.leaf(expression, state);
            }
            else {
                state.print("(");
                state.processor.leaf(expression, state);
                state.print(")");
            }
        }

        state.print(" ");

        var statement = leaf.items[1] || leaf.items[0]; //For unary

        var isBlock = false;
        var temp = statement.items;
        while(temp && temp.length) {
            if(temp[0].type == "block") {
                isBlock = true;
                break;
            }
            temp = temp[0].items;
        }

        if(isBlock) {
            state.processor.leaf(statement, state);
        }
        else {
            state.print("{ ");
            state.print("return");
            state.meaningfulSpace();
            state.processor.leaf(statement, state);
            state.print(" }");
        }
        if(leaf.subtype == '->' || leaf.subtype == '*->' || leaf.subtype == '*>') state.print(').bind(this)');
    }

};