import multer, { FileFilterCallback } from "multer"
import { Request } from "express"

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

export const fileMiddleware = upload.single('avatar')