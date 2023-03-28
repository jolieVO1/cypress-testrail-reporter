import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds, titleToDefectId } from './shared';
import { Status, TestRailResult, Emitted_Events } from './testrail.interface';
const deasync = require('deasync');
const chalk = require('chalk');

export class CypressTestRailReporter extends reporters.Spec {
    private results: TestRailResult[] = [];
    private testRail: TestRail;

    constructor(runner: any, options: any) {
        super(runner);

        let reporterOptions = options.reporterOptions;
        this.testRail = new TestRail(reporterOptions);
        this.validate(reporterOptions, 'domain');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        this.validate(reporterOptions, 'createTestRun');
        let event = reporterOptions.event || Emitted_Events.EVENT_RUN_END;
        if (!Object.values(Emitted_Events).includes(event)) {
            throw new Error('Value of emitted event is not correct in cypress.json');
        }

        runner.on('start', () => {
            const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
            const description = '';

            if (reporterOptions.createTestRun == "true") {
                this.testRail.createRun(name, description);
            }

            if (event == Emitted_Events.EVENT_SUITE_END || event == Emitted_Events.EVENT_RUN_END) {
                // Only in event 'suite end' or 'end', we will verify the test case IDs
                this.testRail.getCaseIds();
            }
        });

        runner.on('pass', test => {
            const caseIds = titleToCaseIds(test.title);

            if (event == Emitted_Events.EVENT_SUITE_END || event == Emitted_Events.EVENT_RUN_END) {
                this.waitForGetCases(20000);
            }

            var passedIds = []
            caseIds.forEach(id => {
                if (this.testRail.caseIDs.length == 0 || this.testRail.caseIDs.includes(id)) {
                    passedIds.push(id);
                }
            })

            if (passedIds.length > 0) {
                const results = passedIds.map(caseId => {
                    if (this.testRail.caseIDs.includes(caseId)) {
                        return {
                            case_id: caseId,
                            status_id: Status.Passed,
                            comment: `Execution time: ${test.duration}ms`,
                            estimate: test.duration
                        };
                    }
                });
                this.results.push(...results);
            }
        });

        runner.on('fail', test => {
            const caseIds = titleToCaseIds(test.title);
            const defectID = titleToDefectId(test.title);
            const customComment = process.env.CUSTOM_COMMENT;

            if (event == Emitted_Events.EVENT_SUITE_END || event == Emitted_Events.EVENT_RUN_END) {
                this.waitForGetCases(20000);
            }

            var failedIds = []
            caseIds.forEach(id => {
                if (this.testRail.caseIDs.length == 0 || this.testRail.caseIDs.includes(id)) {
                    failedIds.push(id);
                }
            })

            if (failedIds.length > 0) {
                const results = failedIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: Status.Failed,
                        comment: customComment ? `${customComment}\n\n# Cypress result: #\n ${test.err.message}` : `# Cypress result: #\n${test.err.message}`,
                        estimate: test.duration,
                        defects: defectID
                    };
                });
                this.results.push(...results);
            }
        });

        runner.on(event, () => {
            if (this.results.length == 0) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.warn(
                    '\n',
                    'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
                    '\n'
                );

                return;
            }

            this.testRail.publishResults(this.results);
            this.results = []
        });
    }

    private validate(options, name: string) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
        }
    }

    private waitForGetCases(delay) {
        if (this.testRail.caseIDs.length == 0 && delay > 0) {
            deasync.sleep(1000);
            this.waitForGetCases(delay - 1000);
        }
    }
}
