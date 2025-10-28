package com.goofy.repository

import com.goofy.domain.TaskEntity
import io.quarkus.hibernate.orm.panache.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class TaskRepository : PanacheRepository<TaskEntity> {
    fun findByIdWithOwner(id: Long, owner: String): TaskEntity? =
        find("id = ?1 and ownerId = ?2", id, owner).firstResult()

    fun listByOwner(owner: String): List<TaskEntity> =
        list("ownerId", owner)

    fun findByListIdWithOwner(listId: Long, owner: String): List<TaskEntity> =
        list("list.id = ?1 and ownerId = ?2", listId, owner)
}