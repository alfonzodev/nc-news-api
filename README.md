# Northcoders News API

An Express api for an articles website developed with Test Driven Development.
<br><br>
**Live Version** - [https://top-tier-articles.onrender.com/api](https://top-tier-articles.onrender.com/api)

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

## Prerequisites

- [PostgreSQL 15+](https://www.postgresql.org/download/) installed on your local machine.
  - `psql` command-line tool should be accessible from your terminal.
- [NodeJS 18.15.0 LTS +](https://nodejs.org/en)<br>

## Setup

1. **Install PostgreSQL**:

   - Download and install PostgreSQL from the [official site](https://www.postgresql.org/download/).
   - Ensure the `psql` command-line tool is available in your system PATH.

2. **Setup the Database**:

   - Run the following command to set up your databases:
     ```bash
     npm run setup-dbs
     ```

3. **Create `.env` Files**:

   - In your project root folder, create the following files:
     - **`.env.development`**: Set `PGDATABASE` to `nc_news` and `JWT_TOKEN_SECRET` to your chosen secret.
     - **`.env.test`**: Set `PGDATABASE` to `nc_news_test` and `JWT_TOKEN_SECRET` to your chosen secret.

4. **Seed the Database**:

   - Seed your database with initial data:
     ```bash
     npm run seed
     ```

5. **Start the Application**:
   - Start the server:
     ```bash
     npm start
     ```

## Testing

- Run tests with:
  ```bash
  npm test
  ```
  (The seeding of the test database is done automatically when testing.)

## Usage

- Run the application with:

  ```bash
  npm start
  ```

- Connect to the API using your preferred API Client on port 9090 (Don't have an API client? Check [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/download)).

### Authentication

This api supports email and password authentication, and authorization with JWT's.

**Note:** For testing login functionality with the existing dummy user data, use the unhashed password 'test123#'. For example:

- Email: `tomtickle@email.com`
- Password: `test123#`

### API Endpoints

| HTTP Methods | Endpoints | Action                            |
| ------------ | --------- | --------------------------------- |
| GET          | /api      | Check all the available endpoints |
