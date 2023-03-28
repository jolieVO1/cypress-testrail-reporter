"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var deasync = require('deasync');
var chalk = require('chalk');
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        var reporterOptions = options.reporterOptions;
        _this.testRail = new testrail_1.TestRail(reporterOptions);
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'createTestRun');
        var event = reporterOptions.event || testrail_interface_1.Emitted_Events.EVENT_RUN_END;
        if (!Object.values(testrail_interface_1.Emitted_Events).includes(event)) {
            throw new Error('Value of emitted event is not correct in cypress.json');
        }
        runner.on('start', function () {
            var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            var name = (reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
            var description = '';
            if (reporterOptions.createTestRun == "true") {
                _this.testRail.createRun(name, description);
            }
            if (event == testrail_interface_1.Emitted_Events.EVENT_SUITE_END || event == testrail_interface_1.Emitted_Events.EVENT_RUN_END) {
                // Only in event 'suite end' or 'end', we will verify the test case IDs
                _this.testRail.getCaseIds();
            }
        });
        runner.on('pass', function (test) {
            var _a;
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (event == testrail_interface_1.Emitted_Events.EVENT_SUITE_END || event == testrail_interface_1.Emitted_Events.EVENT_RUN_END) {
                _this.waitForGetCases(20000);
            }
            var passedIds = [];
            caseIds.forEach(function (id) {
                if (_this.testRail.caseIDs.length == 0 || _this.testRail.caseIDs.includes(id)) {
                    passedIds.push(id);
                }
            });
            if (passedIds.length > 0) {
                var results = passedIds.map(function (caseId) {
                    if (_this.testRail.caseIDs.includes(caseId)) {
                        return {
                            case_id: caseId,
                            status_id: testrail_interface_1.Status.Passed,
                            comment: "Execution time: " + test.duration + "ms",
                        };
                    }
                });
                (_a = _this.results).push.apply(_a, results);
            }
        });
        runner.on('fail', function (test) {
            var _a;
            var caseIds = shared_1.titleToCaseIds(test.title);
            var defectID = shared_1.titleToDefectId(test.title);
            var customComment = process.env.CUSTOM_COMMENT;
            if (event == testrail_interface_1.Emitted_Events.EVENT_SUITE_END || event == testrail_interface_1.Emitted_Events.EVENT_RUN_END) {
                _this.waitForGetCases(20000);
            }
            var failedIds = [];
            caseIds.forEach(function (id) {
                if (_this.testRail.caseIDs.length == 0 || _this.testRail.caseIDs.includes(id)) {
                    failedIds.push(id);
                }
            });
            if (failedIds.length > 0) {
                var results = failedIds.map(function (caseId) {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: customComment ? customComment + "\n\n# Cypress result: #\n " + test.err.message : "# Cypress result: #\n" + test.err.message,
                        defects: defectID
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
        });
        runner.on(event, function () {
            if (_this.results.length == 0) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
                return;
            }
            _this.testRail.publishResults(_this.results);
            _this.results = [];
        });
        return _this;
    }
    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };
    CypressTestRailReporter.prototype.waitForGetCases = function (delay) {
        if (this.testRail.caseIDs.length == 0 && delay > 0) {
            deasync.sleep(1000);
            this.waitForGetCases(delay - 1000);
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map