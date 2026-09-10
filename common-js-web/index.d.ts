export const version: string;

export class Ajax {
    static configure(config: any): typeof Ajax;
    static use(interceptor: any): () => void;
    static get(url: string, options?: any): Promise<any>;
    static post(url: string, data?: any, options?: any): Promise<any>;
    static request(config: any): Promise<any>;
    static createCancelToken(): {signal: AbortSignal | null; cancel(): void};
    static clearCache(): typeof Ajax;
}

export interface AjaxSecurityOptions {
    allowedProtocols?: string[];
    allowCrossOriginCredentials?: boolean;
    allowSensitiveHeadersCrossOrigin?: boolean;
    sensitiveHeaders?: string[];
    csrfHeader?: string;
    csrfTokenProvider?: ((config: any) => string | null | undefined | Promise<string | null | undefined>) | null;
    maxBodyLength?: number;
}

export interface FormValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export interface FormActionContext {
    method: 'GET' | 'POST' | string;
    url: string;
    form: HTMLFormElement | null;
    formValues: Record<string, any>;
    data: any;
    requestOptions: any;
}

export class FormAction {
    constructor(selector: string);
    build(): this;
    destroy(): this;
    execute(): Promise<any>;
    reset(): this;
    isDirty(): boolean;

    serializeForm(): Record<string, any>;
    validateForm(formValues: Record<string, any>): Promise<FormValidationResult>;
    confirmSubmission(formValues: Record<string, any>): Promise<boolean>;
    createContext(formValues: Record<string, any>): Promise<FormActionContext>;
    sendRequest(context: FormActionContext): Promise<any>;
    showValidationErrors(errors: Record<string, string>): void;
    clearValidationErrors(): void;
    setSubmitting(submitting: boolean): void;

    getMethod(): string;
    getUrl(): string;
    getValidationRules(): any;
    getConfirmation(): any;
    getConfirmationHandler(): Function;
    buildRequestData(formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    getRequestOptions(): any;
    getErrorRenderer(): any;
    shouldTrackDirty(): boolean;
    shouldResetOnSuccess(): boolean;
    shouldDisableWhileSubmitting(): boolean;

    beforeValidate(formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    afterValidate(validation: FormValidationResult, formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    beforeConfirm(formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    afterConfirm(confirmed: boolean, formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    beforeSubmit(context: FormActionContext): any;
    onBuild(form: HTMLFormElement): any;
    onDestroy(form: HTMLFormElement): any;
    onDirtyChange(dirty: boolean, state: any): any;
    onValidationError(errors: Record<string, string>, formValues: Record<string, any>, form?: HTMLFormElement | null): any;
    transformResponse(data: any, response: any, context: FormActionContext): any;
    mapServerErrors(error: any, context: FormActionContext | null): any;
    onSuccess(data: any, context: FormActionContext, response: any): any;
    onError(error: any, context: FormActionContext | null): any;
    onComplete(result: {context: FormActionContext | null; error: any; result: any}): any;
}

export class DataTableBuilder {
    constructor(selector: string);
    ajax(url: string, config?: any): this;
    serverSide(config?: any): this;
    column(data: any, title: string, config?: any): this;
    renderer(data: any, title: string, renderer: Function, config?: any): this;
    menuAction(config?: any): this;
    addAction(action: any): this;
    searchInput(selector: string): this;
    filter(selector: string, columnIndex: number): this;
    build(): any;
    refresh(resetPaging?: boolean): this;
    search(value: string): this;
    destroy(): this;
}

export class DatePicker {
    constructor(selector: string | HTMLElement, options?: any);
    option(name: string, value: any): this;
    optionsConfig(config?: any): this;
    build(): this;
    setDate(value: any, triggerChange?: boolean): this;
    clear(): this;
    open(): this;
    close(): this;
    destroy(): this;
    getInstance(): any;
}

export class Select2 {
    constructor(selector: string | HTMLElement, options?: any);
    option(name: string, value: any): this;
    optionsConfig(config?: any): this;
    build(): this;
    value(): any;
    setValue(value: any, triggerChange?: boolean): this;
    clear(triggerChange?: boolean): this;
    enable(): this;
    disable(): this;
    destroy(): this;
    getInstance(): any;
}

export const Validator: any;
export const Actions: any;
export const Renderers: any;
export const SafeDom: any;
export const SecurityUtil: any;
export const Repository: any;
export const ConfirmDialog: any;
export const Modal: any;
export const Toast: any;
export const EventBus: any;
export const Logger: any;
export const MemoryCache: any;
export const FormState: any;
export const FieldErrorRenderer: any;
export const FileValidator: any;
export const UrlUtil: any;
