# Northcoders News API

An Express api for a news-like website.

## Database

The database is PSQL and managed using node-postgres.

## Setup

There are two databases, a development one with more realistic data and another with simpler data for testing purposes. To be able to connect to these locally, you must do the following:

    - Create a ".env.development" in the root folder and inside it include the environment variable "PGDATABASE=nc_news"
    - Create a ".env.test" in the root folder and inside it include the environment variable "PGDATABASE=nc_news_test"
