package com.goofy.domain

import io.quarkus.hibernate.orm.panache.PanacheEntity
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "task",
    uniqueConstraints = [UniqueConstraint(columnNames = ["list_id", "name"])],
    indexes = [Index(name = "ix_task_list", columnList = "list_id")]
)
class TaskEntity : PanacheEntity() {
    @Column(nullable = false, length = 80)
    lateinit var name: String

    @Column(length = 250)
    var description: String? = null

    @Column
    var dueDate: LocalDateTime? = null

    @Column
    var completed: Boolean = false

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "list_id", nullable = false)
    lateinit var list: ListEntity

    @Column(nullable = false)
    lateinit var ownerId: String
}

