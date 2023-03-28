# TestRail Reporter for Cypress

[![version](https://img.shields.io/npm/v/hanoi-cypress-testrail-reporter.svg)](https://www.npmjs.com/package/hanoi-cypress-testrail-reporter)
[![downloads](https://img.shields.io/npm/dt/hanoi-cypress-testrail-reporter.svg)](https://www.npmjs.com/package/hanoi-cypress-testrail-reporter)
[![MIT License](https://img.shields.io/github/license/vietnq254/hanoi-cypress-testrail-reporter.svg)](https://github.com/vietnq254/hanoi-cypress-testrail-reporter/blob/master/LICENSE.md)

Publishes [Cypress](https://www.cypress.io/) runs on TestRail.

## Install

```shell
$ npm install hanoi-cypress-testrail-reporter --save-dev
```

## Usage

Add reporter to your `cypress.json`:

```json
...
"reporter": "hanoi-cypress-testrail-reporter",
"reporterOptions": {
  "domain": "yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": idNumber,
  "createTestRun": "boolean",
  "suiteId": suiteNumber,
  "runId": testRunNumber,
  "event": "suite end"
}
```

Your Cypress tests should include the ID of your TestRail test case. Make sure your test case IDs are distinct from your test titles:

```Javascript
// Good:
it("C123 C124 Can authenticate a valid user", ...
it("Can authenticate a valid user C321", ...

// Bad:
it("C123Can authenticate a valid user", ...
it("Can authenticate a valid userC123", ...
```

**How to add defect ID for specific test:**

```Javascript
// title contains pattern 'cypress-defect=<defect_id>':
it("C123 C124 Can authenticate a valid user cypress-defect=NCT-1234", ...
```

**Add custom comment via the environment variable:**
```Javascript
export CUSTOM_COMMENT="http://gitlab.company.com/group/project/-/jobs/188786/raw"
```
then in the result comment of failed test cases:
```Javascript
http://gitlab.company.com/group/project/-/jobs/188786/raw

Cypress result:

    <error_message>
```

## Reporter Options

**domain**: _string_ domain name of your TestRail instance (e.g. for a hosted instance _instance.testrail.com_).

**username**: _string_ email of the user under which the test run will be created.

**password**: _string_ password or the API key for the aforementioned user.

**projectId**: _number_ project with which the tests are associated.

**createTestRun**: _boolean_ **true** if you want to create a new Test Run / **false** if you only update results to existed Test Run

**suiteId**: _number_ (optional: required when TestRail project uses multiple test suites to manage cases) suite with which the tests are associated.

**runId**: _number_ (optional: required when **createTestRun** = **false**) Test Run id.

**event**: _string_ (optional: default value is **'end'**) emitted event to report result. There are 3 options: 'test end', 'suite end', 'end'.

## TestRail Settings

To increase security, the TestRail team suggests using an API key instead of a password. You can see how to generate an API key [here](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key).

If you maintain your own TestRail instance on your own server, it is recommended to [enable HTTPS for your TestRail installation](http://docs.gurock.com/testrail-admin/admin-securing#using_https).

For TestRail hosted accounts maintained by [Gurock](http://www.gurock.com/), all accounts will automatically use HTTPS.

You can read the whole TestRail documentation [here](http://docs.gurock.com/).

## Author

NGUYEN Viet - [github](https://github.com/vietnq254)

## License

This project is licensed under the [MIT license](/LICENSE.md).

## Acknowledgments

* [Milutin Savovic](https://github.com/mickosav), author of the [cypress-testrail-reporter](https://github.com/Vivify-Ideas/cypress-testrail-reporter) repository that was cloned.
* [Pierre Awaragi](https://github.com/awaragi), owner of the [mocha-testrail-reporter](https://github.com/awaragi/mocha-testrail-reporter) repository that was forked.
* [Valerie Thoma](https://github.com/ValerieThoma) and [Aileen Santos](https://github.com/asantos3026) for proofreading the README.md file and making it more understandable.
