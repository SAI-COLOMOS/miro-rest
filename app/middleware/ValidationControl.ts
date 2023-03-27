export function __ThrowError (message: string) { throw message }

export function __CheckEnum (arr: Array<string>, value: string, field: string) {
  let is_valid: boolean = false
  for (let str of arr)
    value === str ? is_valid = true : null

  if (!is_valid) __ThrowError(`El campo '${field}' debe contener uno de los siguientes strings: ${arr}`)
}

export function __Required (value: any, field_name: string, value_type: string, arr: Array<string> | null, is_date?: boolean) {
  const message: string = is_date
    ? `El campo '${field_name}' debe ser tipo '${value_type}' con la fecha en formato ISO`
    : `El campo '${field_name}' debe ser tipo '${value_type}'`

  if (value === null || value === undefined) __ThrowError(`El campo '${field_name}' es obligatorio`)

  if (value_type === 'array') {
    if (!Array.isArray(value))
      __ThrowError(message)
  } else {
    if (typeof value !== value_type)
      __ThrowError(message)
  }

  if (arr) __CheckEnum(arr, value, field_name)
}

export function __Optional (value: any, field_name: string, value_type: string, arr: Array<string> | null, is_date?: boolean) {
  const message: string = is_date
    ? `El campo '${field_name}' debe ser tipo '${value_type}' con la fecha en formato ISO`
    : `El campo '${field_name}' debe ser tipo '${value_type}'`

  if (value_type === 'array') {
    if (value && !Array.isArray(value))
      __ThrowError(message)
  } else {
    if (value && typeof value !== value_type)
      __ThrowError(message)
  }

  if (arr && value) __CheckEnum(arr, value, field_name)
}

export function __Query (value: any, field_name: string, value_type: string) {
  if (value_type === "number")
    !value
      ? null
      : !isNaN(Number(value))
        ? null
        : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}' con un valor numérico válido`)

  if (value_type === "boolean")
    !value
      ? null
      : value === "true" || value === "false"
        ? null
        : __ThrowError(`El campo '${field_name}' debe ser tipo '${value_type}'`)
}
