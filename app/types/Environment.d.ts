import { Ngrok } from 'ngrok'

export interface IEnvironment {
  JWT: {
    secret: string,
  },
  MonogoDB: {
    uri: string,
  },
  Mailer: {
    email: string,
    appPass: string,
  },
  ngrok: {
    authtoken: string | undefined,
    proto: Ngrok.Protocol | undefined,
    hostname: string,
    addr: string | number | undefined,
  }
}