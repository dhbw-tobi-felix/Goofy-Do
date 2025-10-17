package com.goofy.repository

import com.goofy.domain.ListEntity
import io.quarkus.hibernate.orm.panache.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class ListRepository : PanacheRepository<ListEntity>