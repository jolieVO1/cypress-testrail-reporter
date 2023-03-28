"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function titleToCaseIds(title) {
    var caseIds = [];
    var testCaseIdRegExp = /\bT?C(\d+)\b/g;
    var m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
        var caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}
exports.titleToCaseIds = titleToCaseIds;
/**
 * Search for defect
 * @param title: contains pattern 'cypress-defect=<Defect_id>', i.e 'cypress-defect=NCT-1234'
 * @returns {any}
 */
function titleToDefectId(title) {
    var testCaseIdRegExp = /(cypress-defect=)(\w+-\d+)/gm;
    var m = testCaseIdRegExp.exec(title);
    if (m !== null && m.length > 2) {
        return m[2];
    }
    return undefined;
}
exports.titleToDefectId = titleToDefectId;
//# sourceMappingURL=shared.js.map