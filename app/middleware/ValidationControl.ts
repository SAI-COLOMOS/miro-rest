export function __ThrowError(message: string) { throw message }

export function __CheckEnum(arr: Array<string>, value: string) {
    let is_valid: boolean = false
    for (let str in arr) {
        value === str ? is_valid = true : null
    }
    return is_valid
}