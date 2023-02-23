
![Logotoipo de Sistema Administrativo de la Información](/app/public/logo.png)

# Manual de uso de MIRO-REST

Este trabajo es parte de nuestro proyecto de titulación, el cual consiste en una plataforma que conformada por una API (este repositorio) y una [aplicación móvil](https://www.github.com/SAI-AMBU/sai-app). Con el fin de modernizar y automatizar las diferentes áreas dentro de la Agencia Metropolitana de Bosques Urbanos del Área Metropolitana de Guadalajara.

A continuación, se documenta el cómo realizar las peticiones a nuestra API REST, que van desde los _endpoints_ que se disponen, el formato de la petición y qué valores son obligatorios y cuales opciones.

Cabe mencionar que, cómo este proyecto está en constante desarrollo, no siempre se incluirán todas las funcionalidades en este documento. Sin embargo, esto no exime a los desarrolladores a que, una vez terminado el desarrollo de una funcionalidad nueva, tenga que documentarla en este archivo, con el fin de que los desarrolladres que necesiten hacer uso de ella puedan tener y entender el funcionamiento de la misma.


## Index

- [**API usage**](#uso-de-la-api)
    - [Authentication](#authentication)
        - [Login](#login)
        - [Password reset request](#password-reset-request)
        - [Password reset](#password-reset)
    - [Places](#places)
        - [Get places](#get-places)
        - [Get a place](#get-a-place)
        - [Create a place](#create-a-place)
        - [Update a place](#update-a-place)
    - [Areas](#areas)
        - [Create an area](#create-an-area)
        - [Update an area](#update-an-area)
        - [Delete an area](#delete-an-area)

## Uso de la API

### Authentication

#### Login

- Endpoint

```http
POST /auth/login
```

- Parameters

| Parameter    | Type      | Description                                                                                        |
| :----------- | :-------- | :------------------------------------------------------------------------------------------------- |
| `credential` | `string`  | **Required**. May be the user's id, email or phone                                                 |
| `password`   | `string`  | **Required**. User's password                                                                      |
| `keepAlive`  | `boolean` | If true, will return an 90 days expiration token, else will return an three days expiration token. |

- Request

```javascript
fetch(
    `.../auth/login`,
    {
        method: "POST",
        headers: {
            `Content-Type`: `application/json`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            credential,
            password
        })
    }
)
```

- Response

```json
{
    "message": "Sesión iniciada",
    "token": "XXXX.XXXXXXXXXX.XXXXXX"
}
```

#### Password reset request

- Endpoint

```http
POST /auth/recovery
```

- Parameters

| Parameter    | Type     | Description                                         |
| :----------- | :------- | :-------------------------------------------------- |
| `credential` | `string` | **Required**. May be the user's id, email or phone  |

- Request

```javascript
fetch(
    `.../auth/recovey`,
    {
        method: "POST",
        headers: {
            `Content-Type`: `application/json`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            credential
        })
    }
)
```

- Response

```json
{
    "message": "Si se encontró el usuario; Se mandó un correo de recuperación"
}
```

#### Password reset

- Endpoint

```http
PATCH /auth/recovery?token=:token
```

- Parameters

| Parameter  | Type     | Description                                   |
| :--------- | :------- | :-------------------------------------------- |
| `password` | `string` | **Required**. New password generated by user  |

> ⚠️ Note: the new password must abide the following requirements:
> - Must have at least one number.
> - Must have at least one uppercase letter.
> - Must have at least one lowercase letter.
> - Must have at least one special character.
> - Must be at least eight characters long.

- Request

```javascript
fetch(
    `.../auth/recovey`,
    {
        method: "PATCH",
        headers: {
            `Content-Type`: `application/json`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            password
        })
    }
)
```

- Response

```json
{
    "message": "Se actualizó la contraseña del usuario"
}
```

### Places

> ⚠️ Note: this seccion is linked to _[Areas seccion](#areas)_. Both are part of _Places and Areas_ module.

#### Get places

- Endpoint

```http
GET /places
```

- Request

```javascript
fetch(
    `.../places`,
    {
        method: "GET",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Response

```json
{
    "message": "Listo",
    "places": [
        {
            "_id": "63f6d6e232ab8b79cd6c56bb",
            "place_name": "Parque Agua Azul",
            "municipality": "Guadalajara",
            "street": "Calzada Independencia Sur",
            "postal_code": "44100",
            "number": "973",
            "colony": "Centro",
            "phone": "3335241526",
            "place_areas": [],
            "createdAt": "2023-02-23T03:00:50.483Z",
            "updatedAt": "2023-02-23T03:00:50.483Z",
            "place_identifier": "02"
        },
        {
            "_id": "63f6cf38c6e5aca5b3f5f2b6",
            "place_name": "Bosque Los Colomos",
            "municipality": "Guadalajara",
            "street": "Calle El Chaco",
            "postal_code": "44630",
            "number": "3200",
            "colony": "Providencia",
            "phone": "3336413804",
            "place_areas": [
                {
                    "area_identifier": "01",
                    "area_name": "Centro de Educación y Cultura Ambiental",
                    "phone": "3313467900",
                    "_id": "63f6d3e91975d0ea79de99df"
                }
            ],
            "createdAt": "2023-02-23T02:28:08.370Z",
            "updatedAt": "2023-02-23T02:55:51.753Z",
            "place_identifier": "01"
        }
    ]
}
```

#### Get a place

- Endpoint

```http
GET /places/:place_identifier
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}`,
    {
        method: "GET",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Response

```json
{
    "message": "Listo",
    "place": {
        "_id": "63f6cf38c6e5aca5b3f5f2b6",
        "place_name": "Bosque Los Colomos",
        "municipality": "Guadalajara",
        "street": "Calle El Chaco",
        "postal_code": "44630",
        "number": "3200",
        "colony": "Providencia",
        "phone": "3336413804",
        "place_areas": [
            {
                "area_identifier": "01",
                "area_name": "Centro de Educación y Cultura Ambiental",
                "phone": "3313467900",
                "_id": "63f6d3e91975d0ea79de99df"
            }
        ],
        "createdAt": "2023-02-23T02:28:08.370Z",
        "updatedAt": "2023-02-23T02:55:51.753Z",
        "place_identifier": "01"
    }
}
```

#### Create a place

- Endpoint

```http
POST /places
```

- Parameters

| Parameter      | Type     | Description                             |
| :------------- | :------- | :-------------------------------------- |
| `place_name`   | `string` | **Required**. Name of the new place     |
| `street`       | `string` | **Required**. Address street name       |
| `number`       | `string` | **Required**. Address number            |
| `colony`       | `string` | **Required**. Address colony name       |
| `municipality` | `string` | **Required**. Address municipality name |
| `postal_code`  | `string` | **Required**. Address postal code       |
| `phone`        | `string` | **Required**. Contat phone number       |
| `reference`    | `string` | Address references                      |

- Request

```javascript
fetch(
    `.../places/`,
    {
        method: "POST",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            place_name,
            street,
            number,
            colony,
            municipality,
            postal_code,
            phone,
            reference
        })
    }
)
```

- Response

```json
{
    "message": "Parque añadido",
    "place": [
        {
            "place_name": "Bosque Los Colomos",
            "municipality": "Guadalajara",
            "street": "Calle El Chaco",
            "postal_code": "44630",
            "number": "3200",
            "colony": "Providencia",
            "phone": "3336413804",
            "_id": "63f6cf38c6e5aca5b3f5f2b6",
            "place_areas": [],
            "createdAt": "2023-02-23T02:28:08.370Z",
            "updatedAt": "2023-02-23T02:28:08.370Z",
            "place_identifier": "01"
        }
    ]
}
```

#### Update a place

- Endpoint

```http
PATCH /places/:place_identifier
```

- Parameters

| Parameter      | Type     | Description               |
| :------------- | :------- | :------------------------ |
| `place_name`   | `string` | Name of the new place     |
| `street`       | `string` | Address street name       |
| `number`       | `string` | Address number            |
| `colony`       | `string` | Address colony name       |
| `municipality` | `string` | Address municipality name |
| `postal_code`  | `string` | Address postal code       |
| `phone`        | `string` | Contat phone number       |
| `reference`    | `string` | Address references        |

> ⚠️ Note: only send the parameters that are going to be updated

- Request

```javascript
fetch(
    `.../places/${place_identifier}`,
    {
        method: "PATCH",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            ...
        })
    }
)
```

- Response

```json
{
    "message": "Se actualizó la información del lugar"
}
```

### Areas

> ⚠️ Note: this seccion is linked to _[Places seccion](#places)_. Both are part of _Places and Areas_ module.

#### Create an area

- Endpoint

```http
POST /places/:place_identifier
```

- Parameters

| Parameter   | Type     | Description                                    |
| :---------- | :------- | :--------------------------------------------- |
| `area_name` | `string` | **Required**. Name of the new area             |
| `phone`     | `string` | **Required**. Contact phone number of the area |

- Request

```javascript
fetch(
    `.../places/${place_identifier}`,
    {
        method: "POST",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            area_name,
            phone
        })
    }
)
```

- Response

```json
{
    "message": "Se añadió el area"
}
```

#### Update an area

- Endpoint

```http
PATCH /places/:place_identifier/:area_identifier
```

- Parameters

| Parameter   | Type     | Description                      |
| :---------- | :------- | :------------------------------- |
| `area_name` | `string` | Name of the new area             |
| `phone`     | `string` | Contact phone number of the area |

> ⚠️ Note: only send the parameters that are going to be updated

- Request

```javascript
fetch(
    `.../places/${place_identifier}/${area_identifier}`,
    {
        method: "PATCH",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            ...
        })
    }
)
```

- Response

```json
{
    "message": "El área fue modificado"
}
```

#### Delete an area

- Endpoint

```http
DELETE /places/:place_identifier/:area_identifier
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}/${area_identifier}`,
    {
        method: "DELETE",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Response

```json
{
    "message": "Se eliminó el área"
}
```
