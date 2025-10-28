package com.goofy.domain

import io.quarkus.hibernate.orm.panache.PanacheEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@Table(
    name = "todo_list",
    uniqueConstraints = [UniqueConstraint(columnNames = ["ownerId", "name"])]
)
class ListEntity : PanacheEntity() {
    @Column(nullable = false, length = 80)
    lateinit var name: String

    @Column(length = 250)
    var description: String? = null

    @Column(nullable = false)
    lateinit var ownerId: String
}