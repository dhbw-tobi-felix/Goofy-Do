CREATE SEQUENCE IF NOT EXISTS task_seq START WITH 1 INCREMENT BY 50;

CREATE SEQUENCE IF NOT EXISTS todo_list_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE task
(
    id      BIGINT       NOT NULL,
    name    VARCHAR(80)  NOT NULL,
    description VARCHAR(250),
    dueDate     TIMESTAMP WITHOUT TIME ZONE,
    completed   BOOLEAN,
    list_id BIGINT       NOT NULL,
    ownerId VARCHAR(255) NOT NULL,
    CONSTRAINT pk_task PRIMARY KEY (id)
);

CREATE TABLE todo_list
(
    id      BIGINT       NOT NULL,
    name    VARCHAR(80)  NOT NULL,
    description VARCHAR(250),
    ownerId VARCHAR(255) NOT NULL,
    CONSTRAINT pk_todo_list PRIMARY KEY (id)
);

ALTER TABLE todo_list
    ADD CONSTRAINT uc_10db163bfe27e8a1cba69caa5 UNIQUE (ownerId, name);

ALTER TABLE task
    ADD CONSTRAINT uc_1a5299c56a8399c3f3ca3fe2e UNIQUE (list_id, name);

ALTER TABLE task
    ADD CONSTRAINT FK_TASK_ON_LIST FOREIGN KEY (list_id) REFERENCES todo_list (id);

CREATE INDEX ix_task_list ON task (list_id);