import { Request, Response } from "express"
import User from "../models/User"
import Card from "../models/Card"
import Environment from "../config/Environment"
import { mensaje, sendEmail } from "../config/Mailer"
import fs from 'fs/promises'
import { global_path } from "../server"
import { __ThrowError, __Optional, __Required, __Query } from "../middleware/ValidationControl"

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
        const user = new User(req.user)
        const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
        const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
        let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : null

        if (filter_request && filter_request.year && filter_request.period) {
            const period_condition = filter_request.period === "A"
                ? { $lte: [{ $month: '$createdAt' }, 6] }
                : { $gte: [{ $month: '$createdAt' }, 7] }

            filter_request = {
                ...filter_request, $expr: {
                    $and: [
                        { $eq: [{ $year: '$createdAt' }, Number(filter_request.year)] },
                        period_condition
                    ]
                }
            }

            delete filter_request.year
            delete filter_request.period
        }

        if (filter_request && filter_request.year) {
            filter_request = {
                ...filter_request, $expr: {
                    $eq: [{ $year: '$createdAt' }, Number(filter_request.year)]
                }
            }

            delete filter_request.year
        }

        if (filter_request && filter_request.period) {
            if (filter_request.period === "A")
                filter_request = {
                    ...filter_request, $expr: {
                        $lte: [{ $month: '$createdAt' }, 6]
                    }
                }

            if (filter_request.period === "B")
                filter_request = {
                    ...filter_request, $expr: {
                        $gte: [{ $month: '$createdAt' }, 7]
                    }
                }

            delete filter_request.period
        }

        if (req.query.search)
            filter_request = {
                ...filter_request,
                $or: [
                    { "first_name": { $regex: req.query.search, $options: "i" } },
                    { "first_last_name": { $regex: req.query.search, $options: "i" } },
                    { "second_last_name": { $regex: req.query.search, $options: "i" } },
                    { "register": { $regex: req.query.search, $options: "i" } },
                    { "curp": { $regex: req.query.search, $options: "i" } },
                    { "phone": { $regex: req.query.search } }
                ]
            }

        if (user.role === "Encargado") {
            filter_request.place = user.place
            filter_request.assigned_area = user.assigned_area
            filter_request.role = "Prestador"
        }

        const users = await User.find(filter_request).sort({ "createdAt": "desc" }).limit(items).skip(page * items)

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
    try {
        const user = new User(req.user)

        if (user.role === 'Encargado') {
            req.body.place = user.place
            req.body.assigned_area = user.assigned_area
            req.body.role = 'Prestador'
        }
        
        if (user.role === 'Administrador') {
            if(req.body.role == 'Encargado') {
                req.body.provider_type = 'No aplica'
            }
            __Required(req.body.role, `role`, `string`, ['Administrador', 'Encargado', 'Prestador'])
            __Required(req.body.place, `place`, `string`, null)
            __Required(req.body.assigned_area, `assigned_area`, `string`, null)
        }

        if (req.body.role === "Prestador") {
            __Required(req.body.school, `school`, `string`, null)
            __Required(req.body.provider_type, `provider_type`, `string`, ['Servicio social', 'Prácticas profesionales'])
            __Required(req.body.total_hours, `total_hours`, `number`, null)
        }

        __Required(req.body.first_name, `first_name`, `string`, null)

        __Required(req.body.first_last_name, `first_last_name`, `string`, null)

        __Required(req.body.curp, `curp`, `string`, null)

        __Optional(req.body.second_last_name, `second_last_name`, `string`, null)

        __Required(req.body.age, `age`, `string`, null)

        __Required(req.body.email, `email`, `string`, null)

        __Required(req.body.phone, `phone`, `string`, null)

        __Required(req.body.emergency_contact, `emergency_contact`, `string`, null)

        __Required(req.body.emergency_phone, `emergency_phone`, `string`, null)

        __Required(req.body.blood_type, `blood_type`, `string`, ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])

        __Optional(req.body.status, `status`, `string`, ['Activo', 'Suspendido', 'Inactivo', 'Finalizado'])

        __Optional(req.body.avatar, `avatar`, `string`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await new User(req.body).save()

        if (user) {
            const from = `"SAI" ${Environment.Mailer.email}`
            const to = String(user.email)
            const subject = "Bienvenido!"
            const body = mensaje(`Bienvenido al ${user.assigned_area} de ${user.place}`)
            await sendEmail(from, to, subject, body)
        }

        if (user && user.role === "Prestador")
            await new Card({ "provider_register": user.register, "total_hours": req.body.total_hours }).save()

        return user
            ? res.status(201).json({
                message: "Usuario creado",
            })
            : res.status(500).json({
                message: "No se pudo crear el usuario",
            })
    } catch (error) {
        return res.status(500).json({
            message: "Ocurrió un error en el servidor",
            error: error?.toString()
        })
    }
}

export const UserDelete = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ 'register': req.params.id })

        let deletedCount: number = 0

        if (user && user.role === "Prestador") {
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
        const user = new User(req.user)

        if (req.body.password)
            __ThrowError("El campo 'password' no se puede actualizar")

        if (req.body.register)
            __ThrowError("El campo 'register' no se puede actualizar")

        if (user.role === 'Encargado') {
            if (req.body.place)
                __ThrowError("El usuario de tipo 'Encargado' no puede modificar el campo 'place'")
            if (req.body.assigned_area)
                __ThrowError("El usuario de tipo 'Encargado' no puede modificar el campo 'assigned_area'")
            if (req.body.role)
                __ThrowError("El usuario de tipo 'Encargado' no puede modificar el campo 'role'")
        }

        __Optional(req.body.first_name, `first_name`, `string`, null)

        __Optional(req.body.first_last_name, `first_last_name`, `string`, null)

        __Optional(req.body.second_last_name, `second_last_name`, `string`, null)

        __Optional(req.body.curp, `curp`, `string`, null)

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

        __Optional(req.body.avatar, `avatar`, `string`, null)

        __Optional(req.body.provider_type, `provider_type`, `string`, ['Servicio social', 'Prácticas profesionales', 'No aplica'])

        __Optional(req.body.role, `role`, `string`, ['Encargado', 'Prestador', 'Administrador'])

        __Optional(req.body.total_hours, `total_hours`, `number`, null)
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const result = await User.updateOne({ 'register': req.params.id }, req.body)
        let card_results: number = 0

        if (req.body.total_hours)
            card_results = (await Card.updateOne({ 'provider_register': req.params.id }, { 'total_hours': req.body.total_hours })).modifiedCount

        return result.modifiedCount + card_results > 0
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

export const restorePassword = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ "register": req.params.id })

        if (user) {
            user.password = user.register
            user.save()
        }

        return user
            ? res.status(200).json({
                message: `Se restauró la contraseña del usuario ${req.params.id}`
            })
            : res.status(400).json({
                message: `No se encontró el usuario ${req.params.id}`
            })

    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}

export const updatePassword = async (req: Request, res: Response) => {
    try {
        __Required(req.body.password, `password`, `string`, null)

        if (!(/^.*(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/).test(req.body.password))
            __ThrowError("La contraseña no cumple con la estructura deseada")
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await User.findOne({ "register": req.params.id })

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

export const updateAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file)
            return res.status(400).json({
                message: "No subió una imágen o la imágen que subió es inválida"
            })

        const file = await fs.readFile(`${global_path}/temp/${req.file!.filename}`)
        const base64 = file.toString('base64')

        const result = await User.updateOne({ "register": req.params.id }, { "avatar": base64 })

        await fs.unlink(`${global_path}/temp/${req.file!.filename}`)

        return result.modifiedCount > 0
            ? res.status(200).json({
                message: "Foto de perfil actualizada"
            })
            : res.status(400).json({
                message: `No se encontró el usuario ${req.params.id}`
            })
    } catch (error) {
        return res.status(500).json({
            message: `Ocurrió un error en el servidor`,
            error: error?.toString()
        })
    }
}