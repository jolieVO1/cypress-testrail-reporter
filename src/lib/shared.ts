/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
export function titleToCaseIds(title: string): number[] {
    let caseIds: number[] = [];

    let testCaseIdRegExp: RegExp = /\bT?C(\d+)\b/g;
    let m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
        let caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}

/**
 * Search for defect
 * @param title: contains pattern 'cypress-defect=<Defect_id>', i.e 'cypress-defect=NCT-1234'
 * @returns {any}
 */
export function titleToDefectId(title: string): string {
    let testCaseIdRegExp: RegExp = /(cypress-defect=)(\w+-\d+)/gm;
    let m = testCaseIdRegExp.exec(title);
    if (m !== null && m.length > 2) {
        return m[2];
    }
    return undefined;
}
