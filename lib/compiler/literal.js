/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// private methods ///
var utils = {

    objectLiteral: function(leaf, state) {
        state.print("{");
        if(leaf.items.length >= 2) state.line_break();
        else if(leaf.items.length == 1) state.print(" ");

        state.levelDown();
        for(var i = 0; i < leaf.items.length; ++i) {
            var item = leaf.items[i];
            if(item.subtype) {
                state.print(item.subtype);
                state.meaningfulSpace();
                if (item.nameType === "string") {
                    state.print('"' + item.name + '"');
                }
                else {
                    state.print(item.name);
                }
                state.print(" (");
                if(item.subtype === "set") {
                    state.print(item.parameter);
                }
                state.print(") ");
                state.println("{");
                state.levelDown();
                state.processor.level(leaf.items, state);
                state.levelUp();
                state.println("}");
            }
            else {
                if (item.nameType === "string") {
                    state.print('"' + item.name + '"');
                }
                else {
                    state.print(item.name);
                }
                state.print(": ");
                state.processor.leaf(item.expression, state);
            }
            if(i < leaf.items.length - 1) state.println(',');
        }

        if(leaf.items.length >= 2) state.line_break();
        else if(leaf.items.length == 1) state.print(" ");
        state.levelUp();
        state.print("}");
    },

    arrayLiteral: function(leaf, state) {
        var multilineMode = leaf.items.length >= 10;

        state.print("[");
        if(multilineMode) state.line_break();
        else if(leaf.items.length) state.print(" ");

        for(var i = 0; i < leaf.items.length; ++i) {
            var item = leaf.items[i];
            if(item.type !== "elision") {
                if(multilineMode) state.print("    ");
                state.processor.leaf(item, state);
            }
            if(i < leaf.items.length - 1) {
                state.print(',');
                if (multilineMode) state.line_break();
                else state.print(" ");
            }
        }

        if(multilineMode) state.line_break();
        else if(leaf.items.length) state.print(" ");
        state.print("]");
    },

    timeLiteral: function(leaf, state) {
        var val = leaf.value,
            type = val[val.length-1],
            change = 1;

        switch(type) {
            case "s":
                if(val[val.length-2] == "m") {
                    change = 1;
                    val = val.substring(0, val.length-1);
                }
                else change = 1000;
                break;
            case "m":
                change = 60000;
                break;
            case "h":
                change = 3600000;
                break;
            case "d":
                change = 86400000;
                break;
            case "w":
                change = 604800000;
                break;
        }

        val = +val.substring(0, val.length-1);
        state.print(val*change);
    }

};

/// public interface ///
module.exports = {

    forceOverride: true,

    canProcess: function(leaf) {
        return leaf.type === "literal";
    },

    process: function(leaf, state) {
        if(leaf.subtype === "string") {
            state.print('"' + leaf.value + '"');
        }
        else if(leaf.subtype === "object") {
            utils.objectLiteral(leaf, state);
        }
        else if(leaf.subtype === "array") {
            utils.arrayLiteral(leaf, state);
        }
        else if(leaf.subtype === "time") {
            utils.timeLiteral(leaf, state);
        }
        else {
            state.print(leaf.value);
        }
    }

};