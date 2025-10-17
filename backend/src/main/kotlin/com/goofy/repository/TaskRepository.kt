package com.goofy.repository

import com.goofy.domain.TaskEntity
import io.quarkus.hibernate.orm.panache.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class TaskRepository : PanacheRepository<TaskEntity> {
    fun findByListId(listId: Long): List<TaskEntity> =
        list("list.id", listId)
}