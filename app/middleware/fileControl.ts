import multer, { FileFilterCallback } from "multer"
import Jimp from "jimp"
import { NextFunction, Request, Response } from "express"
import { global_path } from "../server"

const storage_config = multer.diskStorage({
  destination: function (_req, file, done) {
    if (!file)
      done({ message: "No hay archivo", name: "Error" }, 'dist/temp')

    done(null, 'dist/temp')
  },
  filename: async function (req, file, done) {
    const register = req.params.id
    const extension = file.mimetype.split("/")[1]
    done(null, `${register}.${extension}`)
  }
})

const upload = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter (_req: Request, file, done: FileFilterCallback) {
    file.mimetype.startsWith('image/')
      ? done(null, true)
      : done(null, false)
  },
  storage: storage_config
})

export const resize = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file)
    return next()

  const photo = await Jimp.read(`${global_path}/temp/${req.file?.filename}`)
  await photo.resize(250, 250, Jimp.RESIZE_BEZIER)
  await photo.writeAsync(`${global_path}/temp/${req.file?.filename}`)

  next()
}

export const fileMiddleware = upload.single('avatar')