import { vi } from "vitest";
import { mockAllIsIntersecting, setupIntersectionMocking } from "../test-utils";

vi.hoisted(() => {
  // Clear the `vi` from global, so we can detect if this is a test env
  // @ts-ignore
  window.vi = undefined;
});

afterEach(() => {
  vi.resetAllMocks();
});

test("should warn if not running in test env", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mockAllIsIntersecting(true);
  expect(
    console.error,
  ).toHaveBeenCalledWith(`React Intersection Observer was not configured to handle mocking.
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

test('should not warn if running in test env with global "vi"', () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  setupIntersectionMocking(vi.fn);
  mockAllIsIntersecting(true);
  expect(console.error).not.toHaveBeenCalled();
});
