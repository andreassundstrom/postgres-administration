DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(200),
    last_name VARCHAR(200)
);

INSERT INTO employees(first_name,last_name) VALUES 
    ('John', 'Doe'),
    ('Jane', 'Doe'),
    ('Eric','Anderson');