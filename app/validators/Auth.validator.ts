import type { Schema } from 'joi'
import Joi from 'joi'

export const logInValidation: Schema = Joi.object({
  credential: Joi.string().required(),
  password: Joi.string().required(),
  keepAlive: Joi.boolean().optional()
})

export const credentialValidation = Joi.object({
  credential: Joi.string().required()
})

export const passwordValidation = Joi.object({
  password: Joi.string().required().regex(/^.*(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/)
})