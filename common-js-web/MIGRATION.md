# Migration to common-js-web v8

v8 keeps the project wrappers but removes generic framework behavior that the workspace does not use.

## Bootstrap UI

The wrappers now use Bootstrap 5 internally.

Legacy custom classes such as:

```text
button-primary
button-secondary
button-dropdown-menu
common-modal-*
common-toast
```

are no longer part of the UI contract.

Use the wrappers as before:

```js
new Button('#saveButton', {
    variant: Button.Variant.PRIMARY
}).build();

await Dialog.confirm({
    title: 'Delete',
    message: 'Delete this record?'
});

Toast.success('Saved.');
```

Static buttons and links should use Bootstrap classes directly.

## FormAction

Removed v7 generic lifecycle APIs:

```text
getMethod
getUrl
getConfirmation
getConfirmationHandler
getRequestOptions
getErrorRenderer
shouldResetOnSuccess
shouldDisableWhileSubmitting
beforeValidate
afterValidate
beforeConfirm
afterConfirm
onDirtyChange
onValidationError
transformResponse
mapServerErrors
onComplete
createContext
confirmSubmission
```

v8 child actions normally override only:

```text
getValidationRules
buildRequestData
shouldTrackDirty
beforeSubmit
sendRequest
onBuild
onDestroy
onSuccess
onError
```

## DataTableBuilder

Removed unused generic APIs:

```text
ajax
optionsConfig
serverSide
filter
selectable
addBulkAction
selectedData
runBulkAction
inline action mode
```

Use `serverPage()` for server-backed tables and `data()` for local tables.

## DatePicker

The custom clear/calendar-button shell was removed. Flatpickr now owns opening/closing directly and the visible field uses Bootstrap `form-control`.

The wrapper methods remain:

```text
build
setDate
clear
open
close
destroy
getInstance
```

## Decimal values

`FormDataConverter.Types.DECIMAL` returns normalized decimal strings, not JavaScript numbers. This prevents precision loss for large database decimals.
