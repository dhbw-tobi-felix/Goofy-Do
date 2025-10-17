package com.goofy.service

import com.goofy.domain.TaskEntity
import com.goofy.repository.ListRepository
import com.goofy.repository.TaskRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.persistence.PersistenceException
import jakarta.transaction.Transactional
import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.core.Response
import java.time.LocalDateTime

@ApplicationScoped
class TaskService @Inject constructor(
    private val repo: TaskRepository,
    private val listRepo: ListRepository,
) {
    @Transactional(Transactional.TxType.SUPPORTS)
    fun getAll(): List<TaskEntity> = repo.findAll().list()

    @Transactional(Transactional.TxType.SUPPORTS)
    fun getById(id: Long): TaskEntity =
        repo.findById(id) ?: throw WebApplicationException("task with id $id not found", Response.Status.NOT_FOUND)

    @Transactional(Transactional.TxType.SUPPORTS)
    fun getByListId(listId: Long): List<TaskEntity> = repo.findByListId(listId)

    @Transactional
    fun create(
        name: String,
        description: String?,
        dueDate: LocalDateTime?,
        completed: Boolean,
        listId: Long
    ): TaskEntity {
        val listEntity = listRepo.findById(listId) ?: throw WebApplicationException(
            "list with id $listId not found",
            Response.Status.NOT_FOUND
        )
        val entity = TaskEntity().apply {
            this.name = name.trim(); this.description = description?.trim(); this.dueDate = dueDate; this.completed =
            completed; this.list = listEntity
        }
        try {
            repo.persistAndFlush(entity)
            return entity
        } catch (_: PersistenceException) {
            throw WebApplicationException("task already exists", Response.Status.CONFLICT)
        }
    }

    @Transactional
    fun update(
        id: Long,
        name: String?,
        description: String?,
        dueDate: LocalDateTime?,
        completed: Boolean?,
        listId: Long?
    ): TaskEntity {
        val entity = repo.findById(id) ?: throw WebApplicationException("task not found", Response.Status.NOT_FOUND)

        name?.let { entity.name = it.trim() }
        description?.let { entity.description = it }
        dueDate?.let { entity.dueDate = it }
        completed?.let { entity.completed = it }
        listId?.let {
            entity.list = listRepo.findById(it) ?: throw WebApplicationException(
                "list with id $it not found",
                Response.Status.NOT_FOUND
            )
        }

        try {
            repo.persistAndFlush(entity)
            return entity
        } catch (_: PersistenceException) {
            throw WebApplicationException("task already exists", Response.Status.CONFLICT)
        }
    }

    @Transactional
    fun delete(id: Long) {
        val entity = repo.findById(id) ?: throw WebApplicationException("task not found", Response.Status.NOT_FOUND)
        repo.delete(entity)
        repo.flush()
    }
}