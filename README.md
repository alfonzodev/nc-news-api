# Northcoders News API

An Express api for an articles website developed with Test Driven Development. 
<br><br>
**live version** - https://top-tier-articles.onrender.com/api

## Features

- Register users
- Login users
- View articles and comments
- Create new articles
- Comment on articles
- Delete comments
- Upvote/Downvote articles
- Upvote/Downvote comments


## Technologies Used

- NodeJS
- ExpressJS
- PostgreSQL

## Required Programs

- [NodeJS 18.15.0 LTS +](https://nodejs.org/en)<br>
- [PostgreSQL 15+](https://www.postgresql.org/download/)

## Installation Guide

- Clone this repository.
- Run **npm install** to install all dependencies;
- Create the .env files in your project root folder (see .env-example for reference):
  - **_.env.development_** - to contain a variable with dev database name and a variable with jwt token secret
  - **_.env.test_** - to contain a variable with test database name and a variable with jwt token secret
- Run **npm run setup-dbs** to create the databases
- Run **npm run seed** to seed the dev database

## Testing

- Run **npm test** (the seeding of the test database is done automatically when testing)

## Usage

- Run **npm start** to start the application.
- Connect to the API using your preferred API Client on port 9090 (Don't have an API client? Check [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/download)).

### Authentication

This api supports email and password authentication, and authorization with JWT's.

**Note:** If you want to test the login functionality with the existing dummy users data, the unhashed passwords are 'test123#' (e.g., email: 'tomtickle@email.com', password: 'test123#').

### API Endpoints

| HTTP Methods | Endpoints | Action                            |
| ------------ | --------- | --------------------------------- |
| GET          | /api      | Check all the available endpoints |
