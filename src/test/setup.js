"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var vitest_1 = require("vitest");
var react_1 = require("@testing-library/react");
var matchers = require("@testing-library/jest-dom/matchers");
// Extends Vitest's expect method with methods from react-testing-library
vitest_1.expect.extend(matchers);
// Run cleanup after each test case (e.g. clearing jsdom)
(0, vitest_1.afterEach)(function () {
    (0, react_1.cleanup)();
});
