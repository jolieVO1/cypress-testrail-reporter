"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status[Status["Passed"] = 1] = "Passed";
    Status[Status["Blocked"] = 2] = "Blocked";
    Status[Status["Untested"] = 3] = "Untested";
    Status[Status["Retest"] = 4] = "Retest";
    Status[Status["Failed"] = 5] = "Failed";
})(Status = exports.Status || (exports.Status = {}));
var Emitted_Events;
(function (Emitted_Events) {
    /**
     * Emitted when {@link Test} execution ends
     */
    Emitted_Events["EVENT_TEST_END"] = "test end";
    /**
     * Emitted when Suite execution ends
     */
    Emitted_Events["EVENT_SUITE_END"] = "suite end";
    /**
     * Emitted when Root Suite execution ends
     */
    Emitted_Events["EVENT_RUN_END"] = "end";
})(Emitted_Events = exports.Emitted_Events || (exports.Emitted_Events = {}));
//# sourceMappingURL=testrail.interface.js.map