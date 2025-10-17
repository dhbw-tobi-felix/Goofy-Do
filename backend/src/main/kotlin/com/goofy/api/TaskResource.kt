package com.goofy.api

import com.goofy.dto.CreateTaskRequest
import com.goofy.dto.UpdateTaskRequest
import com.goofy.dto.toResponse
import com.goofy.service.TaskService
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.net.URI

@Path("/tasks")
@Tag(name = "Task")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class TaskResource @Inject constructor(
    private val service: TaskService
) {
    @GET
    fun getAll(): Response = Response.ok(service.getAll().map { it.toResponse() }).build()

    @GET
    @Path("/{id}")
    fun getById(@PathParam("id") id: Long): Response = Response.ok(service.getById(id).toResponse()).build()

    @POST
    fun create(@Valid req: CreateTaskRequest): Response {
        val entity = service.create(
            name = req.name,
            description = req.description,
            dueDate = req.dueDate,
            completed = req.completed,
            listId = req.listId
        )
        return Response.created(URI.create("/tasks/${entity.id}")).entity(entity.toResponse()).build()
    }

    @PATCH
    @Path("/{id}")
    fun update(@PathParam("id") id: Long, @Valid req: UpdateTaskRequest): Response {
        val entity = service.update(
            id = id, name = req.name,
            description = req.description,
            dueDate = req.dueDate,
            completed = req.completed,
            listId = req.listId
        )
        return Response.ok(entity.toResponse()).build()
    }

    @DELETE
    @Path("/{id}")
    fun delete(@PathParam("id") id: Long): Response {
        service.delete(id)
        return Response.noContent().build()
    }
}