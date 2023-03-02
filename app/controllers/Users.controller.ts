import { Request, Response } from "express"
import User from "../models/User"
import Card from "../models/Card"
import Enviroment from "../config/Enviroment"
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
        const items: number = Number(req.query.items) > 0 ? Number(req.query.items) : 10
        const page: number = Number(req.query.page) > 0 ? Number(req.query.page) - 1 : 0
        let filter_request = req.query.filter ? JSON.parse(String(req.query.filter)) : null

        if (filter_request)
            Object.keys(filter_request).forEach((key: string) => {
                if (key === "year") {
                    filter_request.register = { $regex: '^' + filter_request[key] }
                    delete filter_request.year
                }

                if (key === "period") {
                    filter_request.register = { $regex: "^.{4}[" + filter_request[key] + "]" }
                    delete filter_request.period
                }
            })

        if (req.query.search)
            filter_request = {
                ...filter_request,
                $or: [
                    { "first_name": { $regex: req.query.search, $options: "i" } },
                    { "first_last_name": { $regex: req.query.search, $options: "i" } },
                    { "second_last_name": { $regex: req.query.search, $options: "i" } },
                    { "register": { $regex: req.query.search, $options: "i" } },
                    { "phone": { $regex: req.query.search } }
                ]
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
    let total_hours: number = 0
    try {
        __Required(req.body.role, `role`, `string`, ['Administrador', 'Encargado', 'Prestador'])

        const user: any = req.user
        if (user.role === "Encargado" && req.body.role !== "Prestador")
            __ThrowError(`El usuario de tipo 'Encargado' no puede crear un usuario de tipo '${req.body.role}'`)

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

        __Optional(req.body.status, `status`, `string`, ['Activo', 'Suspendido', 'Inactivo', 'Finalizado'])

        __Optional(req.body.avatar, `avatar`, `string`, null)

        if (req.body.role === "Prestador")
            __Required(req.body.school, `school`, `string`, null)

        req.body.role === "Prestador"
            ? __Required(req.body.provider_type, `provider_type`, `string`, ['Servicio social', 'Prácticas profesionales'])
            : req.body.provider_type = "No aplica"

        if (req.body.role === 'Prestador')
            __Required(req.body.total_hours, `total_hours`, `number`, null)

        if (req.body.total_hours && req.body.role === 'Prestador')
            total_hours = req.body.total_hours

        delete req.body.total_hours
    } catch (error) {
        return res.status(400).json({
            error
        })
    }

    try {
        const user = await new User(req.body).save()

        if (user) {
            const from = `"SAI" ${Enviroment.Mailer.email}`
            const to = String(user.email)
            const subject = "Bienvenido!"
            const body = mensaje(`Bienvenido al ${user.assigned_area} de ${user.place}`)
            await sendEmail(from, to, subject, body)
        }

        if (user && user.role === "Prestador")
            await new Card({ "provider_register": user.register, "total_hours": total_hours }).save()

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

        let deletedCount: number = 0

        if (user && user.role === "Prestador") {
            await Promise.all([

            ])
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
        if (req.body.password)
            __ThrowError("El campo 'password' no se puede actualizar")

        if (req.body.register)
            __ThrowError("El campo 'register' no se puede actualizar")

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

        __Optional(req.body.avatar, `avatar`, `string`, null)

        __Optional(req.body.provider_type, `provider_type`, `string`, ['Servicio social', 'Prácticas profesionales', 'No aplica'])

        const user: any = req.user
        user.role === "Encargado"
            ? __ThrowError("El usuario de tipo 'Encargado' no puede modificar roles")
            : __Optional(req.body.role, `role`, `string`, ['Encargado', 'Prestador'])
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