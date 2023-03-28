"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');
var chalk = require('chalk');
var deasync = require('deasync');
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.base = "https://" + options.domain + "/index.php?/api/v2";
        this.res = undefined;
        this.caseIDs = [];
    }
    TestRail.prototype.createRun = function (name, description) {
        var _this = this;
        axios({
            method: 'post',
            url: this.base + "/add_run/" + this.options.projectId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: this.options.suiteId,
                name: name,
                description: description,
                include_all: true,
            }),
        })
            .then(function (response) {
            console.log('Creating test run... ---> run id is:  ', response.data.id);
            _this.runId = response.data.id;
        })
            .catch(function (error) { return console.error(error); });
        this.waitUntilNotNull("runId", 20000);
    };
    TestRail.prototype.deleteRun = function () {
        axios({
            method: 'post',
            url: this.base + "/delete_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.waitUntilNotNull = function (property, delay) {
        var value = Reflect.get(this, property);
        if ((typeof value === "undefined" || (value instanceof Array && value.length !== 0)) && delay > 0) {
            deasync.sleep(1000);
            this.waitUntilNotNull(property, delay - 1000);
        }
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        if (this.options.createTestRun == "false") {
            this.runId = this.options.runId;
        }
        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.");
            return;
        }
        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        })
            .then(function (response) {
            _this.res = response;
        })
            .catch(function (error) { return console.error(error); });
        this.waitUntilNotNull("res", 20000);
        if (this.res !== undefined && this.res.status == 200) {
            console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            console.log('\n', " - Results are published to " + chalk.magenta("https://" + this.options.domain + "/index.php?/runs/view/" + this.runId), '\n');
        }
    };
    TestRail.prototype.getCaseIds = function () {
        if (this.options.createTestRun == "false") {
            this.runId = this.options.runId;
        }
        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.");
            return;
        }
        this.sendGets(0, 250);
    };
    TestRail.prototype.sendGets = function (offset, limit) {
        var _this = this;
        axios({
            method: 'get',
            url: this.base + "/get_tests/" + this.runId + "&limit=" + limit + "&offset=" + offset,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).then(function (response) {
            if (response.status === 429) { // Too Many Requests
                var retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000;
                deasync.sleep(retryAfter);
                _this.sendGets(offset, limit);
            }
            if (response.data.size !== 0) {
                response.data.tests.forEach(function (item) {
                    _this.caseIDs.push(item.case_id);
                });
                _this.sendGets(offset + limit, limit);
            }
        })
            .catch(function (error) { return console.error(error); });
    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map