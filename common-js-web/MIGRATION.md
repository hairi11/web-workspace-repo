# Migration to v7 Template FormAction

The main v7 form API uses the Template Method Pattern instead of fluent chaining.

Old style:

```js
new FormAction('#userForm')
    .validate(rules)
    .post('/api/users')
    .data(buildData)
    .onSuccess(handleSuccess)
    .build();
```

New style:

```js
class UserFormAction extends FormAction {
    getUrl() {
        return '/api/users';
    }

    getValidationRules() {
        return rules;
    }

    buildRequestData(formValues) {
        return buildData(formValues);
    }

    onSuccess(data) {
        handleSuccess(data);
    }
}

new UserFormAction('#userForm').build();
```

Mapping from the old builder API:

- `.post(url)` -> default `getMethod()` + override `getUrl()`
- `.get(url)` -> override `getMethod()` to `GET` + `getUrl()`
- `.validate(rules)` -> `getValidationRules()`
- `.confirm(config)` -> `getConfirmation()`
- `.useConfirmation(handler)` -> `getConfirmationHandler()`
- `.data(resolver)` / `.query(resolver)` -> `buildRequestData()`
- `.requestOptions(config)` -> `getRequestOptions()`
- `.dirtyTracking()` -> `shouldTrackDirty()`
- `.resetOnSuccess()` -> `shouldResetOnSuccess()`
- `.disableWhileSubmitting(false)` -> `shouldDisableWhileSubmitting()`
- `.mapServerErrors(mapper)` -> `mapServerErrors()`
- `.transformResponse(handler)` -> `transformResponse()`
- `.onDirtyChange(handler)` -> `onDirtyChange()`
- `.onValidationError(handler)` -> `onValidationError()`
- `.beforeSubmit(handler)` -> `beforeSubmit()`
- `.onSuccess(handler)` -> `onSuccess()`
- `.onError(handler)` -> `onError()`
- `.onComplete(handler)` -> `onComplete()`

Methods that are not overridden automatically use the base-class defaults.

## v7.0 -> v7.1 security notes

`Modal.open({content: '<b>Hello</b>'})` now displays the string as text. If the HTML is fully trusted and intentionally authored by your application, opt in explicitly with `trustedHtml: true`. Prefer passing a DOM `Node` instead.

Cross-origin requests no longer send sensitive headers by default and `credentials: 'include'` is rejected unless `allowCrossOriginCredentials: true` is explicitly configured. This may require an explicit opt-in for trusted third-party APIs.

For same-origin POST CSRF protection, configure a token provider:

```js
Ajax.configure({
    csrfTokenProvider: function () {
        return window.appCsrfToken;
    }
});
```

Client-side validation and file checks are convenience and defense-in-depth only. Repeat all authorization, validation, CSRF, file, and permission checks on the server.
