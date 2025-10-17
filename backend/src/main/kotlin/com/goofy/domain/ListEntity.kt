package com.goofy.domain

import io.quarkus.hibernate.orm.panache.PanacheEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "todo_list")
class ListEntity : PanacheEntity() {
    @Column(nullable = false, unique = true, length = 80)
    lateinit var name: String

    @Column(length = 250)
    var description: String? = null
}