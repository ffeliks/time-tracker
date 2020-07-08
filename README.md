## Prerequisites
* [Node](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)

## Installation
```bash
> git clone https://github.com/ffeliks/time-tracker
> cd time-tracker/
> yarn install
```

## Running the app
```bash
# development mode
> yarn run start
```

The application will then be available on http://localhost:3000

## API Endpoints
 * [POST /auth/signup](#signup)
 * [POST /auth/signin](#signin)
 * [GET /timer/list](#timer-list)
 * [POST /timer/start](#timer-start)
 * [POST /timer/stop](#timer-stop)
 * [PUT /timer/update/:id](#timer-entry-update)

## Signup
* Authentication: none
* Example request:
```bash
# POST /auth/signup

{
    "email": "john.doe@example.com",
    "password": "secret"
}
```
* Response: HTTP status code 201

## Signin
* Authentication: none
* Example request:
```bash
# POST /auth/signin

{
    "email": "john.doe@example.com",
    "password": "secret"
}
```
* Example response:
```bash
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU5NDIzNTMwMywiZXhwIjoxNTk0MjM4OTAzfQ.nbDcUwG38u94p9uUlC01mTT1LUvTNL5LFFFFyjLUBkk"
}
```
## Timer list
* Authentication: Bearer token
* Example request:
```bash
GET /timer/list
```
* Example response:
```bash

[
    {
        "id": 1,
        "title": "Working on task X",
        "startTime": "2020-07-08T19:00:00",
        "endTime": "2020-07-08T20:00:00",
        "duration": 3600
    }
]
```
## Timer start
* Authentication: Bearer token
* Example request:
```bash
POST /timer/start
```
* Response: HTTP status code 201

## Timer stop
* Authentication: Bearer token
* Example request:
```bash
POST /timer/stop
```
* Response: HTTP status code 202
## Timer entry update
* Authentication: Bearer token
* Example request:
```bash
# PUT /timer/update/1

{
    "title": "New title",
    "startTime": "2020-07-07 09:30",
    "endTime": "2020-07-07 10:30"
}
```
* Response: HTTP status code 200