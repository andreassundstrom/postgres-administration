# SQL Dump

This chapter describes creating and restoring a database using the sql dump method.

## Create the data cluster and seed some data

Create the file `.env` from the `example.env` file and enter a password. Start the data cluster with `docker compose up -d`.
This initiates an empty cluster with a default database.

Create a sample table with some data:
```ps
docker exec -it -u postgres sql-dump-postgres-1 psql -f /var/lib/postgresql/seed-data.sql
```

## Create a sql-dump

Connect to the container with bash

```ps
docker exec -it -u postgres sql-dump-postgres-1 bash
```

Run `pg_dump postgres`. Pg_dump will display the script for creating the database at the given state, including table data. To store
the command to a file run `pg_dump postgres > /var/lib/postgresql/pg_dump_output/output.sql`. The folder is mounted to the local filesystem,
you can inspect the script more closely. 

## Restore the sql dump

Create a new database:
```bash
psql -c "create database postgres2"
```

Restore the sql dump script to the new database with:
```bash
psql postgres2 < /var/lib/postgresql/pg_dump_output/output.sql
```

This reads the file and directs it to psql. Verify the content of the sample table is restored to the new database:
```bash
psql postgres2 -c "SELECT * FROM employees"
```