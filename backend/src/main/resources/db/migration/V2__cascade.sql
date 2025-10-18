/* Bestehenden Constraint droppen */
ALTER TABLE task DROP CONSTRAINT FK_TASK_ON_LIST;

/* Neuen Constraint mit CASCADE anlegen */
ALTER TABLE task
    ADD CONSTRAINT FK_TASK_ON_LIST
        FOREIGN KEY (list_id)
            REFERENCES todo_list (id)
            ON DELETE CASCADE;