export function __ThrowError(message: string) { throw message }

export function __CheckEnum(arr: Array<string>, value: string, field: string) {
    let is_valid: boolean = false
    for (let str in arr) {
        value === str ? is_valid = true : null
    }
    is_valid ? null : __ThrowError(`El campo '${field} debe contener uno de los siguientes strings ${arr}'`)
}