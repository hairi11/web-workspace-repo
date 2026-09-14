const test = require('node:test');
const assert = require('node:assert/strict');
const CaseInterceptor = require('../src/ajax/CaseInterceptor');

test('CaseInterceptor converts request data to snake_case', function () {
    const config = {
        data: {
            masterId: 10,
            transactions: [
                {
                    fxDate: '2026-09-14',
                    fxCategoryDescription: 'Spot'
                }
            ]
        }
    };

    const result = CaseInterceptor.beforeRequest(config);

    assert.deepEqual(result.data, {
        master_id: 10,
        transactions: [
            {
                fx_date: '2026-09-14',
                fx_category_description: 'Spot'
            }
        ]
    });
});

test('CaseInterceptor converts response data to camelCase', function () {
    const response = {
        data: {
            total_elements: 1,
            content: [
                {
                    record_no: 1,
                    fx_date: '2026-09-14'
                }
            ]
        }
    };

    const result = CaseInterceptor.afterResponse(response);

    assert.deepEqual(result.data, {
        totalElements: 1,
        content: [
            {
                recordNo: 1,
                fxDate: '2026-09-14'
            }
        ]
    });
});

test('CaseInterceptor converts error data to camelCase', function () {
    const error = new Error('Request failed.');
    error.data = {
        field_errors: {
            fx_date: 'FX Date is required.'
        }
    };

    const result = CaseInterceptor.onError(error);

    assert.deepEqual(result.data, {
        fieldErrors: {
            fxDate: 'FX Date is required.'
        }
    });
});
