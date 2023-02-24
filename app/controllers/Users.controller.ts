import { Request, Response } from "express"
import User from "../models/User"
import { __ThrowError, __Optional, __Required, __Query } from "../middleware/ValidationControl"
import Card from "../models/Card"

export const UsersGet = async (req: Request, res: Response) => {
    try {
        __Query(req.query.items, `items`, `number`)

        __Query(req.query.page, `page`, `number`)
    } catch (error) {
        return res.status(400).json({
            error: error?.toString()
        })
    }

    try {
        const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
        const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
        const filter: object = req.query.filter ?
            req.query.search ?
                {
                    ...JSON.parse(String(req.query.filter)),
                    $or: [
                        { "first_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "first_last_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "second_last_name": { $regex: '.*' + req.query.search + '.*' } },
                        { "register": { $regex: '.*' + req.query.search + '.*' } },
                        { "phone": { $regex: '.*' + req.query.search + '.*' } }
                    ]
                }
                : JSON.parse(String(req.query.filter))
            : null

        const users = await User.find(filter).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

        return res.status(200).json({
            message: "Listo",
            users: users
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
            : res.status(400).json({
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
    let total_hours: number = 0
    try {
        __Required(req.body.role, `role`, `string`, ['Administrador', 'Encargado', 'Prestador'])

        const user: any = req.user
        user.role === "Encargado" && req.body.role !== "Prestador"
            ? __ThrowError(`El usuario de tipo 'encargado' no puede crear un usuario de tipo ${req.body.role}`)
            : null

        __Required(req.body.first_name, `first_name`, `string`, null)

        __Required(req.body.first_last_name, `first_last_name`, `string`, null)

        __Optional(req.body.second_last_name, `second_last_name`, `string`, null)

        __Required(req.body.age, `age`, `string`, null)

        __Required(req.body.email, `email`, `string`, null)

        __Required(req.body.phone, `phone`, `string`, null)

        __Required(req.body.emergency_contact, `emergency_contact`, `string`, null)

        __Required(req.body.emergency_phone, `emergency_phone`, `string`, null)

        __Required(req.body.blood_type, `blood_type`, `string`, ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])

        __Required(req.body.place, `place`, `string`, null)

        __Required(req.body.assigned_area, `assigned_area`, `string`, null)

        __Required(req.body.status, `status`, `string`, ['Activo', 'Suspendido', 'Inactivo', 'Finalizado'])

        __Required(req.body.school, `school`, `string`, null)

        __Required(req.body.provider_type, `provider_type`, `string`,
            req.body.role === 'Prestador'
                ? ['Servicio social', 'Prácticas profesionales']
                : ['No aplica'])

        req.body.role === 'Prestador' ? __Required(req.body.total_hours, `total_hours`, `number`, null) : null
        if (req.body.total_hours) {
            total_hours = req.body.total_hours
            delete req.body.total_hours
        }
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await new User(req.body).save()

        user?.role === "Prestador"
            ? await new Card({ "provider_register": user.register, "total_hours": total_hours }).save()
            : null

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
            : res.status(400).json({
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

        __Optional(req.body.first_name, `first_name`, `string`, null)

        __Optional(req.body.first_last_name, `first_last_name`, `string`, null)

        __Optional(req.body.second_last_name, `second_last_name`, `string`, null)

        __Optional(req.body.age, `age`, `string`, null)

        __Optional(req.body.email, `email`, `string`, null)

        __Optional(req.body.phone, `phone`, `string`, null)

        __Optional(req.body.emergency_contact, `emergency_contact`, `string`, null)

        __Optional(req.body.emergency_phone, `emergency_phone`, `string`, null)

        __Optional(req.body.blood_type, `blood_type`, `string`, ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])

        __Optional(req.body.place, `place`, `string`, null)

        __Optional(req.body.assigned_area, `assigned_area`, `string`, null)

        __Optional(req.body.status, `status`, `string`, ['Activo', 'Suspendido', 'Inactivo', 'Finalizado'])

        __Optional(req.body.school, `school`, `string`, null)

        __Optional(req.body.role, `role`, `string`, ['Administrador', 'Encargado', 'Prestador'])

        __Optional(req.body.provider_type, `provider_type`, `string`, ['Servicio social', 'Prácticas profesionales', 'No aplica'])
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
            : res.status(400).json({
                message: `Usuario ${req.params.id} no encontrado`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const updatePassword = async (req: Request, res: Response) => {
    try {
        __Required(req.body.password, `password`, `string`, null);

        (/^.*(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/).test(req.body.password)
            ? null
            : __ThrowError("La contraseña no cumple con la estructura deseada")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await User.findOne({ "register": req.params.id }).sort({ "register": "desc" })

        if (user && !(await user.validatePassword(req.body.password))) {
            user.password = req.body.password
            user.save()

            return res.status(200).json({
                message: "Se actualizó la contraseña del usuario"
            })
        }

        return user
            ? res.status(400).json({
                message: "La nueva contraseña no puede ser igual a la actual"
            })
            : res.status(400).json({
                message: `No se encontró el usuario ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}