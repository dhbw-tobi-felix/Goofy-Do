package com.goofy.api

import com.goofy.dto.toResponseNoListId
import com.goofy.service.TaskService
import io.quarkus.security.Authenticated
import io.quarkus.security.identity.SecurityIdentity
import jakarta.inject.Inject
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/lists/{listId}/tasks")
@Tag(name = "Task List")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
class ListTasksResource @Inject constructor(
    private val taskService: TaskService,
    private val identity: SecurityIdentity
) {
    @GET
    fun getTasksByList(@PathParam("listId") listId: Long): Response {
        val owner: String = identity.principal.name
        return Response.ok(taskService.getByListId(listId, owner).map { it.toResponseNoListId() }).build()
    }
}