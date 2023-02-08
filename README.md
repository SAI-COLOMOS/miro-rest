# Sistema Administrativo de la Información (SAI) - API

![Logotoipo de Sistema Administrativo de la Información](/app/public/logo.png)

## Indice

- [Acerca del proyecto](#acerca-del-proyecto)
- [Manual de uso de la API](#manual-de-uso-de-la-api-rest)

## Acerca del proyecto

Este trabajo es parte de nuestro proyecto de titulación, el cual consiste en una plataforma que conformada por una API (este repositorio) y una [aplicación móvil](https://www.github.com/SAI-AMBU/sai-app). Con el fin de modernizar y automatizar las diferentes áreas dentro de la Agencia Metropolitana de Bosques Urbanos del Área Metropolitana de Guadalajara.

Posteriormente encontrarás la estructura que deben de llevar las peticiones para la API, así como su respuesta a dicha petición.

## Manual de uso de la API REST

A continuación, se documenta el cómo realizar las peticiones a nuestra API REST, que van desde los _endpoints_ que se disponen, el formato de la petición y qué valores son obligatorios y cuales opciones.

Cabe mencionar que, cómo este proyecto está en constante desarrollo, no siempre se incluirán todas las funcionalidades en este documento. Sin embargo, esto no exime a los desarrolladores a que, una vez terminado el desarrollo de una funcionalidad nueva, tenga que documentarla en este archivo, con el fin de que los desarrolladres que necesiten hacer uso de ella puedan tener y entender el funcionamiento de la misma.

> - ❗ Es necesario que el desarrollador sea lo más explícito y claro posible al documentar su nueva funcionalidad, así evitaremos malos entendidos y no habrá necesidad de molestarle para preguntar sobre cómo es que tenemos que hacer para utilizar su función.
> - ❗ Es importante cuidar la gramática y ortografía al momento de documentar, no por que no podamos programar con acentos y en inglés, signifique que tengamos que docuemntar sin respetar las reglas de nuestro idioma.

## Inicio de sesión

La petición debe ser enviada con el método `GET` hacia la siguiente ruta:
>localhost:3000/auth/login

Dicha petición debe tener la siguiente estructura:

```
{
    credential: string,
    password: string,
    keepAlive: boolean
}
```

- El campo `credential` debe contener solamente uno de los siguientes datos:
  - El email del usuario.
  - El registro del usuario.
  - El número teléfonico del usuario.

- El campo `password` debe contener la contraseña del usuario.

- El campo `keepAlive` debe contener un booleano para definir si la duración del token será de 3 días o 3 meses.

### Respuesta

```
{
    mesasge: String,
    user: JSON,
    token: String
}
```

## Recuperación de contraseña

En el proceso de recuperación consiste de dos pasos:

1. Solicitud del token para validar la operación del cambio de datos.
2. El cambio de contraseña.

### Solicitud de token

La petición debe ser enviada con el método `GET` hacia la siguiente ruta:
>localhost:3000/auth/recover

Dicha petición debe de tener la siguiente estructura:

```
{
    credential: String
}
```

- El campo de campo `credential` debe contener solamente uno de los siguientes datos:
  - El email del usuario.
  - El registro del usuario.
  - El número teléfonico del usuario.

#### Respuesta

```
{
    message: String
}
```

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

- El campo `password` debe contener la nueva contraseña la cual debe cumplir con las siguientes reglas:
  - Debe tener una longitud mínima de 8 carácteres.
  - Debe tener al menos una letra mayúscula.
  - Debe tener al menos un carácter especial.
  - Debe tener al menos un número.

#### Respuesta

```
{
    message: String
}
```

## CRUD Tarjetón

### Obtener los tarjetones de todos los prestadores

La petición debe ser enviada con el método `GET` hacia la siguiente ruta:
>localhost:3000/cards

Dicha petición debe de tener la siguiente estructura:

```
{
   items: Number,
   page: Number,
   status: String
}
```

Todos los campos son opcionales.

- El campo `items` debe contener la cantidad de tarjetones que se quieren recuperar.
- El campo `page` debe contener la página a la cual se quiere acceder.
- El campo `status` debe contener solo una de las siguientes strings:
  - Activo
  - Inactivo
  - Suspendido
  - Finalizado

#### Respuesta

```
{
    message: String,
    cards: Array
}
```

El array del parámetro `cards` contiene todos los tarjetones en forma de objetos.

### Obtener el tarjetón de un solo prestador

La petición debe ser enviada con el método `GET` hacia la siguiente ruta:
>localhost:3000/cards/:id

El parámetro de `id` en la ruta hace referencia al registro del prestador en cuestión.

#### Respuesta

```
{
    message: String,
    card: Array
}
```

El array del parámetro `card` contiene todas las actividades del prestador en forma de objetos.

### Añadir un objeto de horas al tarjetón de un prestador

La petición debe ser enviada con el método `POST` hacia la siguiente ruta:
>localhost:3000/cards/:id

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
