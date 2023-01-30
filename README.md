# Sistema administrativo de la información (SAI)
---
Posteriormente encontrarás la estructura que deben de llevar las peticiones para la API, así como su respuesta a dicha petición.

## Recuperación de contraseña
En el proceso de recuperación consiste de dos pasos:
1. Solicitud del token para validar la operación del cambio de datos.
2. El cambio de contraseña.

### Solicitud de token
La petición debe ser enviada con el método `GET` hacia la siguiente ruta:
>localhost:3000/auth/recover

Dicha petición debe de tener la diguiente estructura:
```
{
    credential: String
}
```
El campo de campo `credential` debe contener solamente uno de los siguientes datos:
- El email del usuario.
- El registro del usuario.
- El número teléfonico del usuario.

En éste caso la respuesta solo va a contener un mensaje de confirmación. Ésto debido a que se envió un correo al que email que tenga asingano el usuario.

### Cambio de contraseña
La petición debe ser enviada con el método `PATCH` hacia la siguiente ruta:
>localhost:3000/auth/recover?tkn={TOKEN-PROPORCIONADA}

La ruta con el token será proporcionada por medio del correo enviado en el paso anterior.
Dicha petición debe tener la siguiente estructura:
```
{
    password: String
}
```
El campo `password` debe contener la nueva contraseña la cual debe cumplir con las siguientes reglas:
- Debe tener una longitud mínima de 8 carácteres.
- Debe tener al menos una letra mayúscula.
- Debe tener al menos un carácter especial.
- Debe tener al menos un número.

La respuesta solo tendrá un mensaje de confirmación.