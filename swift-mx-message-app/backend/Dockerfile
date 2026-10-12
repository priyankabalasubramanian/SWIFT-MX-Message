# Build stage: Build Spring Boot 3.3.4 backend using Maven and Eclipse Temurin Java 21
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven descriptor and source code
COPY pom.xml .
COPY src ./src

# Package application into an executable JAR (skip tests for container build)
RUN mvn clean package -DskipTests

# Runtime stage: Eclipse Temurin Java 21 runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Ensure directory exists for embedded H2 database persistence
RUN mkdir -p /app/data

# Copy packaged JAR from build stage
COPY --from=build /app/target/swift-mx-backend-*.jar app.jar

# Render environment defaults
# For persistent production on Render: attach a Render PostgreSQL database (DATABASE_URL)
# or set SPRING_PROFILES_ACTIVE=postgres with DB_HOST/DB_USERNAME/DB_PASSWORD.
# Falls back to h2 for zero-config standalone container runs.
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2

# Expose default port
EXPOSE 8080

# Launch application listening on Render's dynamic PORT variable
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
