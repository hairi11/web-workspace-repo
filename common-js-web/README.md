# Common JS v8

A small CommonJS wrapper library for the web workspace.

The design rule is simple:

```text
xx-module
   ↓
common-js-web wrapper
   ↓
Bootstrap / DataTables / Select2 / Flatpickr
```

Business code depends on project wrappers, while mature libraries own browser/UI mechanics.

## UI foundation

Bootstrap 5 is the default UI foundation.

- `Button` → Bootstrap buttons
- `ButtonDropdown` → Bootstrap Dropdown
- `Modal` / `Dialog` → Bootstrap Modal
- `Toast` → Bootstrap Toast
- `ChoiceInput` radio mode → Bootstrap form-check
- `DatePicker` → Flatpickr with Bootstrap input styling
- `DataTableBuilder` → DataTables Bootstrap 5 integration

## FormAction

`FormAction` keeps only the lifecycle used by this workspace:

```text
serialize
→ validate
→ buildRequestData
→ beforeSubmit
→ sendRequest
→ onSuccess / onError
```

Example:

```js
class UserFormAction extends FormAction {
    getValidationRules() {
        return {
            name: Validator.required('Name is required.')
        };
    }

    buildRequestData(values) {
        return {name: values.name};
    }

    sendRequest(context) {
        return UserService.create(context.data);
    }

    onSuccess() {
        Toast.success('User saved.');
    }
}
```

Returning `false` from `beforeSubmit(context)` stops the request. This is used by session-only or navigation workflows.

## DataTableBuilder

The wrapper intentionally exposes only the DataTable behavior currently used by the workspace:

- `data(rows)`
- `option(name, value)`
- `serverPage(loader, config)`
- `column(...)`
- `renderer(...)`
- `menuAction()`
- `addAction(...)`
- `searchInput(...)`
- `build()`
- `refresh()`
- `replaceData()`
- `search()`
- `destroy()`

Context actions use Bootstrap dropdown presentation.

## Decimal safety

Large exact decimal values must remain strings in browser code. Do not convert database-style decimals such as `DECIMAL(20,4)` through JavaScript `Number`.

Use:

```js
Validator.decimal(20, 4);
FormDataConverter.Types.DECIMAL;
CurrencyInput;
NumberUtil.formatDecimal();
```

## Security boundary

Client-side validation is convenience and defense-in-depth. Authentication, authorization, authoritative validation, CSRF, CORS, database safety and file validation remain server responsibilities.
