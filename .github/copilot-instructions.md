# Copilot Instructions

This project is a Node.js library .

## Project Structure

- `src` - Contains all source code
- `tests` - Comprehensive test suite using Mocha

Test files that correspond to source files are named similary, e.g, `tests/webpage-meta-extractor.test.js` for `src/webpage-meta-extractor.js`.

## Code Style and Patterns

### JSDoc Comments

All functions, methods, and classes must have JSDoc comments that include:

- Description of the function
- `@param` for each parameter with type and description
- `@returns` for return values with type and description (`void` if no return)
- `@throws` for exceptions with type and description

These are also used by TypeScript for type checking.

### Error Handling

- Use specific error messages: "Expected an array argument.", "Expected at least one entry."
- Throw `TypeError` for type validation, `Error` for business logic
- Always validate inputs at method entry points

## Dependencies and Tools

- Node.js with ES modules
- Mocha for testing
- ESLint for linting
- Prettier for formatting
- JSDoc for type annotations
- TypeScript for type checking

## Testing

- Whenever changes are made to code, inspect the tests for necessary changes.
- All new functionality need comprehensive tests
- Test both success and error paths
- Error messages using regular expressions
- Test async behavior and concurrent operations
- Mock external dependencies appropriately
- Run `npx mocha <filename>` to execute tests for specific files; always do this until all tests pass for this file.
- Run `npm test` to run all tests
- Do not change the working directory when running tests
- Never use the `assert()` function, always use specific assertion methods like `assert.strictEqual()`, `assert.throws()`, etc.

## When Making Changes

Whenever you make a change to the code, you must:

- Update or add tests as necessary.
- Run all tests to verify that your changes do not break existing functionality.
- Structure and format files according to instructions.
- Document user-facing changes in the README.md file.

Do these automatically without asking for confirmation.
