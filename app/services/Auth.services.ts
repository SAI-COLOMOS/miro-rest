import { sign } from 'jsonwebtoken'
import User from '../models/User'
import { IUser } from '../types/User'
import Environment from '../config/Environment'
import { ICredential } from '../types/Auth'

export function createToken (user: IUser, time: String): string {
  return sign({
    register: user.register
  },
    Environment.JWT.secret,
    {
      expiresIn: String(time)
    })
}

export async function authenticate (data: ICredential): Promise<IUser | null> {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (emailRegex.test(data.credential))
    return await User.findOne({ email: data.credential }).sort({ "register": "desc" })

  if (!Number.isNaN(data.credential) && data.credential.length === 10)
    return await User.findOne({ phone: data.credential }).sort({ "register": "desc" })

  return await User.findOne({ register: data.credential }).sort({ "register": "desc" })
}