# Security Guide

Common JS v7.1 provides frontend defense-in-depth. It does not replace server-side security.

## Secure defaults

- Only `http:` and `https:` absolute request URLs are allowed by default.
- Cross-origin `credentials: 'include'` requires explicit opt-in.
- Sensitive headers are stripped from cross-origin requests unless explicitly allowed.
- Same-origin POST requests can receive a CSRF token through `csrfTokenProvider`.
- Common secret fields are redacted by `Logger` by default.
- Dynamic UI strings are rendered as text by default.
- DataTable action labels are HTML-escaped and CSS classes are token-filtered.
- Configuration and form serialization reject prototype-pollution keys.
- Query values must be scalar values or arrays; nested objects are rejected.
- JSON POST bodies have a default maximum length.
- File validation helpers support size, MIME type, and extension checks.

## Raw HTML

`Modal.open()` treats string content as text. `trustedHtml: true` is an explicit escape hatch and must only be used with application-controlled HTML. This library intentionally does not ship a home-grown HTML sanitizer.

## Cross-origin requests

A trusted cross-origin API that genuinely requires cookies or sensitive headers must opt in per request or through configuration. Review CORS and credential scope carefully before enabling these options.

## CSRF

The library is framework-agnostic, so it cannot discover a CSRF token automatically. Configure a provider supplied by the host application. The server must also validate the token.

## File uploads

Client checks are advisory. The server must independently enforce file size/type rules, inspect content rather than trusting MIME names/extensions, rename stored files, isolate upload storage, and perform malware scanning when appropriate.

## Server responsibilities

The host application must still implement authentication, authorization, object-level permission checks, server-side validation, output encoding outside this library, CSP, secure cookies, CORS policy, rate limiting, SQL/query safety, secret management, audit controls, and safe file processing.

## Reporting

Treat unexpected credential transmission, executable HTML injection, unsafe URL acceptance, secret logging, or prototype pollution as security bugs.
