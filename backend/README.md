# Backend

## Dev Modus laufen

Live Coding mit Quarkus CLI:
```shell script
quarkus dev
```

oder mit Gradle
```shell script
./gradlew quarkusDev
```

## Swagger UI

Open <http://localhost:8080/swagger> \
Click `Authorize` -> SecurityScheme (OAuth2, authorization_code with PKCE) \
`client_id`: todo-swagger \
`client_secret`: \
`Scopes`: openid, profile

Click `Authorize`