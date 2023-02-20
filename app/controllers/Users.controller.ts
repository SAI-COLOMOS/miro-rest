import { Request, Response } from "express"
import User from "../models/User"
import { __CheckEnum, __ThrowError } from "../middleware/ValidationControl"

export const UsersGet = async (req: Request, res: Response) => {
    try {
        req.body.items ?
            typeof req.body.items === "number" ? null : __ThrowError("El campo 'items' debe ser tipo 'number'")
            : null

        req.body.page ?
            typeof req.body.page === "number" ? null : __ThrowError("El campo 'page' debe ser tipo 'number'")
            : null

        req.body.search ?
            typeof req.body.search === 'string' ? null
                : __ThrowError(`El campo 'search' debe ser tipo 'string'`)
            : null

        req.body.filter ?
            typeof req.body.filter === 'object' ? null
                : __ThrowError(`El campo 'filter' debe ser tipo 'object'`)
            : null
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0
        let filter: object = req.body.filter ? req.body.filter : null
        req.body.search ? filter = {
            ...req.body.filter,
            $or: [
                { "first_name": { $regex: '.*' + req.body.search + '.*' } },
                { "first_last_name": { $regex: '.*' + req.body.search + '.*' } },
                { "second_last_name": { $regex: '.*' + req.body.search + '.*' } },
                { "register": { $regex: '.*' + req.body.search + '.*' } },
                { "phone": { $regex: '.*' + req.body.search + '.*' } }
            ]
        } : null
        await User.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items).then(
            (result) => {
                if (result.length > 0) {
                    return res.status(200).json({
                        message: "Listo",
                        users: result
                    })
                } else {
                    res.status(200).json({
                        message: `Sin resultados`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }

}

export const UserGet = async (req: Request, res: Response) => {
    try {
        await User.findOne({ 'register': req.params.id }).then(
            (result) => {
                if (result) {
                    return res.status(200).json({
                        message: "Listo",
                        user: result
                    })
                } else {
                    res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserPost = async (req: Request, res: Response) => {
    try {
        req.body.first_name ?
            typeof req.body.first_name === 'string' ? null
                : __ThrowError(`El campo 'first_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'first_name' es obligatorio`)

        req.body.first_last_name ?
            typeof req.body.first_last_name === 'string' ? null
                : __ThrowError(`El campo 'first_last_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'first_last_name' es obligatorio`)

        req.body.second_last_name ?
            typeof req.body.second_last_name === 'string' ? null
                : __ThrowError(`El campo 'second_last_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'second_last_name' es obligatorio`)

        req.body.age ?
            typeof req.body.age === 'string' ? null
                : __ThrowError(`El campo 'age' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'age' es obligatorio`)

        req.body.email ?
            typeof req.body.email === 'string' ? null
                : __ThrowError(`El campo 'email' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'email' es obligatorio`)

        req.body.phone ?
            typeof req.body.phone === 'string' ?
                req.body.phone.length === 10 ? null
                    : __ThrowError(`El campo 'phone' debe tener una longitud de 10 dígitos`)
                : __ThrowError(`El campo 'phone' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'phone' es obligatorio`)

        req.body.emergency_contact ?
            typeof req.body.emergency_contact === 'string' ? null
                : __ThrowError(`El campo 'emergency_contact' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'emergency_contact' es obligatorio`)

        req.body.emergency_phone ?
            typeof req.body.emergency_phone === 'string' ?
                req.body.emergency_phone.length === 10 ? null
                    : __ThrowError(`El campo 'emergency_phone' debe tener una longitud de 10 dígitos`)
                : __ThrowError(`El campo 'emergency_phone' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'emergency_phone' es obligatorio`)

        req.body.blood_type ?
            typeof req.body.blood_type === 'string' ? null
                : __ThrowError(`El campo 'blood_type' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'blood_type' es obligatorio`)

        req.body.provider_type ?
            typeof req.body.provider_type === 'string' ? null
                : __ThrowError(`El campo 'provider_type' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'provider_type' es obligatorio`)

        let provider_type_enum = false
        for (let str of ['Servicio social', 'Prácticas profesionales', 'No aplica']) {
            req.body.provider_type === str ? provider_type_enum = true : null
        }
        provider_type_enum ? null : __ThrowError(`El campo 'provider_type' debe contener solo una de las siguientes strings 'Servicio social', 'Prácticas profesionales', 'No aplica'`)

        req.body.place ?
            typeof req.body.place === 'string' ? null
                : __ThrowError(`El campo 'place' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'place' es obligatorio`)

        req.body.assignment_area ?
            typeof req.body.assignment_area === 'string' ? null
                : __ThrowError(`El campo 'assignment_area' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'assignment_area' es obligatorio`)

        req.body.status ?
            typeof req.body.status === 'string' ? null
                : __ThrowError(`El campo 'status' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'status' es obligatorio`)

        let status_enum = false
        for (let str of ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']) {
            req.body.status === str ? status_enum = true : null
        }
        status_enum ? null : __ThrowError(`El campo 'status' debe contener solo una de las siguientes strings 'Activo', 'Suspendido', 'Inactivo', 'Finalizado'`)

        req.body.school ?
            typeof req.body.school === 'string' ? null
                : __ThrowError(`El campo 'school' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'school' es obligatorio`)

        req.body.role ?
            typeof req.body.role === 'string' ? null
                : __ThrowError(`El campo 'role' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'role' es obligatorio`)

        let role_enum = false
        for (let str of ['Administrador', 'Encargado', 'Prestador']) {
            req.body.role === str ? role_enum = true : null
        }
        role_enum ? null : __ThrowError(`El campo 'provider_type' debe contener solo una de las siguientes strings 'Administrador', 'Encargado', 'Prestador'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        await new User(req.body).save().then(result => {
            if (result) {
                return res.status(201).json({
                    message: "Usuario creado",
                    data: result
                })
            } else {
                return res.status(500).json({
                    message: "No se pudo crear el usuario",
                })
            }
        }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )
    } catch (error: any) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserDelete = async (req: Request, res: Response) => {
    try {
        await User.deleteOne({ 'register': req.params.id }).then(
            (result) => {
                if (result.deletedCount !== 0) {
                    return res.status(200).json({
                        message: "Usuario eliminado",
                    })
                } else {
                    return res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )

    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}

export const UserPatch = async (req: Request, res: Response) => {
    try {
        req.body.password || req.body.register ?
            __ThrowError("Algunos campos no se pueden actualizar")
            : null

        req.body.first_name ?
            typeof req.body.first_name === 'string' ? null
                : __ThrowError(`El campo 'first_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'first_name' es obligatorio`)

        req.body.first_last_name ?
            typeof req.body.first_last_name === 'string' ? null
                : __ThrowError(`El campo 'first_last_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'first_last_name' es obligatorio`)

        req.body.second_last_name ?
            typeof req.body.second_last_name === 'string' ? null
                : __ThrowError(`El campo 'second_last_name' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'second_last_name' es obligatorio`)

        req.body.age ?
            typeof req.body.age === 'number' ? null
                : __ThrowError(`El campo 'age' debe ser tipo 'number'`)
            : __ThrowError(`El campo 'age' es obligatorio`)

        req.body.email ?
            typeof req.body.email === 'string' ? null
                : __ThrowError(`El campo 'email' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'email' es obligatorio`)

        req.body.phone ?
            typeof req.body.phone === 'string' ?
                req.body.phone.length === 10 ? null
                    : __ThrowError(`El campo 'phone' debe tener una longitud de 10 dígitos`)
                : __ThrowError(`El campo 'phone' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'phone' es obligatorio`)

        req.body.emergency_contact ?
            typeof req.body.emergency_contact === 'string' ? null
                : __ThrowError(`El campo 'emergency_contact' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'emergency_contact' es obligatorio`)

        req.body.emergency_phone ?
            typeof req.body.emergency_phone === 'string' ?
                req.body.emergency_phone.length === 10 ? null
                    : __ThrowError(`El campo 'emergency_phone' debe tener una longitud de 10 dígitos`)
                : __ThrowError(`El campo 'emergency_phone' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'emergency_phone' es obligatorio`)

        req.body.blood_type ?
            typeof req.body.blood_type === 'string' ? null
                : __ThrowError(`El campo 'blood_type' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'blood_type' es obligatorio`)

        req.body.provider_type ?
            typeof req.body.provider_type === 'string' ? null
                : __ThrowError(`El campo 'provider_type' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'provider_type' es obligatorio`)

        let provider_type_enum = false
        for (let str of ['Servicio social', 'Prácticas profesionales', 'No aplica']) {
            req.body.provider_type === str ? provider_type_enum = true : null
        }
        provider_type_enum ? null : __ThrowError(`El campo 'provider_type' debe contener solo una de las siguientes strings 'Servicio social', 'Prácticas profesionales', 'No aplica'`)

        req.body.place ?
            typeof req.body.place === 'string' ? null
                : __ThrowError(`El campo 'place' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'place' es obligatorio`)

        req.body.assignment_area ?
            typeof req.body.assignment_area === 'string' ? null
                : __ThrowError(`El campo 'assignment_area' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'assignment_area' es obligatorio`)

        req.body.status ?
            typeof req.body.status === 'string' ? null
                : __ThrowError(`El campo 'status' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'status' es obligatorio`)

        let status_enum = false
        for (let str of ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']) {
            req.body.provider_type === str ? status_enum = true : null
        }
        status_enum ? null : __ThrowError(`El campo 'provider_type' debe contener solo una de las siguientes strings 'Activo', 'Suspendido', 'Inactivo', 'Finalizado'`)

        req.body.school ?
            typeof req.body.school === 'string' ? null
                : __ThrowError(`El campo 'school' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'school' es obligatorio`)

        req.body.role ?
            typeof req.body.role === 'string' ? null
                : __ThrowError(`El campo 'role' debe ser tipo 'string'`)
            : __ThrowError(`El campo 'role' es obligatorio`)

        let role_enum = false
        for (let str of ['Administrador', 'Encargado', 'Prestador']) {
            req.body.provider_type === str ? role_enum = true : null
        }
        role_enum ? null : __ThrowError(`El campo 'provider_type' debe contener solo una de las siguientes strings 'Administrador', 'Encargado', 'Prestador'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {

        await User.updateOne({ 'register': req.params.id }, req.body).then(
            (result) => {
                if (result.modifiedCount > 0) {
                    return res.status(200).json({
                        message: `Se actualizó la información del usuario ${req.params.id}`
                    })
                } else {
                    return res.status(404).json({
                        message: `Usuario ${req.params.id} no encontrado`
                    })
                }
            }
        ).catch(
            (error) => {
                return res.status(500).json({
                    message: "Ocurrió un error interno con la base de datos",
                    error: error?.toString()
                })
            }
        )

    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error",
            error: error?.toString()
        })
    }
}