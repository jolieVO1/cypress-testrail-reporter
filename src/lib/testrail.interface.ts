export interface TestRailOptions {
    domain: string;
    username: string;
    password: string;
    projectId: number;
    suiteId: number;
    createTestRun: string;
    runId: number;
    assignedToId?: number;
}

export enum Status {
    Passed = 1,
    Blocked = 2,
    Untested = 3,
    Retest = 4,
    Failed = 5,
}

export interface TestRailResult {
    case_id: number;
    status_id: Status;
    comment?: String;
    estimate?: string;
}

export enum Emitted_Events {
    /**
     * Emitted when {@link Test} execution ends
     */
    EVENT_TEST_END = 'test end',
    /**
     * Emitted when Suite execution ends
     */
    EVENT_SUITE_END = 'suite end',
    /**
     * Emitted when Root Suite execution ends
     */
    EVENT_RUN_END = 'end',

}