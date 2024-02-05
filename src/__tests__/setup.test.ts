import { vi } from "vitest";
import { mockAllIsIntersecting } from "../test-utils";

vi.hoisted(() => {
  // Clear the `beforeEach` from global, so we can detect if this is a test env
  // @ts-ignore
  global.vi = undefined;
});

beforeAll(() => {});

test("should warn if not running in test env", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockAllIsIntersecting(true);
  expect(console.error).toHaveBeenCalledWith(`React Intersection Observer was not configured to handle mocking.
Outside Jest and Vitest, you might need to manually configure it by calling setupIntersectionMocking() and resetIntersectionMocking() in your test setup file.

// test-setup.js
import { resetIntersectionMocking, setupIntersectionMocking } from 'react-intersection-observer/test-utils';

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
});

afterEach(() => {
  resetIntersectionMocking();
});`);
});
