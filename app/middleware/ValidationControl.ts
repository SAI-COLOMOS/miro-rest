export function __ThrowError(message: string) { throw message }

export function __CheckEnum(arr: Array<string>, value: string, field: string) {
    let is_valid: boolean = false
    for (let str of arr) {
        value === str ? is_valid = true : null
    }
    is_valid ? null : __ThrowError(`El campo '${field}' debe contener uno de los siguientes strings ${arr}'`)
}

export function __Required(value: any, field_name: string, value_type: string) {
    value
        ? null
        : __ThrowError(`El campo '${field_name}' es obligatorio`)

    typeof value === value_type
        ? null
        : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)
}

export function __RequiredEnum(value: any, field_name: string, value_type: string, arr: Array<string>) {
    value
        ? null
        : __ThrowError(`El campo '${field_name}' es obligatorio`)

    typeof value === value_type
        ? null
        : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)

    __CheckEnum(arr, value, field_name)
}

export function __Optional(value: any, field_name: string, value_type: string) {
    !value
        ? null
        : typeof value === value_type
            ? null
            : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)
}

export function __OptionalEnum(value: any, field_name: string, value_type: string, arr: Array<string>) {
    !value
        ? null
        : typeof value === value_type
            ? __CheckEnum(arr, value, field_name)
            : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)
}