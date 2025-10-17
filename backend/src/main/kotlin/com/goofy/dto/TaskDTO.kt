package com.goofy.dto

import com.goofy.domain.TaskEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class CreateTaskRequest(
    @field:NotBlank
    @field:Size(max = 80)
    var name: String,

    @field:Size(max = 250)
    var description: String? = null,

    var dueDate: LocalDateTime? = null,

    @field:NotNull
    var completed: Boolean = false,

    @field:NotNull
    var listId: Long,
)

data class UpdateTaskRequest(
    val name: String? = null,
    val description: String? = null,
    val dueDate: LocalDateTime? = null,
    val completed: Boolean? = null,
    val listId: Long? = null
)

data class TaskResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val dueDate: LocalDateTime?,
    val completed: Boolean,
    val listId: Long,
)

data class TaskResponseNoListId(
    val id: Long,
    val name: String,
    val description: String?,
    val dueDate: LocalDateTime?,
    val completed: Boolean,
)

fun TaskEntity.toResponse() = TaskResponse(
    id = id,
    name = name,
    description = description,
    dueDate = dueDate,
    completed = completed,
    listId = list.id
)

fun TaskEntity.toResponseNoListId() =
    TaskResponseNoListId(id = id, name = name, description = description, dueDate = dueDate, completed = completed)