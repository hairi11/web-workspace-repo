# Common JS v7 API

## FormAction

`FormAction` is a Template Method base class. Create a child class per form/use-case and override only the methods whose default behavior must change.

### Required override

- `getUrl()` — returns the request URL.

### Default template methods

- `getMethod()` — defaults to `POST`.
- `getValidationRules()` — defaults to `{}`.
- `getConfirmation()` — defaults to `null`.
- `getConfirmationHandler()` — defaults to `ConfirmDialog.show`.
- `buildRequestData(formValues)` — defaults to all serialized form values.
- `getRequestOptions()` — defaults to `{}`.
- `getErrorRenderer()` — defaults to `FieldErrorRenderer`.
- `shouldTrackDirty()` — defaults to `false`.
- `shouldResetOnSuccess()` — defaults to `false`.
- `shouldDisableWhileSubmitting()` — defaults to `true`.

### Lifecycle hooks

- `beforeValidate(formValues, form)`
- `afterValidate(validation, formValues, form)`
- `beforeConfirm(formValues, form)`
- `afterConfirm(confirmed, formValues, form)`
- `beforeSubmit(context)` — return `false` to cancel submission.
- `onSuccess(data, context, response)`
- `onError(error, context)`
- `onComplete({context, error, result})`
- `onValidationError(errors, formValues, form)`
- `onDirtyChange(dirty, formState)`
- `onBuild(form)`
- `onDestroy(form)`
- `transformResponse(data, response, context)`
- `mapServerErrors(error, context)`

### Public runtime methods

- `build()`
- `destroy()`
- `execute()`
- `reset()`
- `isDirty()`
- `serializeForm()`
- `validateForm(formValues)`
- `confirmSubmission(formValues)`
- `createContext(formValues)`
- `sendRequest(context)`

### Example

```js
const {FormAction, Validator} = require('../src');

class SearchFormAction extends FormAction {
    getMethod() {
        return 'GET';
    }

    getUrl() {
        return '/api/users';
    }

    getValidationRules() {
        return {
            keyword: Validator.required()
        };
    }

    buildRequestData(form) {
        return {
            keyword: form.keyword,
            status: form.status
        };
    }

    onSuccess(data) {
        console.log(data);
    }
}

new SearchFormAction('#searchForm').build();
```

For GET forms, the value returned by `buildRequestData()` is sent as query parameters. For POST forms, it is sent as the request body.

## Ajax

Supports GET and POST, global defaults, interceptors, timeout, retry, cache, deduplication, cancellation, and normalized responses/errors.

## DataTableBuilder

Supports AJAX data, server-side mode, columns, renderers, menu actions, external search, filters, refresh, search and destroy.
