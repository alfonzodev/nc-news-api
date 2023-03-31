# Northcoders News API

### Intro

An Express api for an articles website developed with TDD.
<br><br>
**live version** - https://top-tier-articles.onrender.com/api

### Features

- View articles and comments
- Comment on articles
- Delete comments
- Upvote/Downvote articles and comments
- Create new articles (to be implemented)

### Technologies Used

- NodeJS
- ExpressJS
- PostgreSQL

### Required Programs

- [NodeJS 18.15.0 LTS +](https://nodejs.org/en)<br>
- [PostgreSQL 15+](https://www.postgresql.org/download/)

### Installation Guide

- Clone this repository.
- Run **npm install** to install all dependencies;
- Create the .env files in your project root folder (see .env-example for reference):
  - **_.env.development_** - to contain variable with dev database name
  - **_.env.test_** - to contain variable with test database name
- Run **npm setup-dbs** to create the databases
- Run **npm seed** to seed the dev database

### Testing

- Run **npm test** (the seeding of the test database is done automatically when testing)

### Usage

- Run **npm start** to start the application.
- Connect to the API using your preferred API Client on port 9090 (Don't have an API client? Check [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/download)).

### API Endpoints

| HTTP Methods | Endpoints | Action                            |
| ------------ | --------- | --------------------------------- |
| GET          | /api      | Check all the available endpoints |
