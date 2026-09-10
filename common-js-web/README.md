# Common JS v7

A framework-agnostic CommonJS library for reusable browser application code.
It intentionally contains no Liferay, React, Vue, Angular or app-specific business logic.

## Status

v1 Foundation ✅  
v2 Reusable UI/Data ✅  
v3 Generic Advanced Core ✅  
v4 Advanced Forms ✅  
v5 Advanced DataTable ✅  
v6 Production Hardening ✅  
v7 Developer Experience ✅

## Main modules

```js
const {
    Ajax,
    FormAction,
    Validator,
    DataTableBuilder,
    Actions,
    Renderers,
    Repository,
    EventBus,
    Logger
} = require('common-js-v7');
```

## Ajax

```js
Ajax.configure({
    headers: {Accept: 'application/json'},
    timeout: 10000,
    retry: 2,
    dedupe: true
});

const cancelToken = Ajax.createCancelToken();

Ajax.get('/api/users', {
    cache: true,
    cacheTtl: 30000,
    signal: cancelToken.signal
});

// cancelToken.cancel();
```

Interceptors:

```js
const unsubscribe = Ajax.use({
    beforeRequest: function (config) {
        config.headers['X-Request-Source'] = 'web';
        return config;
    },
    afterResponse: function (response) {
        return response;
    },
    onError: function (error) {
        return error;
    }
});
```

## FormAction

`FormAction` now uses the Template Method Pattern. Extend the base class and override only the behavior your form needs.

```js
const {FormAction, Toast, Validator} = require('./src');

class UserFormAction extends FormAction {
    getUrl() {
        return '/api/users';
    }

    getValidationRules() {
        return {
            name: Validator.required(),
            email: [Validator.required(), Validator.email()]
        };
    }

    getConfirmation() {
        return 'Save this user?';
    }

    buildRequestData(form) {
        return {
            name: form.name,
            email: form.email
        };
    }

    onSuccess() {
        Toast.success('User saved.');
    }
}

new UserFormAction('#userForm').build();
```

Default behavior is inherited automatically. For example, POST is the default method, validation is optional, confirmation is optional, request data defaults to all serialized fields, dirty tracking is off, reset-on-success is off, and submit buttons are disabled while a request is running.

Override `getMethod()` for GET forms, `shouldTrackDirty()` for dirty-state tracking, `shouldResetOnSuccess()` to reset after success, `mapServerErrors()` for server validation errors, and hooks such as `beforeSubmit()`, `onSuccess()`, `onError()`, and `onComplete()` only when needed.

## DataTableBuilder

Requires jQuery DataTables at runtime.

```js
const tableBuilder = new DataTableBuilder('#usersTable')
    .ajax('/api/users')
    .column('id', 'ID')
    .column('name', 'Name')
    .renderer('active', 'Active', Renderers.boolean('Active', 'Inactive'))
    .searchInput('#tableSearch')
    .filter('#statusFilter', 2)
    .menuAction()
        .addAction(Actions.view(viewUser))
        .addAction(Actions.edit(editUser))
        .addAction(Actions.divider())
        .addAction(Actions.delete(deleteUser));

const table = tableBuilder.build();
```

Server-side mode:

```js
new DataTableBuilder('#table')
    .ajax('/api/search')
    .serverSide()
    .column('name', 'Name')
    .build();
```

## Recommended boundary

Keep this library generic. Keep business modules in the consuming application:

```text
common-js-v7/
  Ajax
  FormAction
  Validator
  DataTableBuilder

user-app/
  UserRequestData
  UserValidation
  UserRepository
```

See `docs/API.md`, `docs/ROADMAP.md`, `MIGRATION.md`, and `examples/`.

## Security hardening (v7.1)

The library now uses secure frontend defaults: URL protocol allow-listing, cross-origin credential guards, sensitive-header stripping, optional CSRF injection for same-origin POST requests, secret redaction in logs, prototype-pollution guards, safe DOM rendering, escaped DataTable action labels, strict query serialization, and file validation helpers.

Configure CSRF without tying the library to any framework:

```js
const {Ajax} = require('./src');

Ajax.configure({
    csrfTokenProvider: function () {
        return window.appCsrfToken;
    }
});
```

Sending credentials or Authorization to another origin must be explicit:

```js
Ajax.get('https://trusted-api.example/users', {
    credentials: 'include',
    allowCrossOriginCredentials: true,
    allowSensitiveHeadersCrossOrigin: true,
    headers: {
        Authorization: 'Bearer ...'
    }
});
```

`Modal` treats strings as text by default. Prefer DOM nodes. Only use `trustedHtml: true` for HTML that is fully controlled by your application; the library does not attempt to sanitize arbitrary HTML.

```js
Modal.open({
    title: 'Message',
    content: '<strong>shown as text</strong>'
});
```

File checks are available through `FileValidator.maxSize()`, `FileValidator.allowedTypes()`, and `FileValidator.allowedExtensions()`. These client-side checks do **not** replace server-side file validation.

Security boundaries remain important: authentication, authorization, permission checks, CSP, secure cookies, CORS, rate limiting, database/query safety, malware scanning, and authoritative validation must be implemented by the host application/server.
