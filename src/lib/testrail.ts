const axios = require('axios');
const chalk = require('chalk');
const deasync = require('deasync');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
    public caseIDs: Number[];
    private base: String;
    private runId: Number;
    private res;

    constructor(private options: TestRailOptions) {
        this.base = `https://${options.domain}/index.php?/api/v2`;
        this.res = undefined;
        this.caseIDs = [];
    }

    public createRun(name: string, description: string) {
        axios({
            method: 'post',
            url: `${this.base}/add_run/${this.options.projectId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: this.options.suiteId,
                name,
                description,
                include_all: true,
            }),
        })
            .then(response => {
                console.log('Creating test run... ---> run id is:  ', response.data.id);
                this.runId = response.data.id;
            })
            .catch(error => console.error(error));
        this.waitUntilNotNull("runId", 20000);
    }

    public deleteRun() {
        axios({
            method: 'post',
            url: `${this.base}/delete_run/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(error => console.error(error));
    }

    public waitUntilNotNull(property, delay) {
        let value = Reflect.get(this, property);
        if ((typeof value === "undefined" || (value instanceof Array && value.length !== 0)) && delay > 0) {
            deasync.sleep(1000);
            this.waitUntilNotNull(property, delay - 1000);
        }
    }

    public publishResults(results: TestRailResult[]) {

        if (this.options.createTestRun == "false") {
            this.runId = this.options.runId;
        }

        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.")
            return
        }

        axios({
            method: 'post',
            url: `${this.base}/add_results_for_cases/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results }),
        })
            .then(response => {
                this.res = response;
            })
            .catch(error => console.error(error));

        this.waitUntilNotNull("res", 20000);
        if (this.res !== undefined && this.res.status == 200) {
            console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            console.log('\n', " - Results are published to " + chalk.magenta("https://" + this.options.domain + "/index.php?/runs/view/" + this.runId), '\n');
        }
    }

    public getCaseIds() {
        if (this.options.createTestRun == "false") {
            this.runId = this.options.runId;
        }

        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.")
            return
        }

        this.sendGets(0, 250);
    }

    private sendGets(offset, limit) {
        axios({
            method: 'get',
            url: `${this.base}/get_tests/${this.runId}&limit=${limit}&offset=${offset}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).then(response => {
            if (response.status === 429) { // Too Many Requests
                const retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000;
                deasync.sleep(retryAfter);
                this.sendGets(offset, limit);
            }
            if (response.data.size !== 0) {
                response.data.tests.forEach(item => {
                    this.caseIDs.push(item.case_id);
                });
                this.sendGets(offset + limit, limit);
            }
        })
        .catch(error => console.error(error));
    }
}
