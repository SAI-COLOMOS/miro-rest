import { Request, Response } from "express"
import User from "../models/User"
import { __ThrowError, __Optional, __Required, __RequiredEnum, __OptionalEnum } from "../middleware/ValidationControl"
import Card from "../models/Card"

export const UsersGet = async (req: Request, res: Response) => {
    let items: number
    try {

        // isNaN(Number(req.query.items)) ? __ThrowError("El campo 'items' debe ser tipo 'number'") : null
        // console.log(Number(req.query.items))
        __Optional(Number(req.query.items), `items`, `number`)

        __Optional(req.body.page, `page`, `number`)

        __Optional(req.body.search, `search`, `string`)

        __Optional(req.body.filter, `filter`, `object`)
    } catch (error) {
        return res.status(400).json({
            error: error?.toString()
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
        __RequiredEnum(req.body.role, `role`, `string`, ['administrador', 'encargado', 'prestador'])

        const user: any = req.user
        user.role === "encargado" && req.body.role !== "prestador"
            ? __ThrowError(`El usuario de tipo 'encargado' no puede crear un usuario de tipo ${req.body.role}`)
            : null

        __Required(req.body.first_name, `first_name`, `string`)

        __Required(req.body.first_last_name, `first_last_name`, `string`)

        __Optional(req.body.second_last_name, `second_last_name`, `string`)

        __Required(req.body.age, `age`, `string`)

        __Required(req.body.email, `email`, `string`)

        __Required(req.body.phone, `phone`, `string`)

        __Required(req.body.emergency_contact, `emergency_contact`, `string`)

        __Required(req.body.emergency_phone, `emergency_phone`, `string`)

        __RequiredEnum(req.body.blood_type, `blood_type`, `string`, ['o+', 'o-', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-'])

        __Required(req.body.place, `place`, `string`)

        __Required(req.body.assigned_area, `assigned_area`, `string`)

        __RequiredEnum(req.body.status, `status`, `string`, ['activo', 'suspendido', 'inactivo', 'finalizado'])

        __Required(req.body.school, `school`, `string`)

        __RequiredEnum(req.body.provider_type, `provider_type`, `string`,
            req.body.role === 'prestador'
                ? ['servicio social', 'prácticas profesionales']
                : ['servicio social', 'prácticas profesionales', 'no aplica'])
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

        const user = await User.findOne({ 'register': req.params.id })

        let deletedCount = 0
        if (user?.role === "prestador") {
            const card_result = await Card.deleteOne({ "provider_register": req.params.id })
            const result = await User.deleteOne({ 'register': req.params.id })
            deletedCount = card_result.deletedCount + result.deletedCount
        } else {
            const result = await User.deleteOne({ 'register': req.params.id })
            deletedCount = result.deletedCount
        }

        return deletedCount !== 0
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
        req.body.password ? __ThrowError("El campo 'password' no se puede actualizar") : null
        req.body.register ? __ThrowError("El campo 'register' no se puede actualizar") : null

        __Optional(req.body.first_name, `first_name`, `string`)

        __Optional(req.body.first_last_name, `first_last_name`, `string`)

        __Optional(req.body.second_last_name, `second_last_name`, `string`)

        __Optional(req.body.age, `age`, `string`)

        __Optional(req.body.email, `email`, `string`)

        __Optional(req.body.phone, `phone`, `string`)

        __Optional(req.body.emergency_contact, `emergency_contact`, `string`)

        __Optional(req.body.emergency_phone, `emergency_phone`, `string`)

        __OptionalEnum(req.body.blood_type, `blood_type`, `string`, ['o+', 'o-', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-'])

        __Optional(req.body.place, `place`, `string`)

        __Optional(req.body.assigned_area, `assigned_area`, `string`)

        __OptionalEnum(req.body.status, `status`, `string`, ['activo', 'suspendido', 'inactivo', 'finalizado'])

        __Optional(req.body.school, `school`, `string`)

        __OptionalEnum(req.body.role, `role`, `string`, ['administrador', 'encargado', 'prestador'])

        __OptionalEnum(req.body.provider_type, `provider_type`, `string`, ['servicio social', 'prácticas profesionales', 'no aplica'])
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