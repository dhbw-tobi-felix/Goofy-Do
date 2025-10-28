package com.goofy.service

import com.goofy.domain.ListEntity
import com.goofy.repository.ListRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.persistence.PersistenceException
import jakarta.transaction.Transactional
import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.core.Response

@ApplicationScoped
class ListService @Inject constructor(
    private val repo: ListRepository
) {
    @Transactional(Transactional.TxType.SUPPORTS)
    fun getAll(owner: String): List<ListEntity> = repo.listByOwner(owner)

    @Transactional(Transactional.TxType.SUPPORTS)
    fun getById(id: Long, owner: String): ListEntity =
        repo.findByIdWithOwner(id, owner) ?: throw WebApplicationException("list not found", Response.Status.NOT_FOUND)

    @Transactional
    fun create(name: String, description: String?, owner: String): ListEntity {
        val entity =
            ListEntity().apply { this.name = name.trim(); this.description = description?.trim(); this.ownerId = owner }
        try {
            repo.persistAndFlush(entity)
            return entity
        } catch (_: PersistenceException) {
            throw WebApplicationException("list already exists", Response.Status.CONFLICT)
        }
    }

    @Transactional
    fun update(id: Long, name: String?, description: String?, owner: String): ListEntity {
        val entity = repo.findByIdWithOwner(id, owner) ?: throw WebApplicationException(
            "list not found",
            Response.Status.NOT_FOUND
        )

        name?.let { entity.name = it.trim() }
        description?.let { entity.description = it }

        try {
            repo.persistAndFlush(entity)
            return entity
        } catch (_: PersistenceException) {
            throw WebApplicationException("list already exists", Response.Status.CONFLICT)
        }
    }

    @Transactional
    fun delete(id: Long, owner: String) {
        val entity = repo.findByIdWithOwner(id, owner) ?: throw WebApplicationException(
            "list not found",
            Response.Status.NOT_FOUND
        )
        repo.delete(entity)
        repo.flush()
    }
}