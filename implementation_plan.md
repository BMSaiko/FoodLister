# Implementation Plan

[Overview]
Fix two failing test suites in the FoodLister project: `__tests__/pages/settings.test.tsx` and `__tests__/components/MenuManager.test.tsx`, which cause the overall test suite to fail with 2 failed tests out of 84 total. The plan addresses mock misconfigurations, invalid DOM attributes in test mocks, and test case logic errors to resolve the failures and ensure all tests pass.

[Types]
No changes to the type system are required. All issues are related to test mocks, component rendering, and test case implementation, not type definitions or interfaces.

[Files]
Modify existing test files and component mocks to resolve failures:
- `__tests__/pages/settings.test.tsx`: Fix `next/navigation` mock to use a Jest mock function for `useRouter`, update the failing "calls handleCancel when cancel button is clicked" test case.
- `__tests__/components/MenuManager.test.tsx`: Fix `next/image` mock to omit the invalid `fill` prop, update the "prevents duplicate links" test case to properly detect error messages.
- `components/ui/RestaurantManagement/MenuManager.tsx`: No changes required, as the `fill` prop is handled internally by the Next.js Image component and only causes issues in the test mock environment.

[Functions]
Modify mock functions and test cases to resolve failures:
- In `__tests__/pages/settings.test.tsx`:
  - Update the `next/navigation` mock to set `useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }))` so `useRouter` is a Jest mock function with callable `mockReturnValue`.
  - Update the "calls handleCancel when cancel button is clicked" test: properly call `mockReturnValue` on the `useRouter` mock to return a mock `back` function, then verify the function is called when the cancel button is clicked.
- In `__tests__/components/MenuManager.test.tsx`:
  - Update the `next/image` mock to filter out the `fill` prop when rendering the `img` element, as `fill` is not a valid HTML attribute and causes console warnings.
  - Update the "prevents duplicate links" test: ensure the error message is properly rendered by waiting for React state updates, and verify the error text is present in the document.

[Classes]
No class modifications are required. All components and tests use functional components and hooks.

[Dependencies]
No new dependencies are required. The project already uses Jest 30.0.2, React Testing Library, and Next.js test utilities via `next/jest`.

[Testing]
- After fixes, run `npm test` to verify all 84 tests pass (82 previously passed, 2 fixed).
- Ensure no new console warnings are present (specifically the `Received 'true' for a non-boolean attribute 'fill'` warning).
- Confirm the settings test properly mocks the router and verifies the cancel button behavior.
- Confirm the MenuManager test properly detects duplicate link errors.

[Implementation Order]
1. Fix the `next/navigation` mock in `__tests__/pages/settings.test.tsx` to use a Jest mock function for `useRouter`.
2. Update the failing test case in `settings.test.tsx` to properly mock the router and verify cancel button behavior.
3. Fix the `next/image` mock in `__tests__/components/MenuManager.test.tsx` to omit the `fill` prop and resolve the console warning.
4. Fix the "prevents duplicate links" test in `MenuManager.test.tsx` to properly wait for and detect the error message.
5. Run the full test suite to confirm all tests pass and no regressions are introduced.