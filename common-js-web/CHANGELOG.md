# Changelog

## 7.0.0
- Completed v4 advanced forms.
- Completed v5 advanced DataTable helpers.
- Completed v6 request hardening and infrastructure helpers.
- Completed v7 developer experience, docs, tests and type declarations.
- Removed all platform-specific assumptions from the project scope.

- FormAction redesigned to Template Method Pattern; fluent/chaining form API removed.

## 7.1.0 - Security hardening

- Safe DOM rendering is now the default for Modal, Toast, field errors, and DataTable action labels.
- Raw HTML in `Modal.open()` requires explicit `trustedHtml: true` opt-in.
- Added `SecurityUtil`, `SafeDom`, and `FileValidator`.
- Added URL protocol validation and strict query serialization.
- Added prototype-pollution guards in configuration and form serialization.
- Cross-origin credentials are blocked by default unless explicitly enabled.
- Sensitive headers are removed from cross-origin requests by default.
- Added optional same-origin POST CSRF token provider.
- Logger redacts common secrets/tokens/passwords by default.
- Server/network error messages are normalized before surfacing.
- Added default JSON request body length limit.
- Added dedicated security regression tests.
