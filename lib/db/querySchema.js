"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betweenEndingEnum = exports.listOptionSchema = exports.pageOptionSchema = void 0;
class queryOptionSchema {
    lookups;
    project;
    sort;
    unwinds;
    attributes;
    include;
    order;
}
class pageOptionSchema extends queryOptionSchema {
    page;
}
exports.pageOptionSchema = pageOptionSchema;
class listOptionSchema extends queryOptionSchema {
}
exports.listOptionSchema = listOptionSchema;
var betweenEndingEnum;
(function (betweenEndingEnum) {
    betweenEndingEnum["BEGIN"] = "begin";
    betweenEndingEnum["END"] = "end";
})(betweenEndingEnum = exports.betweenEndingEnum || (exports.betweenEndingEnum = {}));
//# sourceMappingURL=querySchema.js.map