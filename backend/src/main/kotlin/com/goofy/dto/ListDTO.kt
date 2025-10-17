package com.goofy.dto

import com.goofy.domain.ListEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateListRequest(
    @field:NotBlank @field:Size(max = 80) val name: String,

    @field:Size(max = 250) val description: String? = null,
)

data class UpdateListRequest(
    val name: String? = null,
    val description: String? = null,
)

data class ListResponse(
    val id: Long,
    val name: String,
    val description: String?,
)

fun ListEntity.toResponse() = ListResponse(id = id, name = name, description = description)