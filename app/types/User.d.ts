import { Document } from 'mongoose'

export interface IUser extends Document {
  register: string
  avatar: string
  curp: string
  first_name: string
  first_last_name: string
  second_last_name: string
  age: string
  email: string
  phone: string
  password: string
  emergency_contact: string
  emergency_phone: string
  blood_type: string
  provider_type: string
  place: string
  assigned_area: string
  status: string
  school: string
  role: string
  validatePassword: (password: string) => Promise<boolean>
}
