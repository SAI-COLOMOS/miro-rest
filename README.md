
![Logotoipo de Sistema Administrativo de la Información](/public/logo.png)

# Manual de uso de MIRO-REST

Este trabajo es parte de nuestro proyecto de titulación, el cual consiste en una plataforma que conformada por una API (este repositorio) y una [aplicación móvil](https://www.github.com/SAI-AMBU/sai-app). Con el fin de modernizar y automatizar las diferentes áreas dentro de la Agencia Metropolitana de Bosques Urbanos del Área Metropolitana de Guadalajara.

A continuación, se documenta el cómo realizar las peticiones a nuestra API REST, que van desde los _endpoints_ que se disponen, el formato de la petición y qué valores son obligatorios y cuales opciones.

Cabe mencionar que, cómo este proyecto está en constante desarrollo, no siempre se incluirán todas las funcionalidades en este documento. Sin embargo, esto no exime a los desarrolladores a que, una vez terminado el desarrollo de una funcionalidad nueva, tenga que documentarla en este archivo, con el fin de que los desarrolladres que necesiten hacer uso de ella puedan tener y entender el funcionamiento de la misma.


## Index

- [Manual de uso de MIRO-REST](#manual-de-uso-de-miro-rest)
  - [Index](#index)
  - [Uso de la API](#uso-de-la-api)
    - [Authentication](#authentication)
      - [Login](#login)
      - [Password reset request](#password-reset-request)
      - [Password reset](#password-reset)
    - [Places](#places)
      - [Get places](#get-places)
      - [Get a place](#get-a-place)
      - [Create a place](#create-a-place)
      - [Update a place](#update-a-place)
      - [Delete a place](#delete-a-place)
    - [Areas](#areas)
      - [Get all areas from several places](#get-all-areas-from-several-places)
      - [Get areas from a place](#get-areas-from-a-place)
      - [Get an area](#get-an-area)
      - [Create an area](#create-an-area)
      - [Update an area](#update-an-area)
      - [Delete an area](#delete-an-area)
    - [Users](#users)
      - [Get users](#get-users)
      - [Get an user](#get-an-user)
      - [Create a user](#create-a-user)
      - [Update a user](#update-a-user)
      - [Delete a user](#delete-a-user)
    - [Cards](#cards)
      - [Get cards](#get-cards)
      - [Get provider hours](#get-provider-hours)
      - [Add an activity to a card](#add-an-activity-to-a-card)
      - [Update an activity from a card](#update-an-activity-from-a-card)
      - [Delete an activity from a card](#delete-an-activity-from-a-card)
    - [Events](#events)
      - [Get events](#get-events)
      - [Get an event](#get-an-event)
      - [Create an event](#create-an-event)
      - [Update an event](#update-an-event)
      - [Update event status](#update-event-status)
      - [Delete an event](#delete-an-event)
    - [Forms](#forms)
    - [Get forms](#get-forms)
    - [Get a form](#get-a-form)
    - [Create a form](#create-a-form)
    - [Update a form](#update-a-form)
    - [Delete a form](#delete-a-form)

## Uso de la API

### Authentication

#### Login

- Endpoint

```http
POST /auth/login
```

- Parameters

| Parameter    | Type      | Required | Allowed values | Description                                                                                       |
| :----------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------ |
| `credential` | `string`  | Yes      | Any            | May be the user id, email or phone                                                                |
| `password`   | `string`  | Yes      | Any            | User password                                                                                     |
| `keepAlive`  | `boolean` | No       | Any            | If true, will return an 90 days expiration token, else will return an three days expiration token |

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

- Example response from server

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

| Parameter    | Type     | Required | Allowed values | Description                        |
| :----------- | :------- | :------- | :------------- | :--------------------------------- |
| `credential` | `string` | Yes      | Any            | May be the user id, email or phone |

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

- Example response from server

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

| Parameter  | Type     | Required | Allowed values | Description                    |
| :--------- | :------- | :------- | :------------- | :----------------------------- |
| `password` | `string` | Yes      | Any            | New password generated by user |

> ⚠️ Note: the new password must abide the following requirements:
> - Must have at least one number.
> - Must have at least one uppercase letter.
> - Must have at least one lowercase letter.
> - Must have at least one special character.
> - Must be at least eight characters long.

- Example response from server

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

- Example response from server

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

Since this is a `GET` request all the parameter should be passed through the endpoint.

__Filter__

The `filter` parameter has to be an object with the following structure:

| Parameters   | Type     | Required | Allowed values | Description                                |
|--------------|----------|----------|----------------|--------------------------------------------|
| municipality | `string` | No       | Any            | Municipality in which the place is located |
| colony       | `string` | No       | Any            | Colony in which the place is located       |
| postal_code  | `string` | No       | Any            | Postal or zip code of the place's location |

__Items__

The `items` parameter has be a number with the value of the intented number of places to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can search by the `place_name`, `place_identifier`, `street`, `exterior_number` and `phone`.

```javascript
fetch(
    `.../places?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}`,
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

- Example response from server

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

- Example response from server

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

| Parameter      | Type     | Required | Allowed values | Description               |
| :------------- | :------- | :------- | :------------- | :------------------------ |
| `place_name`   | `string` | Yes      | Any            | Name of the new place     |
| `street`       | `string` | Yes      | Any            | Address street name       |
| `number`       | `string` | Yes      | Any            | Address number            |
| `colony`       | `string` | Yes      | Any            | Address colony name       |
| `municipality` | `string` | Yes      | Any            | Address municipality name |
| `postal_code`  | `string` | Yes      | Any            | Address postal code       |
| `phone`        | `string` | Yes      | Any            | Contat phone number       |
| `reference`    | `string` | No       | Any            | Address references        |

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

- Example response from server

```json
{
    "message": "Parque añadido",
}
```

#### Update a place

- Endpoint

```http
PATCH /places/:place_identifier
```

- Parameters

| Parameter      | Type     | Required | Allowed values | Description               |
| :------------- | :------- | :------- | :------------- | :------------------------ |
| `place_name`   | `string` | No       | Any            | Name of the new place     |
| `street`       | `string` | No       | Any            | Address street name       |
| `number`       | `string` | No       | Any            | Address number            |
| `colony`       | `string` | No       | Any            | Address colony name       |
| `municipality` | `string` | No       | Any            | Address municipality name |
| `postal_code`  | `string` | No       | Any            | Address postal code       |
| `phone`        | `string` | No       | Any            | Contat phone number       |
| `reference`    | `string` | No       | Any            | Address references        |

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

- Example response from server

```json
{
    "message": "Se actualizó la información del lugar"
}
```

#### Delete a place

- Endpoint

```http
DELETE /places/:place_identifier
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}`,
    {
        method: "DELETE",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "El lugar fue eliminado"
}
```

### Areas

> ⚠️ Note: this seccion is linked to _[Places seccion](#places)_. Both are part of _Places and Areas_ module.

#### Get all areas from several places

- Endpoint

```http
GET /places/areas/all
```

- Request

Since this is a `GET` request all the parameter should be passed through the endpoint.

> ⚠️ Note: The filters and searches where are for the places

__Filter__

The `filter` parameter has to be an object with the following structure:

| Parameters   | Type     | Required | Allowed values | Description                                |
|--------------|----------|----------|----------------|--------------------------------------------|
| municipality | `string` | No       | Any            | Municipality in which the place is located |
| colony       | `string` | No       | Any            | Colony in which the place is located       |
| postal_code  | `string` | No       | Any            | Postal or zip code of the place's location |

__Items__

The `items` parameter has be a number with the value of the intented number of places to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can search by the `place_name`, `place_identifier`, `street`, `exterior_number` and `phone`.

```javascript
fetch(
    `.../places/areas/all?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}`,
    {
        method: "GET",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "areas": [
        {
            "area_identifier": "01",
            "area_name": "Centro de Educación y Cultura Ambiental",
            "phone": "3313467900",
            "_id": "63f6d3e91975d0ea79de99df"
        },{
            "area_identifier": "02",
            "area_name": "Servicios generales",
            "phone": "3313467555",
            "_id": "63f6d3e91975d0ff66ht12vv"
        }
    ]
}
```

#### Get areas from a place

- Endpoint

```http
GET /places/:place_identifier/areas
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}/areas`,
    {
        method: "GET",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "areas": [
        {
            "area_identifier": "01",
            "area_name": "Centro de Educación y Cultura Ambiental",
            "phone": "3313467900",
            "_id": "63f6d3e91975d0ea79de99df"
        },{
            "area_identifier": "02",
            "area_name": "Servicios generales",
            "phone": "3313467555",
            "_id": "63f6d3e91975d0ff66ht12vv"
        }
    ]
}
```

#### Get an area

- Endpoint

```http
GET /places/:place_identifier/areas/:area_identifier
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}/areas/${area_identifier}`,
    {
        method: "GET",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "area": {
        "area_identifier": "01",
        "area_name": "Centro de Educación y Cultura Ambiental",
        "phone": "3313467900",
        "_id": "63f6d3e91975d0ea79de99df"
    }
}
```

#### Create an area

- Endpoint

```http
POST /places/:place_identifier
```

- Parameters

| Parameter   | Type     | Required | Allowed values | Description                      |
| :---------- | :------- | :------- | :------------- | :------------------------------- |
| `area_name` | `string` | Yes      | Allowed values | Name of the new area             |
| `phone`     | `string` | Yes      | Allowed values | Contact phone number of the area |

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

- Example response from server

```json
{
    "message": "Se añadió el area"
}
```

#### Update an area

- Endpoint

```http
PATCH /places/:place_identifier/areas/:area_identifier
```

- Parameters

| Parameter   | Type     | Required | Allowed values | Description                      |
| :---------- | :------- | :------- | :------------- | :------------------------------- |
| `area_name` | `string` | Yes      | Any            | Name of the new area             |
| `phone`     | `string` | Yes      | Any            | Contact phone number of the area |

> ⚠️ Note: only send the parameters that are going to be updated

- Request

```javascript
fetch(
    `.../places/${place_identifier}/areas/${area_identifier}`,
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

- Example response from server

```json
{
    "message": "El área fue modificado"
}
```

#### Delete an area

- Endpoint

```http
DELETE /places/:place_identifier/areas/:area_identifier
```

- Request

```javascript
fetch(
    `.../places/${place_identifier}/areas/${area_identifier}`,
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

- Example response from server

```json
{
    "message": "Se eliminó el área"
}
```

### Users

#### Get users

- Endpoint

```http
GET /users
```

- Request

Since this is a `GET` request all the parameter should be passed through the endpoint.

__Filter__

The `filter` parameter has to be an object with the following structure:
> ⚠️ Note: If the user who made the request is an `Encargado` the parameters `place` and `assigned_area` will be overwritten by the values found in the user's data and only will be able to retrieve users with the `Prestador` role. 

| Parameters    | Type     | Required | Allowed values                                              | Description                             |
|---------------|----------|----------|-------------------------------------------------------------|-----------------------------------------|
| place         | `string` | No       | Any                                                         | Place where the user was assigned       |
| assigned_area | `string` | No       | Any                                                         | Area where the user was assigned        |
| role          | `string` | No       | ['Administrador', 'Encargado', 'Prestador']                 | Role given to the user                  |
| period        | `string` | No       | ['A', 'B']                                                  | Period on which the user was registered |
| year          | `string` | No       | Any                                                         | Year on which the user was registered   |
| school        | `string` | No       | Any                                                         | School that the user attends            |
| status        | `string` | No       | ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']          | Current user status                     |
| provider_type | `string` |          | ['Servicio social', 'Practicas profesionales', 'No aplica'] | Type of user provider                   |

__Items__

The `items` parameter has be a number with the value of the intented number of users to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can search by the `name`, `register`, `email` and `phone`.

```javascript
fetch(
    `.../users?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "users": [
        {
            "_id": "63f8104c67a6f167aaa189df",
            "first_name": "Lucía",
            "first_last_name": "Granados",
            "second_last_name": "Figueroa",
            "age": "28",
            "email": "fatimagf@example.com",
            "phone": "3365899596",
            "avatar": "/protected/default.png",
            "emergency_contact": "Luisa Figueroa Medrano",
            "emergency_phone": "5145748544",
            "blood_type": "O-",
            "provider_type": "No aplica",
            "place": "Bosque Los Colomos",
            "assigned_area": "Centro de Educación y Cultura Ambiental",
            "status": "Activo",
            "school": "No aplica",
            "role": "Administrador",
            "createdAt": "2023-02-24T01:18:04.386Z",
            "updatedAt": "2023-02-24T01:18:04.386Z",
            "register": "GRFILU010145",
            "password": "$2b$10$cdjAQRHCsioXTKK9r4J02eARxl4WZTtmI1IW.AwNmmNJedysF92MC"
        },
        {
            "_id": "63f8092667a6f167aaa189cf",
            "first_name": "Fernanda",
            "first_last_name": "Martínez",
            "second_last_name": "Loza",
            "age": "19",
            "email": "fernandaml@example.com",The `filter` parameter has to be an object with the following structure:
            "phone": "3320478599",
            "avatar": "/protected/default.png",
            "emergency_contact": "Ámerica Loza Guiterréz",
            "emergency_phone": "5535697554",
            "blood_type": "A+",
            "provider_type": "Prácticas profesionales",
            "place": "Bosque Los Colomos",
            "assigned_area": "Centro de Educación y Cultura Ambiental",
            "status": "Activo",
            "school": "Centro Universitario de Ciencias Económico Administrativas",
            "role": "Prestador",
            "createdAt": "2023-02-24T00:47:34.333Z",
            "updatedAt": "2023-02-24T00:47:34.333Z",
            "register": "2023A0101002",
            "password": "$2b$10$LPk/.xewuMpOmNbNhARRZuheoZs4RaouYt0sosFvRmrCXyU9HKNXK"
        }
    ]
}
```

#### Get an user

- Endpoint

```http
GET /users/:register
```

- Request

```javascript
fetch(
    `.../users/${register}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "user": [
        {
            "_id": "63f8092667a6f167aaa189cf",
            "first_name": "Fernanda",
            "first_last_name": "Martínez",
            "second_last_name": "Loza",
            "age": "19",
            "email": "fernandaml@example.com",
            "phone": "3320478599",
            "avatar": "/protected/default.png",
            "emergency_contact": "Ámerica Loza Guiterréz",
            "emergency_phone": "5535697554",
            "blood_type": "A+",
            "provider_type": "Prácticas profesionales",
            "place": "Bosque Los Colomos",
            "assigned_area": "Centro de Educación y Cultura Ambiental",
            "status": "Activo",
            "school": "Centro Universitario de Ciencias Económico Administrativas",
            "role": "Prestador",
            "createdAt": "2023-02-24T00:47:34.333Z",
            "updatedAt": "2023-02-24T00:47:34.333Z",
            "register": "2023A0101002",
            "password": "$2b$10$LPk/.xewuMpOmNbNhARRZuheoZs4RaouYt0sosFvRmrCXyU9HKNXK"
        }
    ]
}
```

#### Create a user

- Endpoint

```http
POST /users
```

- Parameters

| Parameter           | Type     | Required | Allowed values                                              | Description                                           |
| :------------------ | :------- | :------- | :---------------------------------------------------------- | :---------------------------------------------------- |
| `curp`              | `string` | Yes      | Any                                                         | Curp of the user
| `first_name`        | `string` | Yes      | Any                                                         | First name of the user                                |
| `first_last_name`   | `string` | Yes      | Any                                                         | First second last name of the user (apellido paterno) |
| `age`               | `string` | Yes      | Any                                                         | Age of the user                                       |
| `email`             | `string` | Yes      | Any                                                         | Contact email of the user                             |
| `phone`             | `string` | Yes      | Any                                                         | Contact phone of the user                             |
| `emergency_contact` | `string` | Yes      | Any                                                         | Emergency contact of the user                         |
| `emergency_phone`   | `string` | Yes      | Any                                                         | Emergency phone of the user                           |
| `blood_type`        | `string` | Yes      | ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']          | Blood type of the user                                |
| `provider_type`     | `string` | Yes*     | ['Servicio social', 'Prácticas profesionales', 'No aplica'] | Type of user provider                                 |
| `place`             | `string` | Yes      | Any                                                         | Place where the user will be                          |
| `assigned_area`     | `string` | Yes      | Any                                                         | Area where the user will be assigned                  |
| `school`            | `string` | Yes*     | Any                                                         | School where the user is from                         |
| `role`              | `string` | Yes      | ['Administrador', 'Encargado', 'Prestador']                 | Role of the user                                      |
| `status`            | `string` | Yes      | ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']                                                         | Status of the user                                    |
| `total_hours`       | `number` | Yes*     | Any                                                         | Total of hours that the user need to complete         |
| `second_last_name`  | `string` | No       | Any                                                         | Second last name of the user (apellido materno)       |

> ⚠️ Note: some of the parameters are required if the role is _Prestador_.

- Request

```javascript
fetch(
    `.../users`,
    {
        method: "POST",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            first_name,
            first_last_name,
            age,
            email,
            phone,
            emergency_contact,
            emergency_phone,
            blood_type,
            provider_type,
            place,
            assigned_area,
            school,
            role,
            status,
            total_hours
        })
    }
)
```

- Example response from server

```json
{
    "message": "Usuario creado"
}
```

#### Update a user

- Endpoint

```http
PATCH /users/:register
```

- Parameters

| Parameter           | Type     | Required | Allowed values                                              | Description                                           |
| :------------------ | :------- | :------- | :---------------------------------------------------------- | :---------------------------------------------------- |
| `curp`              | `string` | No       | Any                                                         | Curp of the user
| `first_name`        | `string` | No       | Any                                                         | First name of the user                                |
| `first_last_name`   | `string` | No       | Any                                                         | First second last name of the user (apellido paterno) |
| `age`               | `string` | No       | Any                                                         | Age of the user                                       |
| `email`             | `string` | No       | Any                                                         | Contact email of the user                             |
| `phone`             | `string` | No       | Any                                                         | Contact phone of the user                             |
| `emergency_contact` | `string` | No       | Any                                                         | Emergency contact of the user                         |
| `emergency_phone`   | `string` | No       | Any                                                         | Emergency phone of the user                           |
| `blood_type`        | `string` | No       | ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']          | Blood type of the user                                |
| `provider_type`     | `string` | No       | ['Servicio social', 'Prácticas profesionales', 'No aplica'] | Type of user provider                                 |
| `place`             | `string` | No       | Any                                                         | Place where the user will be                          |
| `assigned_area`     | `string` | No       | Any                                                         | Area where the user will be assigned                  |
| `school`            | `string` | No       | Any                                                         | School where the user is from                         |
| `role`              | `string` | No       | ['Administrador', 'Encargado', 'Prestador']                 | Role of the user                                      |
| `status`            | `string` | No       | ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']                                                         | Status of the user                                    |
| `total_hours`       | `number` | No       | Any                                                         | Total of hours that the user need to complete         |
| `second_last_name`  | `string` | No       | Any                                                         | Second last name of the user (apellido materno)       |

- Request

```javascript
fetch(
    `.../users/${register}`,
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

- Example response from server

```json
{
    "message": "Se actualizó la información del usuario 2023A0101001"
}
```


#### Delete a user

- Endpoint

```http
DELETE /users/:register
```

> ⚠️ Note: by default, users cannot be deleted, this resource is available only if it is necessary to delete the user if an error occurs during its creation

- Request

```javascript
fetch(
    `.../users/${register}`,
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

- Example response from server

```json
{
    "message": "Usuario eliminado"
}
```


### Cards

The cards are going to be queried by the users. 

#### Get cards

- Endpoint

```http
GET /cards
```

- Request

Since this is a `GET` request all the parameter should be passed through the endpoint.

__Filter__

The `filter` parameter has to be an object with the following structure:
> ⚠️ Note: If the user who made the request is an `Encargado` the parameters `place` and `assigned_area` will be overwritten by the values found in the user's data and only will be able to retrieve users with the `Prestador` role. 

| Parameters    | Type     | Required | Allowed values                                              | Description                             |
|---------------|----------|----------|-------------------------------------------------------------|-----------------------------------------|
| place         | `string` | No       | Any                                                         | Place where the user was assigned       |
| assigned_area | `string` | No       | Any                                                         | Area where the user was assigned        |
| role          | `string` | No       | ['Administrador', 'Encargado', 'Prestador']                 | Role given to the user                  |
| period        | `string` | No       | ['A', 'B']                                                  | Period on which the user was registered |
| year          | `string` | No       | Any                                                         | Year on which the user was registered   |
| school        | `string` | No       | Any                                                         | School that the user attends            |
| status        | `string` | No       | ['Activo', 'Suspendido', 'Inactivo', 'Finalizado']          | Current user status                     |
| provider_type | `string` |          | ['Servicio social', 'Practicas profesionales', 'No aplica'] | Type of user provider                   |

__Items__

The `items` parameter has be a number with the value of the intented number of users to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can search by the `name`, `register`, `email` and `phone`.

```javascript
fetch(
    `.../cards?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "cards": [
        {
            "_id": "63fed926bc8f7b26b5695c4d",
            "provider_register": "2022B0101002",
            "total_hours": 450,
            "achieved_hours": 0,
            "activities": [],
            "createdAt": "2023-03-01T04:48:38.522Z",
            "updatedAt": "2023-03-01T04:48:38.522Z"
        },
        {
            "achieved_hours": 0,
            "_id": "63f6e2e553d63e0eecef5a2b",
            "provider_register": "2023A0101001",
            "activities": [
                {
                    "activity_name": "Campamento",
                    "hours": 15,
                    "assignation_date": "2023-02-23T03:54:13.957Z",
                    "responsible_register": "CRMAJU010104",
                    "_id": "63f6e3f7a9b1125440490faf"
                }
            ],
            "createdAt": "2023-02-23T03:52:05.005Z",
            "updatedAt": "2023-02-23T04:01:11.137Z",
            "total_hours": 450
        }
    ]
}
```

#### Get provider hours

- Endpoint

```http
GET /cards/:register
```

- Request

```javascript
fetch(
    `.../cards/${register}`,
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

- Example response from server

```json
{
    "message": "Tarjetón de usuario encontrado",
    "activities": [
        {
            "activity_name": "Cambio de nombre",
            "hours": 15,
            "assignation_date": "2023-02-23T03:54:13.957Z",
            "responsible_register": "123",
            "_id": "63f6e3f7a9b1125440490faf"
        }
    ]
}
```

#### Add an activity to a card

- Endpoint

```http
POST /card/:register
```

- Parameters

| Parameters           | Type     | Required | Allowed values | Description                          |
|----------------------|----------|----------|----------------|--------------------------------------|
| activity_name        | `string` | yes      | Any            | Name of the activity                 |
| hours                | `number` | yes      | Any            | Quantity of hours earned             |
| responsible_register | `string` | yes      | Any            | Responsible register of the activity |
| assignation_date     | `string` | no       | ISO Date       | Date of assignation                  |

- Request

```javascript
fetch(
    `.../cards/${register}`,
    {
        method: "POST",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Se añadieron las horas al prestador"
}
```

#### Update an activity from a card

- Endpoint

```http
PATCH /card/:register/activity
```

- Parameters

| Parameters           | Type     | Required | Allowed values | Description                          |
|----------------------|----------|----------|----------------|--------------------------------------|
| activity_name        | `string` | no       | Any            | Name of the activity                 |
| hours                | `number` | no       | Any            | Quantity of hours earned             |
| responsible_register | `string` | no       | Any            | Responsible register of the activity |
| assignation_date     | `string` | no       | ISO Date       | Date of assignation                  |
| _id                  | `string` | yes      | Any            | Identifier of a card                 |

- Request

```javascript
fetch(
    `.../cards/${register}/activity`,
    {
        method: "PATCH",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        },
        body: {
          _id: "641d15ffe0b0fa36997604d4"
        }
    }
)
```

- Example response from server

```json
{
    "message": "La información de la actividad se actualizó"
}
```

#### Delete an activity from a card

- Endpoint

```http
DELETE /card/:register/activity
```

- Parameters

| Parameters           | Type     | Required | Allowed values | Description                          |
|----------------------|----------|----------|----------------|--------------------------------------|
| _id                  | `string` | yes      | Any            | Identifier of a card                 |

- Request

```javascript
fetch(
    `.../cards/${register}/activity`,
    {
        method: "DELETE",
        headers: {
            `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`
            `Cache-Control`: `no-cache`
        },
        body: {
          _id: "641d15ffe0b0fa36997604d4"
        }
    }
)
```

- Example response from server

```json
{
    "message": "Se eliminaron las horas del prestador"
}
```

### Events

#### Get events

- Endpoint

``` http
GET /agenda
```

- Request

Since this is a `GET` request all the parameter should be passed through the endpoint.

__Filter__

The `filter` parameter has to be an object with the following structure:
> ⚠️ Note: If the user who made the request is an `Encargado` the parameters `place`, `belonging_place`, `belonging_area` will be overwritten by the values found in the user's data.

| Parameters     | Type     | Required | Allowed values | Description                                                |
|----------------|----------|----------|----------------|------------------------------------------------------------|
| place          | `string` | No       | Any            | Name of the place where the event is going to be performed |
| belonging_area | `string` | No       | Any            | Name of the area to which the event belongs                |
| belonging_place | `string` | No       | Any            | Name of the place to which the event belongs               |

__Items__

The `items` parameter has be a number with the value of the intented number of users to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can only search by the `name`.

```javascript
fetch(
    `.../agenda?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "events": [
        {
            "_id": "63f6f669d8d89fff2e230c2f",
            "is_template": false,
            "name": "Primer evento",
            "description": "Descripción de evento",
            "offered_hours": 15,
            "penalty_hours": 5,
            "vacancy": 5,
            "attendance": {
                "attendee_list": [
                    {
                        "attendee_register": "2023A0101001",
                        "status": "Inscrito",
                        "check_in": "2023-02-12T05:29:26.388Z",
                        "_id": "6400024ab380bc85215eae6f"
                    },
                    {
                        "attendee_register": "2022B0101002",
                        "status": "Retardo",
                        "check_in": "2023-02-12T05:29:26.388Z",
                        "_id": "6400075ff8bd8ff09ec33479"
                    }
                ],
                "status": "Disponible",
                "_id": "63f6f669d8d89fff2e230c2e"
            },
            "starting_date": "2023-02-11T02:49:29.492Z",
            "ending_date": "2023-02-11T02:49:29.492Z",
            "author_register": "123",
            "publishing_date": "2023-02-16T04:17:50.194Z",
            "place": "Bosque los colomos",
            "belonging_area": "centro de educacion y cultura ambiental",
            "belonging_place": "Bosque los colomos",
            "createdAt": "2023-02-23T05:15:21.989Z",
            "updatedAt": "2023-03-02T02:19:27.056Z",
            "event_identifier": "f669d8d89fff2e230c2f"
        }
    ]
}
```

#### Get an event

- Endpoint 

``` http
GET /agenda/:event_identifier
```

- Request

```javascript
fetch(
    `.../agenda/${event_identifier}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

- Example response from server

```json
{
    "message": "Listo",
    "event": {
        "_id": "63f6f669d8d89fff2e230c2f",
        "is_template": false,
        "name": "Primer evento",
        "description": "Descripción de evento",
        "offered_hours": 15,
        "penalty_hours": 5,
        "vacancy": 5,
        "attendance": {
            "attendee_list": [
                {
                    "attendee_register": "2023A0101001",
                    "status": "Inscrito",
                    "check_in": "2023-02-12T05:29:26.388Z",
                    "_id": "6400024ab380bc85215eae6f"
                },
                {
                    "attendee_register": "2022B0101002",
                    "status": "Retardo",
                    "check_in": "2023-02-12T05:29:26.388Z",
                    "_id": "6400075ff8bd8ff09ec33479"
                }
            ],
            "status": "Disponible",
            "_id": "63f6f669d8d89fff2e230c2e"
        },
        "starting_date": "2023-02-11T02:49:29.492Z",
        "ending_date": "2023-02-11T02:49:29.492Z",
        "author_register": "123",
        "publishing_date": "2023-02-16T04:17:50.194Z",
        "place": "Bosque los colomos",
        "belonging_area": "centro de educacion y cultura ambiental",
        "belonging_place": "Bosque los colomos",
        "createdAt": "2023-02-23T05:15:21.989Z",
        "updatedAt": "2023-03-02T02:19:27.056Z",
        "event_identifier": "f669d8d89fff2e230c2f"
    }
}
```

#### Create an event

- Endpoint 

```http
POST /agenda
```

- Request

| Parameters      | Type     | Required | Allowed values  | Description                                                                                          |
|-----------------|----------|----------|-----------------|------------------------------------------------------------------------------------------------------|
| name            | `string` | Yes      | Any             | Name of the event                                                                                    |
| description     | `string` | Yes      | Any             | Description of the event                                                                             |
| offered_hours   | `number` | Yes      | Any             | Amount of hours given to the service providers when the event finishes                               |
| tolerance       | `number` | Yes      | Any             | Amount of minutes of tolerance for the event |
| vacancy         | `number` | Yes      | Any             | Number of people required for the event                                                              |
| starting_date   | `string` | Yes      | ISO date string | The date and time on which the event should start                                                    |
| ending_date     | `string` | Yes      | ISO date string | The date and time on which the event should end                                                      |
| author_register | `string` | Yes      | User register   | The register of the user that created the event                                                      |
| publishing_date | `string` | Yes      | ISO date string | The date and time on which the event will be available to subscribe to for service providers         |
| place           | `string` | Yes      | Any             | The name of the place on which the event is going to be held on                                      |
| belonging_area  | `string` | Yes      | Any             | The name of the area by which the event was created                                                  |
| belonging_place | `string` | Yes      | Any             | The name of the place by which the event was created                                                 |

```javascript
fetch(
    `.../agenda`,
    {
        method: "POST",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            name,
            description,
            offered_hours,
            penalty_hours,
            vacancy,
            starting_date,
            ending_date,
            author_register,
            publishing_date,
            place,
            belonging_area,
            belonging_place
        })
    }
)
```

#### Update an event

- Endpoint 

```http
PATCH /agenda/:event_identifier
```

- Request

| Parameters      | Type     | Required | Allowed values  | Description                                                                                          |
|-----------------|----------|----------|-----------------|------------------------------------------------------------------------------------------------------|
| name            | `string` | No      | Any             | Name of the event                                                                                    |
| description     | `string` | No      | Any             | Description of the event                                                                             |
| offered_hours   | `number` | No      | Any             | Amount of hours given to the service providers when the event finishes                               |
| tolerance       | `number` | No      | Any             | Amount of minutes of tolerance for the event |
| vacancy         | `number` | No      | Any             | Number of people required for the event                                                              |
| starting_date   | `string` | No      | ISO date string | The date and time on which the event should start                                                    |
| ending_date     | `string` | No      | ISO date string | The date and time on which the event should end                                                      |
| author_register | `string` | No      | User register   | The register of the user that created the event                                                      |
| publishing_date | `string` | No      | ISO date string | The date and time on which the event will be available to subscribe to for service providers         |
| place           | `string` | No      | Any             | The name of the place on which the event is going to be held on                                      |
| belonging_area  | `string` | No      | Any             | The name of the area by which the event was created                                                  |
| belonging_place | `string` | No      | Any             | The name of the place by which the event was created                                                 |

```javascript
fetch(
    `.../agenda/${event_identifier}`,
    {
        method: "PATCH",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            name,
            description,
            offered_hours,
            penalty_hours,
            vacancy,
            starting_date,
            ending_date,
            author_register,
            publishing_date,
            place,
            belonging_area,
            belonging_place
        })
    }
)
```

#### Update event status

- Endpoint

```http
PATCH /agenda/:event_identifier/status
```

- Request

| Parameters        | Type     | Required | Allowed values              | Description                                          |
|-------------------|----------|----------|-----------------------------|------------------------------------------------------|
| status            | `string` | Yes      | ["Disponible", "Concluido"] | The current status of the event                      |
| modifier_register | `string` | Yes      | User register               | The register of the user that  will update the event |

```javascript
fetch(
    `.../agenda/${event_identifier}/status`,
    {
        method: "PATCH",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            status,
            modifier_register
        })
    }
)
```

#### Delete an event

- Endpoint

```http
DELETE /agenda/:event_identifier
```

- Request

```javascript
fetch(
    `.../agenda/${event_identifier}`,
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

### Forms

All endpoints have a boolean parameter `isTemplate` which is used to redirect if the logic of the request is going to be applied to the forms collection or the formtemplates collection. 

### Get forms

- Endpoint

``` http
GET /forms
```

- Request

Since this is a `GET` request all the parameter should be passed through the endpoint.

__Filter__

The `filter` parameter has to be an object with the following structure:
> ⚠️ Note: If the user who made the request is an `Encargado` the parameters `belonging_place` and `belonging_area` will be overwritten by the values found in the user's data.

| Parameters      | Type     | Required | Allowed values | Description                                                |
|-----------------|----------|----------|----------------|------------------------------------------------------------|
| author_register | `string` | No       | Any            | Register of the user who created the form                  |
| belonging_area  | `string` | No       | Any            | Name of the area to which the form belongs                 |
| belonging_place | `string` | No       | Any            | Name of the place to which the form belongs                |

__Items__

The `items` parameter has be a number with the value of the intented number of users to retrieve.

__Page__

The `page` parameter has to be a number with the value of the pagination one wants to access.

__Search__

The `search` parameter has to be a string with the query by which the results will be filtered. You can only search by the `name`.

```javascript
fetch(
    `.../forms?filter=${JSON.stringify(filter)}&items=${items}&page=${page}&search=${search}&isTemplate=${isTemplate}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

### Get a form

- Endpoint 

``` http
GET /forms/:form_identifier
```

- Request

```javascript
fetch(
    `.../forms/${form_identifier}?isTemplate=${isTemplate}`,
    {
        method: "GET",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        }
    }
)
```

### Create a form

- Endpoint 

```http
POST /forms
```

- Request

| Parameters                 | Type     | Required                   | Allowed values      | Description                                 |
|----------------------------|----------|----------------------------|---------------------|---------------------------------------------|
| name                       | `string` | Yes                        | Any                 | Name of the form                            |
| description                | `string` | Yes                        | Any                 | Description of the form                     |
| belonging_area             | `string` | Only for 'Administradores' | Any                 | Name of the area to which the form belongs  |
| belonging_place            | `string` | Only for 'Administradores' | Any                 | Name of the place to which the form belongs |
| belonging_event_identifier | `string` | Yes                        | Any                 | Event identifier to which the form belongs  |
| version                    | `number` | No                         | Any                 | Version number                              |
| questions                  | `array`  | Yes                        | An array of objects | The questions of the form                   |

The objects of the array `questions` should have the following structure

| Parameters    | Type     | Required | Allowed values                                                             | Description                                                    |
|---------------|----------|----------|----------------------------------------------------------------------------|----------------------------------------------------------------|
| interrogation | `string` | Yes      | Any                                                                        | The actual question to ask                                     |
| question_type | `string` | Yes      | ['Abierta', 'Numérica', 'Opción múltiple', 'Selección múltiple', 'Escala'] | The type of the question                                       |
| enum_options  | `array`  | No       | Any                                                                        | The response options in case the question type is no 'Abierta' |

```javascript
fetch(
    `.../forms`,
    {
        method: "POST",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            isTemplate
            name,
            description,
            belonging_area,
            belonging_place,
            version,
            belonging_event_identifier,
            questions
        })
    }
)
```

### Update a form

- Endpoint 

```http
POST /forms
```
Ideally when you update a form you should pass the whole object

- Request

| Parameters                 | Type     | Required                   | Allowed values      | Description                                 |
|----------------------------|----------|----------------------------|---------------------|---------------------------------------------|
| name                       | `string` | No                         | Any                 | Name of the form                            |
| description                | `string` | No                         | Any                 | Description of the form                     |
| belonging_area             | `string` | Only for 'Administradores' | Any                 | Name of the area to which the form belongs  |
| belonging_place            | `string` | Only for 'Administradores' | Any                 | Name of the place to which the form belongs |
| version                    | `number` | No                         | Any                 | Version number                              |
| questions                  | `array`  | Yes                        | An array of objects | The questions of the form                   |

The objects of the array `questions` should have the following structure

| Parameters    | Type     | Required | Allowed values                                                             | Description                                                    |
|---------------|----------|----------|----------------------------------------------------------------------------|----------------------------------------------------------------|
| interrogation | `string` | Yes      | Any                                                                        | The actual question to ask                                     |
| question_type | `string` | Yes      | ['Abierta', 'Numérica', 'Opción múltiple', 'Selección múltiple', 'Escala'] | The type of the question                                       |
| enum_options  | `array`  | No       | Any    users                                                                    | The response options in case the question type is no 'Abierta' |

```javascript
fetch(
    `.../forms`,
    {
        method: "PATCH",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body: JSON.stringtify({
            isTemplate,
            name,
            description,
            belonging_area,
            belonging_place,
            version,
            questions
        })
    }
)users
```

### Delete a form

- Endpoint

```http
DELETE /forms/:form_identifier
```

- Request

```javascript
fetch(
    `.../form/${form_identifier}`,
    {
        method: "DELETE",
        headers: {
          `Content-Type`: `application/json`,
            `Authorization`: `Bearer ${token}`,
            `Cache-Control`: `no-cache`
        },
        body:JSON.stringtify({isTemplate})
    }
)
```
