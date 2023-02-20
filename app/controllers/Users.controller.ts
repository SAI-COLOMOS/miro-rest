import { Request, Response } from "express"
import User from "../models/User"
import { __CheckEnum, __ThrowError } from "../middleware/ValidationControl"

export const UsersGet = async (req: Request, res: Response) => {
    try {
        !req.body.items ? null
            : typeof req.body.items === "number" ? null
                : __ThrowError("El campo 'items' debe ser tipo 'number'")

        !req.body.page ? null
            : typeof req.body.page === 'number' ? null
                : __ThrowError(`El campo 'page' debe ser tipo 'number'`)

        !req.body.search ? null
            : typeof req.body.search === 'string' ? null
                : __ThrowError(`El campo 'search' debe ser tipo 'string'`)

        !req.body.filter ? null
            : typeof req.body.filter === 'object' ? null
                : __ThrowError(`El campo 'filter' debe ser tipo 'object'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const items: number = req.body.items > 0 ? req.body.items : 10
        const page: number = req.body.page > 0 ? req.body.page - 1 : 0
        const filter: object = req.body.filter ?
            req.body.search ?
                {
                    ...req.body.filter,
                    $or: [
                        { "first_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "first_last_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "second_last_name": { $regex: '.*' + req.body.search + '.*' } },
                        { "register": { $regex: '.*' + req.body.search + '.*' } },
                        { "phone": { $regex: '.*' + req.body.search + '.*' } }
                    ]
                }
                : req.body.filter
            : null

        const users = await User.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        return users.length > 0
            ? res.status(200).json({
                message: "Listo",
                users: users
            })
            : res.status(404).json({
                message: `Sin resultados`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const UserGet = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ 'register': req.params.id })

        return user
            ? res.status(200).json({
                message: "Listo",
                user: user
            })
            : res.status(404).json({
                message: `Usuario ${req.params.id} no encontrado`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const UserPost = async (req: Request, res: Response) => {

    try {
        const user: any = req.user
        user.role === "encargado" && req.body.role !== "prestador"
            ? __ThrowError(`El usuario de tipo 'encargado' no puede crear un usuario de tipo ${req.body.role}`)
            : null

        req.body.first_name ? null : __ThrowError(`El campo 'first_name' es obligatorio`)
        typeof req.body.first_name === 'string' ? null : __ThrowError(`El campo 'first_name' debe ser tipo 'string'`)

        req.body.first_last_name ? null : __ThrowError(`El campo 'first_last_name' es obligatorio`)
        typeof req.body.first_last_name === 'string' ? null : __ThrowError(`El campo 'first_last_name' debe ser tipo 'string'`)

        !req.body.second_last_name ? null
            : typeof req.body.second_last_name === 'string' ? null
                : __ThrowError(`El campo 'second_last_name' debe ser tipo 'string'`)

        req.body.age ? null : __ThrowError(`El campo 'age' es obligatorio`)
        typeof req.body.age === 'string' ? null : __ThrowError(`El campo 'age' debe ser tipo 'string'`)

        req.body.email ? null : __ThrowError(`El campo 'email' es obligatorio`)
        typeof req.body.email === 'string' ? null : __ThrowError(`El campo 'email' debe ser tipo 'string'`)

        req.body.phone ? null : __ThrowError(`El campo 'phone' es obligatorio`)
        typeof req.body.phone === 'string' ? null : __ThrowError(`El campo 'phone' debe ser tipo 'string'`)

        req.body.emergency_contact ? null : __ThrowError(`El campo 'emergency_contact' es obligatorio`)
        typeof req.body.emergency_contact === 'string' ? null : __ThrowError(`El campo 'emergency_contact' debe ser tipo 'string'`)

        req.body.emergency_phone ? null : __ThrowError(`El campo 'emergency_phone' es obligatorio`)
        typeof req.body.emergency_phone === 'string' ? null : __ThrowError(`El campo 'emergency_phone' debe ser tipo 'string'`)

        req.body.blood_type ? null : __ThrowError(`El campo 'blood_type' es obligatorio`)
        typeof req.body.blood_type === 'string' ? null : __ThrowError(`El campo 'blood_type' debe ser tipo 'string'`)


        req.body.place ? null : __ThrowError(`El campo 'place' es obligatorio`)
        typeof req.body.place === 'string' ? null : __ThrowError(`El campo 'place' debe ser tipo 'string'`)

        req.body.assigned_area ? null : __ThrowError(`El campo 'assigned_area' es obligatorio`)
        typeof req.body.assigned_area === 'string' ? null : __ThrowError(`El campo 'assigned_area' debe ser tipo 'string'`)

        req.body.status ? null : __ThrowError(`El campo 'status' es obligatorio`)
        typeof req.body.status === 'string' ? null : __ThrowError(`El campo 'status' debe ser tipo 'string'`)
        __CheckEnum(['activo', 'suspendido', 'inactivo', 'finalizado'], req.body.status, "status")

        req.body.school ? null : __ThrowError(`El campo 'school' es obligatorio`)
        typeof req.body.school === 'string' ? null : __ThrowError(`El campo 'school' debe ser tipo 'string'`)

        req.body.role ? null : __ThrowError(`El campo 'role' es obligatorio`)
        typeof req.body.role === 'string' ? null : __ThrowError(`El campo 'role' debe ser tipo 'string'`)
        __CheckEnum(['administrador', 'encargado', 'prestador'], req.body.role, "role")

        req.body.provider_type ? null : __ThrowError(`El campo 'provider_type' es obligatorio`)
        typeof req.body.provider_type === 'string' ? null : __ThrowError(`El campo 'provider_type' debe ser tipo 'string'`)

        __CheckEnum(
            req.body.role === 'prestador' ? ['servicio social', 'prácticas profesionales'] : ['servicio social', 'prácticas profesionales', 'no aplica']
            , req.body.provider_type, "provider_type")

    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await new User(req.body).save()

        return user
            ? res.status(201).json({
                message: "Usuario creado",
            })
            : res.status(500).json({
                message: "No se pudo crear el usuario",
            })
    } catch (error: any) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const UserDelete = async (req: Request, res: Response) => {
    try {
        const result = await User.deleteOne({ 'register': req.params.id })

        return result.deletedCount !== 0
            ? res.status(200).json({
                message: "Usuario eliminado",
            })
            : res.status(404).json({
                message: `Usuario ${req.params.id} no encontrado`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const UserPatch = async (req: Request, res: Response) => {
    try {
        req.body.password || req.body.register ?
            __ThrowError("Algunos campos no se pueden actualizar")
            : null

        !req.body.first_name ? null
            : typeof req.body.first_name === 'string' ? null
                : __ThrowError(`El campo 'first_name' debe ser tipo 'string'`)

        !req.body.first_last_name ? null
            : typeof req.body.first_last_name === 'string' ? null
                : __ThrowError(`El campo 'first_last_name' debe ser tipo 'string'`)

        !req.body.second_last_name ? null
            : typeof req.body.second_last_name === 'string' ? null
                : __ThrowError(`El campo 'second_last_name' debe ser tipo 'string'`)

        !req.body.age ? null
            : typeof req.body.age === 'string' ? null
                : __ThrowError(`El campo 'age' debe ser tipo 'string'`)

        !req.body.email ? null
            : typeof req.body.email === 'string' ? null
                : __ThrowError(`El campo 'email' debe ser tipo 'string'`)

        !req.body.phone ? null
            : typeof req.body.phone === 'string' ? null
                : __ThrowError(`El campo 'phone' debe ser tipo 'string'`)

        !req.body.emergency_contact ? null
            : typeof req.body.emergency_contact === 'string' ? null
                : __ThrowError(`El campo 'emergency_contact' debe ser tipo 'string'`)

        !req.body.emergency_phone ? null
            : typeof req.body.emergency_phone === 'string' ? null
                : __ThrowError(`El campo 'emergency_phone' debe ser tipo 'string'`)

        !req.body.blood_type ? null
            : typeof req.body.blood_type === 'string' ? null
                : __ThrowError(`El campo 'blood_type' debe ser tipo 'string'`)


        !req.body.place ? null
            : typeof req.body.place === 'string' ? null
                : __ThrowError(`El campo 'place' debe ser tipo 'string'`)

        !req.body.assigned_area ? null
            : typeof req.body.assigned_area === 'string' ? null
                : __ThrowError(`El campo 'assigned_area' debe ser tipo 'string'`)

        !req.body.status ? null
            : typeof req.body.status === 'string'
                ? __CheckEnum(['activo', 'suspendido', 'inactivo', 'finalizado'], req.body.status, "status")
                : __ThrowError(`El campo 'status' debe ser tipo 'string'`)

        !req.body.school ? null
            : typeof req.body.school === 'string' ? null
                : __ThrowError(`El campo 'school' debe ser tipo 'string'`)

        !req.body.role ? null
            : typeof req.body.role === 'string'
                ? __CheckEnum(['administrador', 'encargado', 'prestador'], req.body.role, "role")
                : __ThrowError(`El campo 'role' debe ser tipo 'string'`)

        !req.body.provider_type ? null
            : typeof req.body.provider_type === 'string'
                ? __CheckEnum(['servicio social', 'prácticas profesionales', 'no aplica'], req.body.provider_type, "provider_type")
                : __ThrowError(`El campo 'provider_type' debe ser tipo 'string'`)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await User.updateOne({ 'register': req.params.id }, req.body)

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: `Se actualizó la información del usuario ${req.params.id}`
            })
            : res.status(404).json({
                message: `Usuario ${req.params.id} no encontrado`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}