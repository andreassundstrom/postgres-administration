# Logstreaming in Postgres

This repo demonstrates how to set up log streaming in postgresql with docker compose. It is only a demonstration for learning the basics and should not be used in production.

## Set up your postgres clusters

The docker compose file contains two separate services called `primary` and `standby`. The `primary` is a postgres cluster with normal operation. The standby initialy starts a container with the sleep command. Beforehand copy the `example.env` file to a new file named `.env` and set a password.

Start the docker compose services:
```ps
docker compose up -d
```

During startup postgres will initiate a new cluster, we don't want this in the standby, since it will be created from a replication from the primary. 

## Create a user for the replicator in the primary container

Connect to the primary container:
```ps
docker exec -it postgres_primary psql -U postgres
```

This will open a psql prompt enabling you to run sql queries. Run the following command to create an account for the replica:
```sql
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '$om3$tr0ngPassw0rd';
```

Test the account by opening psql in the replica and connect to the primary container.

```sql
docker exec -it postgres_replica psql -U replicator  -h postgres_primary -d postgres
```

## Configure the primary container

The data catalog for both postgres clusters are mounted to the local filesystem. Open the configuration file [`postgresql.conf`](./data/primary/postgresql.conf).

Enable archiving and set an archive command:
```text
archive_mode = on
archive_command = 'test ! -f /mnt/server/archivedir/%f && cp %p /mnt/server/archivedir/%f'
```

Add an entry for the replicator in the [`pg_hba.conf`](data/primary/pg_hba.conf). You can find the IP-adress via `docker inspect postgres_standby -f "{{ .NetworkSettings.Networks.postgres_streaming.IPAddress }}"`.

```txt
# TYPE  DATABASE        USER            ADDRESS         METHOD
host    replication     replicator      172.18.0.2/32   trust
```

Finaly restart the primary:
```ps
docker compose restart primary
```

## Run a base backup on the standby

Connect to the standby with a shell:

```ps
docker exec -it -u postgres postgres_standby bash
```

Run a basebackup from the primary to the standby:
```bash
pg_basebackup -h postgres_primary -U replicator -p 5432 -D $PGDATA -P -Xs -R
```

The command `-R` adds a configuration for replication. The next time the container starts it will start log-streaming from the primary.

Finally stop the standby container with `docker compose down standby`, remove the sleep command in [docker-compose.yml](docker-compose.yml) in order to just start the postgres process:
```yml
  standby:
    image: postgres:16.4
    container_name: postgres_standby
    env_file:
      - .env
    volumes:
      - ./data/standby:/var/lib/postgresql/data
    # command: sleep 12h
```

Then start the service again with `docker compose up -d standby`. Since the data directory now contains a cluster and we created it with the `-R` flag, the standby will start log streaming from the primary instead of acting as an independant cluster.

## Verify the replication

Connect to the primary:
```ps
docker exec -it -u postgres postgres_primary psql
```

And the standby in another terminal:
```ps
docker exec -it -u postgres postgres_standby psql
```

In the primary create a table and add some data:
```sql
CREATE TABLE people(
    id SERIAL PRIMARY KEY,
    first_name varchar(200),
    last_name varchar(200)
);

INSERT INTO people (first_name,last_name) VALUES ('Andreas','Sundström');
```

Then in the standby verify the data is replicated:
```sql
SELECT * FROM people;
```

If successful the content of the table on the primary should be mirrored to the standby.