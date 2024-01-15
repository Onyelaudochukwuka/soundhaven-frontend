export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isNumber(value: any): value is number {
    return typeof value === 'number';
}

export function serializeValue(value: any): string {
    if (isString(value) || isNumber(value)) {
        return value.toString();
    }
    return JSON.stringify(value);
}
