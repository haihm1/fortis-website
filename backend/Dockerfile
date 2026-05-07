# Multi-stage build: Spring Boot 4 + Java 21 (Render / Docker)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

COPY src ./src
RUN ./mvnw -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

COPY --from=builder /app/target/fortis-website-api-0.0.1-SNAPSHOT.jar app.jar

USER app

# Render sets PORT at runtime; local fallback keeps dev parity with application.yml
EXPOSE 9090
ENV PORT=9090

CMD ["sh", "-c", "exec java -jar /app/app.jar --server.port=${PORT}"]
