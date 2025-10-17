package com.goofy.api

import com.goofy.dto.toResponseNoListId
import com.goofy.service.TaskService
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
class ListTasksResource @Inject constructor(
    private val taskService: TaskService
) {
    @GET
    fun getTasksByList(@PathParam("listId") listId: Long): Response =
        Response.ok(taskService.getByListId(listId).map { it.toResponseNoListId() }).build()
}