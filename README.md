# Manual de uso de la API REST

![Logotoipo de Sistema Administrativo de la Información](/app/public/logo.png)

## Indice

- [Acerca del proyecto](#acerca-del-proyecto)
- [Autenticación](#autenticación)
  - [Inicio de sesión](#inicio-de-sesión)
  - [Solicitud de recuperación de contraseña](#solicitud-de-recuperación-de-contraseña)
  - [Restablecimiento de la contraseña](#restablecimiento-de-la-contraseña)

## Acerca del proyecto

Este trabajo es parte de nuestro proyecto de titulación, el cual consiste en una plataforma que conformada por una API (este repositorio) y una [aplicación móvil](https://www.github.com/SAI-AMBU/sai-app). Con el fin de modernizar y automatizar las diferentes áreas dentro de la Agencia Metropolitana de Bosques Urbanos del Área Metropolitana de Guadalajara.

A continuación, se documenta el cómo realizar las peticiones a nuestra API REST, que van desde los _endpoints_ que se disponen, el formato de la petición y qué valores son obligatorios y cuales opciones.

Cabe mencionar que, cómo este proyecto está en constante desarrollo, no siempre se incluirán todas las funcionalidades en este documento. Sin embargo, esto no exime a los desarrolladores a que, una vez terminado el desarrollo de una funcionalidad nueva, tenga que documentarla en este archivo, con el fin de que los desarrolladres que necesiten hacer uso de ella puedan tener y entender el funcionamiento de la misma.

> - ❗ Es necesario que el desarrollador sea lo más explícito y claro posible al documentar su nueva funcionalidad, así evitaremos malos entendidos y no habrá necesidad de molestarle para preguntar sobre cómo es que tenemos que hacer para utilizar su función.
> - ❗ Es importante cuidar la gramática y ortografía al momento de documentar, no por que no podamos programar con acentos y en inglés, signifique que tengamos que docuemntar sin respetar las reglas de nuestro idioma.

## Autenticación

### Inicio de sesión

----------

> GET /auth/login

Funciona para autenticar un usuario.

**Petición**
```dart
var request = await http.get(Uri.http('/auth/login'), body: {
    'credential': '2023A0103001',
    'password': '@A1B2C3D4'
});
```
Capos obligatorios
- `credential`: Campo de tipo `string`, en él se transporta la credencial del usuario, el cual puede ser: correo, número telefónico o registro.
- `password`: Campo de tipo `string`, en el se transporta la contraseña del usuario.

Campos opcionales
- `keepAlive`: Campo de tipo `booleano`, cuando es `true` el servidor responde con un token con vencimiento de 90 días, caso contrario, la vigencia del token es de tres días.

**Respuesta**
```json
{
    "message": "Sesión iniciada",
    "user": {
        "_id": "63e3f0b06f1f5983422e3dbc",
        "register": "2023A0201001",
        "first_name": "Cynthia Gabriela",
        "first_last_name": "Ibarra",
        "second_last_name": "Ponce",
        "age": "19",
        "email": "cgip",
        "phone": "3332569494",
        "password": "Contraseña encriptada",
        "avatar": "/protected/default.png",
        "emergency_contact": "Martha Ponce Triscareño",
        "emergency_phone": "3313467985",
        "blood_type": "RH O+",
        "provider_type": "Servicio social",
        "place": "Parque Metropolitano",
        "assigned_area": "Servicios generales",
        "status": "Activo",
        "school": "Centro de Enseñanza Técnica Industrial plantel Colomos",
        "role": "Prestador",
        "createdAt": "2023-02-08T18:57:52.184Z",
        "updatedAt": "2023-02-08T18:57:52.184Z"
    },
    "token": "token"
}
```

### Solicitud de recuperación de contraseña

----------

> GET /auth/recovery

Solicita un token especial para recuperar la cuenta del usuario en caso de que este haya olvidado su contraseña

**Petición**
```dart
var request = await http.get(Uri.http('/auth/recovery'), body: {
    'credential': '2023A0103001'
});
```
Capos obligatorios
- `credential`: Campo de tipo `string`, en él se transporta la credencial del usuario, el cual puede ser: correo, número telefónico o registro.

**Respuesta**
```json
{
    "message": "Si se encontró el usuario; Se mandó un correo de recuperación"
}
```

### Restablecimiento de la contraseña

----------

> PATCH /auth/recover?tkn={TOKEN}

Realiza el proceso de actualización de contraseña

**Petición**
```dart
var request = await http.patch(Uri.http('/auth/recovery?tkn={TOKEN}'), body: {
    'password': '@A1B2C3D4'
});
```
Capos obligatorios
- `password`: Campo de tipo `string`, en el se transporta la nueva contraseña del usuario, la cual debe de cumplir con los siguientes requisitos:
  - Debe tener una longitud mínima de 8 carácteres.
  - Debe tener al menos una letra mayúscula.
  - Debe tener al menos un carácter especial.
  - Debe tener al menos un número.

**Respuesta**
```json
{
    "message": "Se actualizó la contraseña del usuario"
}
```

## Módulo de horas

### Obtener los tarjetones de todos los prestadores

----------

>GET /cards

Realiza un fetch de los tarjetones existentes de acuerdo a los parámetros otorgados.

**Petición**

```dart
var request = await http.get(Uri.http('/auth/recovery'), body: {
   "items": 10,
   "page": 2,
   "status": "Activo"
});

```

Todos los campos son opcionales.

- El campo `items` debe contener la cantidad de tarjetones que se quieren recuperar.
- El campo `page` debe contener la página a la cual se quiere acceder.
- El campo `status` debe contener solo una de las siguientes strings:
  - Activo
  - Inactivo
  - Suspendido
  - Finalizado

**Respuesta**

```json
{
    "message": "Listo",
    "cards": [
        {
            "_id": "63e07ed86e42b67d4f554af5",
            "provider_register": "2023A0103001",
            "activities": [],
            "createdAt": "2023-02-06T04:15:20.774Z",
            "updatedAt": "2023-02-06T04:32:30.644Z"
        }
    ]
}
```

### Obtener el tarjetón de un solo prestador

------

>GET /cards/:id

El parámetro de `id` en la ruta hace referencia al registro del prestador en cuestión.

**Respuesta**

```json
{
    "message": "Tarjetón de usuario encontrado",
    "card": [
        {
            "activity_name": "primer actividad",
            "hours": 12,
            "assignation_date": "2023-02-13T16:08:01.230Z",
            "responsible_register": "15",
            "_id": "63ea61689316834bac264f81"
        }
    ]
}
```

### Añadir un objeto de horas al tarjetón de un prestador

---

>POST /cards/:id

El parámetro de `id` en la ruta hace referencia al registro del prestador en cuestión.
Dicha petición debe tener la siguiente estructura:

```
{
    activity_name: String,
    hours: Number,
    responsible_register: String
}
```

- El campo `activity_name` debe contener el nombre de la actividad o evento.
- El campo `hours` debe contener la cantidad de horas que van a ser añadidas (Puede ser un número negativo).
- El campo `responsible_register` debe contener el registro del encargado que está asignando éstas horas.

#### Respuesta

```
{
    message: String
}
```

### Eliminar un objeto de horas al tarjetón de un prestador

La petición debe ser enviada con el método `DELETE` hacia la siguiente ruta:
>localhost:3000/cards/:id

El parámetro de `id` en la ruta hace referencia al registro del prestador en cuestión.
Dicha petición debe tener la siguiente estructura:

```
{
    _id: String
}
```

- El campo `_id` debe contener el ObjetId del objeto de horas que se va a eliminar.

#### Respuesta

```
{
    message: String
}
```

## Miselaneo

A continuación se anexan documentación que tal vez sea necesaria.

### Cómo realizar peticiones

#### Desde JavaScript

Para realizar peticiones desde JavaScript a nuestra API recomendamos hacer uso de la función ```fecth``` y emplear _promesas_. A continuación, se muestra un ejemplo general de como realizarla.

```javascript
const request = async _ => {
    await fetch(
        url,
        {
            method: ['GET', 'POST', 'PATCH', 'DELETE'],
            headers: {
                'Content-Type': 'application/json'
            }
            body: JSON.stringtify({
                // Aquí van los datos que serán envíados en la petición
            })
        }
    ).then(
        response => response.ok ? response.json() : null
    ).then(
        data => {
            // Aquí va el código que utilizará la información obtenida
        }
    ).catch(
        error => console.log(error)
    )
}
```

#### Desde Dart

Realizar peticiones desde Dart es un tanto más complicado, para ello es necesario realizar las siguientes acciones (lo siguiente que veremos está documentado en [la página de Flutter](https://docs.flutter.dev/cookbook/networking/fetch-data)):

- Primero, es necesario añadir el paquete `http`, para ello, abrimos el archivo `pubspec.yaml` y agregamos las siguientes líneas. 

```yaml
dependencies:
  http: <latest_version>
```

- Después, en nuestro archivo `.dart`, importamos la dependencia.

```dart
import 'package:http/http.dart' as http;
```

> Es necesario añadir en nuestro `AndroidManifest.xml` el permiso de acceso a internet, esto lo logramos con la siguiente línea

```xml
<uses-permission android:name="android.permission.INTERNET" />
```
