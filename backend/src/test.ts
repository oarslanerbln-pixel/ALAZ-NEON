import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";

test("Prisma schema and basic node test", () => {
    assert.ok(true, "Node test runner works.");
    assert.ok(PrismaClient, "PrismaClient was generated and imported.");
});
