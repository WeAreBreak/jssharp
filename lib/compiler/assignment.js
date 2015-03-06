/**
 * Function Processor for the CellScript to JS Compiler.
 */

/// public interface ///
module.exports = {

    methods: {

        canProcess: function (leaf) {
            if (leaf.type === "assignment" && (leaf.subtype == "=>" || leaf.subtype == "*>" || leaf.subtype == "*=>" || leaf.subtype == "*->" || leaf.subtype == "->")) return false;
        }

    }

};