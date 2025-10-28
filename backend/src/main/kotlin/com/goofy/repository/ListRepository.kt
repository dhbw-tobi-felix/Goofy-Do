package com.goofy.repository

import com.goofy.domain.ListEntity
import io.quarkus.hibernate.orm.panache.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class ListRepository : PanacheRepository<ListEntity> {
    fun findByIdWithOwner(id: Long, owner: String): ListEntity? =
        find("id = ?1 and ownerId = ?2", id, owner).firstResult()

    fun listByOwner(owner: String): List<ListEntity> =
        list("ownerId", owner)
}