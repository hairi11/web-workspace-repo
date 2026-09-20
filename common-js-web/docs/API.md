# Common JS v8 API

## UI wrappers

### Button
Bootstrap-backed button wrapper.

### ButtonBar
Composes primary/secondary actions. When more than two actions are visible and multiple secondary actions exist, secondaries are grouped into a Bootstrap dropup.

### ButtonDropdown
Thin Bootstrap Dropdown wrapper.

### Modal
Thin Bootstrap Modal wrapper.

### Dialog
Promise-based `confirm`, `info`, `success`, `warning`, and `error` facade.

### Toast
Bootstrap Toast facade.

## Forms

### FormAction

Main lifecycle:

```text
serializeForm
validateForm
buildRequestData
beforeSubmit
sendRequest
onSuccess / onError
```

Public methods:

- `build()`
- `destroy()`
- `execute(submitter?)`
- `reset()`
- `isDirty()`
- `serializeForm()`
- `validateForm(values)`
- `showValidationErrors(errors)`
- `clearValidationErrors()`
- `setSubmitting(value)`

Override points:

- `getValidationRules()`
- `buildRequestData(values)`
- `shouldTrackDirty()`
- `beforeSubmit(context)`
- `sendRequest(context)`
- `onBuild(form)`
- `onDestroy(form)`
- `onSuccess(data, context, response)`
- `onError(error, context)`

### Validator

Includes required, email, pattern, length, custom and exact decimal precision/scale validation.

### FormDataConverter

`DECIMAL` values are normalized strings to preserve database precision.

## Inputs

### ChoiceInput
- up to 5 options → Bootstrap radios
- more than 5 → Select2

### CurrencyInput
Exact decimal masking with precision/scale limits.

### DatePicker
Flatpickr wrapper with `dd/mm/yyyy` visible input mask.

## DataTableBuilder

Supported configuration:

- `data(rows)`
- `option(name, value)`
- `serverPage(loader, config)`
- `column(data, title, config?)`
- `renderer(data, title, renderer, config?)`
- `menuAction()`
- `addAction(action)`
- `searchInput(selector)`

Runtime:

- `build()`
- `refresh(resetPaging?)`
- `replaceData(rows, resetPaging?)`
- `search(value)`
- `destroy()`

## HTTP

`Ajax` remains the project HTTP wrapper with GET/POST, interceptors, cancellation, retry, cache, dedupe and security guards.
