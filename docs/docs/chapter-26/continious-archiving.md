# Continious archiving

This lesson describes continious archiving. 

## Start the cluster

Create a file called `.env` using the `example.env` as a template. Run `docker compose up -d` to start the data cluster. The directory `data/` is created and populated with files from the postgresql service.

## Configure the cluster for continious archiving

Open the file `data/primary/postgresql.conf`. Find the parameter for wal_level. This is by default set to `replica` which ensures that the wal files  include enough information for restoring the database.

Next find the parameter named `archive_mode`, remove the `#` comment mark so it's active and set the value to on. Set the `archive_command` to the example value included in the config file:

```txt
archive_mode = on
archive_command = 'test ! -f /mnt/server/archivedir/%f && cp %p /mnt/server/archivedir/%f'
```

This is a simple shell command that copies the wal-file to a directory, given it not already exists.

For the configuration change to take place, the postgres service needs to be restarted. Notice that the mounted
directory `archivedir/` does not contain any log files. Run `docker compose restart`.

Connect to the postgres cluster and run `pg_switch_wal()`:

```ps
docker exec -it -u postgres continious-archiving-postgres-1 psql -c "SELECT pg_switch_wal();"
```

This forces a switch of the WAL-file, the folder `archivedir/` should now include a file.

## Perform a Base Backup

With archiving in place, a base backup can be created using the `pg_basebackup` utility. Connect with bash
and run the pg_basebackup command:

```ps
docker exec -u postgres -it continious-archiving-postgres-1 bash
```
```bash
pg_basebackup -D /mnt/server/backups/$(date +%Y%m%dT%H%M%S%NZ)
```

A folder will be created in the backups directory with the current timestamp.

## Seed the database with test data

Run the following command to create some test data:
```ps
docker exec -u postgres -it continious-archiving-postgres-1 psql -f /var/lib/postgresql/seed-data.sql
```

Verify that the data was created:
```ps
docker exec -u postgres -it continious-archiving-postgres-1 psql -c "SELECT * FROM employees"
```

## Restore the base backup

Stop the docker compose service with `docker compose down` and then delete the directory `data/` from your local
filesystem. Add a command argument in the docker compose file to start the postgres container without the actual
postgres service:

```yml
services:
  postgres:
    ...
    command: sleep 60000
    ...
```

Run `docker compose up -d` and then attach to the container with bash:

```ps
docker exec -u postgres -it continious-archiving-postgres-1 bash
```

Copy the files back to the data directory (replace the timestamp with your actual timestamp for backup):
```bash
cp -r /mnt/server/backups/20240916T192824779865421Z/* /var/lib/postgresql/data
```

The base backup is now restored. Start the server by removing the sleep command and restarting docker compose
with `docker compose up -d`.