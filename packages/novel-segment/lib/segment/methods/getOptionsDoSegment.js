"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionsDoSegment = void 0;
const defaults_1 = require("../defaults");
function getOptionsDoSegment(options, optionsDoSegment) {
    return Object.assign({}, defaults_1.defaultOptionsDoSegment, optionsDoSegment, options);
}
exports.getOptionsDoSegment = getOptionsDoSegment;
//# sourceMappingURL=getOptionsDoSegment.js.map