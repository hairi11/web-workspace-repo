const WRAPPED = Symbol('traceWrapped');

export function traceFunction(fn, label) {
    if (typeof fn !== 'function' || fn[WRAPPED]) {
        return fn;
    }

    function tracedFunction(...args) {
        console.groupCollapsed('[TRACE] ' + label);
        console.log('args:', args);
        console.trace('caller');
        console.groupEnd();

        return fn.apply(this, args);
    }

    Object.defineProperty(tracedFunction, WRAPPED, {
        value: true
    });

    return tracedFunction;
}

export function traceObject(target, label) {
    if (!target) return target;

    Object.getOwnPropertyNames(target).forEach((name) => {
        const descriptor = Object.getOwnPropertyDescriptor(target, name);

        if (!descriptor || typeof descriptor.value !== 'function') {
            return;
        }

        target[name] = traceFunction(
            descriptor.value,
            label + '.' + name
        );
    });

    return target;
}

export function traceClass(ClassRef, includeParents) {
    if (!ClassRef || !ClassRef.prototype) return ClassRef;

    let prototype = ClassRef.prototype;

    while (prototype && prototype !== Object.prototype) {
        const className = prototype.constructor && prototype.constructor.name
            ? prototype.constructor.name
            : ClassRef.name;

        Object.getOwnPropertyNames(prototype).forEach((name) => {
            if (name === 'constructor') return;

            const descriptor = Object.getOwnPropertyDescriptor(prototype, name);

            if (!descriptor || typeof descriptor.value !== 'function') {
                return;
            }

            prototype[name] = traceFunction(
                descriptor.value,
                className + '.' + name
            );
        });

        if (!includeParents) break;
        prototype = Object.getPrototypeOf(prototype);
    }

    return ClassRef;
}

export function traceStatic(ClassRef, label) {
    if (!ClassRef) return ClassRef;

    Object.getOwnPropertyNames(ClassRef).forEach((name) => {
        if (name === 'length' || name === 'name' || name === 'prototype') {
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(ClassRef, name);

        if (!descriptor || typeof descriptor.value !== 'function') {
            return;
        }

        ClassRef[name] = traceFunction(
            descriptor.value,
            (label || ClassRef.name) + '.' + name
        );
    });

    return ClassRef;
}
