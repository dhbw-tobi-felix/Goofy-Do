package com.goofy.api

import com.goofy.dto.CreateListRequest
import com.goofy.dto.UpdateListRequest
import com.goofy.dto.toResponse
import com.goofy.service.ListService
import jakarta.inject.Inject
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.net.URI

@Path("/lists")
@Tag(name = "Task List")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class ListResource @Inject constructor(
    private val service: ListService
) {
    @GET
    fun getAll(): Response = Response.ok(service.getAll().map { it.toResponse() }).build()

    @GET
    @Path("/{id}")
    fun getById(@PathParam("id") id: Long): Response = Response.ok(service.getById(id).toResponse()).build()

    @POST
    fun create(@Valid req: CreateListRequest): Response {
        val entity = service.create(req.name, req.description)
        return Response.created(URI.create("/lists/${entity.id}")).entity(entity.toResponse()).build()
    }

    @PATCH
    @Path("/{id}")
    fun update(@PathParam("id") id: Long, @Valid req: UpdateListRequest): Response {
        val entity = service.update(
            id = id, name = req.name, description = req.description,
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