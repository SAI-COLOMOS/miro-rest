export function __ThrowError(message: string) { throw message }

export function __CheckEnum(arr: Array<string>, value: string, field: string) {
    let is_valid: boolean = false
    for (let str of arr) {
        value === str ? is_valid = true : null
    }
    is_valid ? null : __ThrowError(`El campo '${field}' debe contener uno de los siguientes strings: ${arr}`)
}

export function __Required(value: any, field_name: string, value_type: string, arr: Array<string> | null, is_date?: boolean) {
    const message: string = is_date
        ? `El campo '${field_name}' debe ser tipo '${value_type}' con la fecha en formato ISO`
        : `El campo '${field_name}' debe ser tipo '${value_type}'`

    value
        ? null
        : __ThrowError(`El campo '${field_name}' es obligatorio`)

    typeof value === value_type
        ? null
        : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)

    arr ? __CheckEnum(arr, value, field_name) : null
}

export function __Optional(value: any, field_name: string, value_type: string, arr: Array<string> | null, is_date?: boolean) {
    const message: string = is_date
        ? `El campo '${field_name}' debe ser tipo '${value_type}' con la fecha en formato ISO`
        : `El campo '${field_name}' debe ser tipo '${value_type}'`

    !value
        ? null
        : typeof value === value_type
            ? arr ? __CheckEnum(arr, value, field_name) : null
            : __ThrowError(message)
}

export function __Query(value: any, field_name: string, value_type: string) {
    if (value_type === "number") {
        !value
            ? null
            : !isNaN(Number(value))
                ? null
                : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}' con un valor numérico válido`)
    }

    if (value_type === "boolean") {
        !value
            ? null
            : value === "true" || value === "false"
                ? null
                : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)
    }
}