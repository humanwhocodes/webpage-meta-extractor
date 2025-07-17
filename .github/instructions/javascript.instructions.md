---
applyTo: "**/*.js,**/*.ts"
---

# JavaScript/TypeScript Coding Style Guide

## Source File Structure

The overall file structure should follow this format:

```javascript
/**
 * @fileoverview Brief description of the file.
 * @author Your Name
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

// Import statements should be grouped logically, e.g., third-party libraries, local modules, etc.
// Omit this section if there are no imports.

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

// Type declarations should be grouped logically, e.g., interfaces, type aliases, etc.
// Omit this section if there are no type declarations.

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

// Data declarations should be grouped logically, e.g., constants, configuration, etc.
// Omit this section if there are no data declarations.

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

// Helper functions should be grouped logically, e.g., internal-only utility functions
// Omit this section if there are no helper functions.

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

// Export statements should be grouped logically, e.g., classes, functions, constants, etc.
```

## Test File Structure

Test files should follow a similar structure to source files, but with a focus on testing functionality:

```javascript
/**
 * @fileoverview Brief description of the file.
 * @author Your Name
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

// Import statements should be grouped logically, e.g., third-party libraries, local modules, etc.
// Omit this section if there are no imports.

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

// Type declarations should be grouped logically, e.g., interfaces, type aliases, etc.
// Omit this section if there are no type declarations.

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

// Data declarations should be grouped logically, e.g., constants, configuration, etc.
// Omit this section if there are no data declarations.

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

// Helper functions should be grouped logically, e.g., internal-only utility functions
// Omit this section if there are no helper functions.

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

// The actual tests should be grouped logically, e.g., describe blocks, it blocks, etc.
```

## Indentation

Use tabs for indentation.

## Strings

Use double quotes for strings. Example:

```typescript
// Incorrect
const message = "Hello, world!";

// Correct
const message = "Hello, world!";
```

## Conditional Statements

For conditional statements, always use indented blocks. Example:

```typescript
// Incorrect
if (condition) return;

// Correct
if (condition) {
	// do something
} else {
	// do something else
}
```

Always include one blank line before and after a conditional statement. Example:

```typescript
// Incorrect
doSomething();
if (condition) {
	// do something
}
callFunction();

// Correct
doSomething();

if (condition) {
	// do something
}

callFunction();
```

### Class properties

When a class has own properties, they should be declared as class fields at the top of the class. Example:

```typescript
// Incorrect
class MyClass {
	/**
	 * Creates a new instance.
	 * @param {number} value The value to set.
	 */
	constructor(value) {
		/**
		 * The value of the class.
		 * @type {number}
		 */
		this.value = value;
	}
}

// Correct
class MyClass {
	/**
	 * The value of the class.
	 * @type {number}
	 */
	value;

	/**
	 * Creates a new instance.
	 * @param {number} value The value to set.
	 */
	constructor(value) {
		this.value = value;
	}
}
```

### Class constructors

When a class has a constructor, it should be the first method in the class. Example:

```typescript
// Incorrect
class MyClass {
	/**
	 * The value of the class.
	 * @type {number}
	 */
	value;

	/**
	 * Gets the value of the class.
	 * @returns {number} The value of the class.
	 */
	getValue() {
		return this.value;
	}

	/**
	 * Creates a new instance.
	 * @param {number} value The value to set.
	 */
	constructor(value) {
		this.value = value;
	}
}

// correct
class MyClass {
	/**
	 * The value of the class.
	 * @type {number}
	 */
	value;

	/**
	 * Creates a new instance.
	 * @param {number} value The value to set.
	 */
	constructor(value) {
		this.value = value;
	}

	/**
	 * Gets the value of the class.
	 * @returns {number} The value of the class.
	 */
	getValue() {
		return this.value;
	}
}
```

Empty constructors should not be used. If a class does not need a constructor, it should not have one.

## Organization

### Repeated values

If a value is used multiple times, assign it to a variable. Example:

```javascript
// Incorrect
if (url.startsWith("twitter:")) {
	console.log("twitter:");
}

// Correct
const prefix = "twitter:";
if (url.startsWith(prefix)) {
	console.log(prefix);
}
```
