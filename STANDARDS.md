# Coding Standards

To ensure consistency and maintainability throughout the project, please adhere to the following coding standards.

## 1. General Principles
* **Consistency is Key:** If you see existing code following a pattern, stick to it.
* **Readable Code:** Code should be self-explanatory. Use comments only to explain *why* complex logic exists, not *what* it does.
* **English Only:** All variable names, comments, and documentation must be in English.

## 2. File Naming
* Use **kebab-case** for all file and folder names (e.g., `my-component.js`, `main-styles.css`, `user-profile/`).
* Avoid spaces and capital letters in filenames.

## 3. HTML
* Use **Semantic HTML5** elements (e.g., `<header>`, `<main>`, `<article>`, `<footer>`) instead of generic `<div>` tags where possible.
* Always include `alt` attributes for images.
* Indentation: 2 spaces.

## 4. CSS / SCSS
* Use meaningful class names that describe the content or function, not the appearance (e.g., use `.alert-error` instead of `.red-text`).
* Avoid using ID selectors (`#header`) for styling; use classes instead.
* Follow a **Mobile-First** approach for responsive design.

## 5. JavaScript
* **Variables:** Use `const` by default, `let` if reassignment is needed. Avoid `var`.
* **Naming:** Use **camelCase** for variables and functions (e.g., `getUserData`, `isActive`).
* **Functions:** Use arrow functions `() => {}` where appropriate.
* **Equality:** Always use strict equality `===` instead of `==`.

## 6. Git & Commits
We follow the **Conventional Commits** style for clear history:
* `feat: ...` for a new feature.
* `fix: ...` for a bug fix.
* `docs: ...` for documentation changes.
* `style: ...` for formatting changes (missing semi-colons, etc).
* `refactor: ...` for code changes that neither fix a bug nor add a feature.

**Example:**
`feat: add responsive navigation bar`