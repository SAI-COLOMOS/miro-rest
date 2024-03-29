import { model, Schema, Document } from "mongoose"
import Bycrypt from "bcrypt"
import Place, { IArea } from "./Place"

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

const UserSchema = new Schema(
  {
    register: {
      type: String,
      unique: true,
    },
    curp: {
      type: String,
      required: [true, "La CURP es necesaria"],
      trim: true
    },
    first_name: {
      type: String,
      required: [true, "El nombre es necesario"],
      trim: true
    },
    first_last_name: {
      type: String,
      required: [true, "Un apellido es necesario"],
      trim: true
    },
    second_last_name: {
      type: String,
      trim: true
    },
    age: {
      type: String,
      required: [true, "La edad es necesaria"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo es necesario"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "El teléfono de contacto es necesario"],
      minLength: [10, "El número telefónico tiene que ser igual a 10 digitos"],
      maxLength: [10, "El número telefónico tiene que ser igual a 10 digitos"]
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
    },
    emergency_contact: {
      type: String,
      required: [true, "El contacto de emergencia es necesario"],
    },
    emergency_phone: {
      type: String,
      minLength: [10, "El número telefónico tiene que ser igual a 10 digitos"],
      maxLength: [10, "El número telefónico tiene que ser igual a 10 digitos"],
      required: [true, "El teléfono de emergencia es necesario"],
    },
    blood_type: {
      type: String,
      required: [true, "El tipo de sangre es necesario"],
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    },
    provider_type: {
      type: String,
      enum: ["Servicio social", "Prácticas profesionales", "No aplica"],
      default: "No aplica"
    },
    place: {
      type: String,
      required: [true, "El lugar es necesario"],
    },
    assigned_area: {
      type: String,
      required: [true, "El área de asignación es necesaria"],
    },
    status: {
      type: String,
      enum: ["Activo", "Suspendido", "Inactivo", "Finalizado"],
      default: "Activo",
    },
    school: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Administrador", "Encargado", "Prestador"],
      required: [true, "El rol es necesario"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

async function newRegisterForProvider (inputPlace: string, inputAssigned_area: string): Promise<string> {
  const [year, month] = new Date().toISOString().split("-")

  const seasson = Number(month) <= 6 ? "A" : "B"

  const place = await Place.findOne({ place_name: inputPlace })

  const area = place!.place_areas.filter((item: IArea) =>
    item.area_name === inputAssigned_area ? true : null
  )

  const lastRegister = await User.findOne().sort({ register: "desc" }).select("register")
    .where({
      register: {
        $regex:
          `${year}${seasson}${place!.place_identifier}${area[0].area_identifier
          }` + ".*",
      },
    })

  let serie = "001"

  if (lastRegister) {
    let nextSerie = Number(lastRegister.register.substring(lastRegister.register.length - 3)) + 1

    if (nextSerie < 10) {
      serie = "00" + nextSerie
    } else if (nextSerie < 100) {
      serie = "0" + nextSerie
    } else {
      serie = nextSerie.toString()
    }
  }

  return `${year}${seasson}${place!.place_identifier}${area[0].area_identifier}${serie}`.normalize('NFD')
}

async function newRegisterForAdministratorOrManager (
  inputFirst_name: string,
  inputFirst_last_name: string,
  inputSecond_last_name: string,
  inputPlace: string,
  inputAssigned_area: string
): Promise<string> {
  const first_name = inputFirst_name.substring(0, 2).toUpperCase()

  const first_last_name = inputFirst_last_name.substring(0, 2).toUpperCase()

  const second_last_name = inputSecond_last_name
    ? inputSecond_last_name.substring(0, 2).toUpperCase()
    : "XX"

  const place = await Place.findOne({ place_name: inputPlace })

  const area = place!.place_areas.filter((item: IArea) =>
    item.area_name === inputAssigned_area ? true : null
  )

  const random: string = `${Math.floor(Math.random() * 9).toString()}${Math.floor(Math.random() * 9).toString()}`

  return `${first_last_name}${second_last_name}${first_name}${place!.place_identifier}${area[0].area_identifier}${random}`.normalize('NFD')
}

UserSchema.pre<IUser>("save", async function (next) {
  if (this.isNew) {
    if (this.role === "Prestador") {
      const register = await newRegisterForProvider(
        this.place,
        this.assigned_area
      )

      this.register = register
      this.password = register
    } else if (this.role === "Administrador" || this.role === "Encargado") {
      const register = await newRegisterForAdministratorOrManager(
        this.first_name,
        this.first_last_name,
        this.second_last_name,
        this.place,
        this.assigned_area
      )

      this.register = register
      this.password = register

      this.provider_type = "No aplica"
      this.school = "No aplica"
    }
  }

  next()
})

UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await Bycrypt.hash(
      this.password,
      await Bycrypt.genSalt(10)
    )
  }

  next()
})

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return await Bycrypt.compare(password, this.password)
}

const User = model<IUser>("Users", UserSchema)

export default User
