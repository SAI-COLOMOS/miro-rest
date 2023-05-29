export interface ICharData {
  labels: string[]
  title: string
  data: number[]
  type: 'closed' | 'numeric' | '',
  comment: string
}

export interface IImageData {
  image: Buffer
  title: string
  width: number,
  comment: string
}

export interface IOpenData {
  response: string
  title: string
}

export interface IOpenAnswers {
  title: string
  answers: string[] | string[][]
}