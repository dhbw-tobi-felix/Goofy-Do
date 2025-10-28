package com.goofy.api

import com.goofy.dto.CreateTaskRequest
import com.goofy.dto.UpdateTaskRequest
import com.goofy.dto.toResponse
import com.goofy.service.TaskService
import io.quarkus.security.Authenticated
import io.quarkus.security.identity.SecurityIdentity
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
@Authenticated
class TaskResource @Inject constructor(
    private val service: TaskService,
    private val identity: SecurityIdentity
) {
    @GET
    fun getAll(): Response {
        val owner: String = identity.principal.name
        return Response.ok(service.getAll(owner).map { it.toResponse() }).build()
    }

    @GET
    @Path("/{id}")
    fun getById(@PathParam("id") id: Long): Response {
        val owner: String = identity.principal.name
        return Response.ok(service.getById(id, owner).toResponse()).build()
    }

    @POST
    fun create(@Valid req: CreateTaskRequest): Response {
        val owner: String = identity.principal.name
        val entity = service.create(
            name = req.name,
            description = req.description,
            dueDate = req.dueDate,
            completed = req.completed,
            listId = req.listId,
            owner = owner
        )
        return Response.created(URI.create("/tasks/${entity.id}")).entity(entity.toResponse()).build()
    }

    @PATCH
    @Path("/{id}")
    fun update(@PathParam("id") id: Long, @Valid req: UpdateTaskRequest): Response {
        val owner: String = identity.principal.name
        val entity = service.update(
            id = id, name = req.name,
            description = req.description,
            dueDate = req.dueDate,
            completed = req.completed,
            listId = req.listId,
            owner = owner
        )
        return Response.ok(entity.toResponse()).build()
    }

    @DELETE
    @Path("/{id}")
    fun delete(@PathParam("id") id: Long): Response {
        val owner: String = identity.principal.name
        service.delete(id, owner)
        return Response.noContent().build()
    }
}