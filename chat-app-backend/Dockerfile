FROM eclipse-temurin:26-jdk AS build
WORKDIR /app

# Copy Maven wrapper files
COPY mvnw ./
COPY .mvn/ .mvn/
RUN chmod +x mvnw

# Build dependencies
COPY pom.xml ./
RUN ./mvnw dependency:go-offline

# Build the JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:26-jre
WORKDIR /app
COPY --from=build /app/target/chat-app-backend-0.0.1-SNAPSHOT.jar chat-app-backend-0.0.1-SNAPSHOT.jar

EXPOSE 8080

# Added memory limits for Render Free Tier stability
ENTRYPOINT ["java", "-jar", "/app/chat-app-backend-0.0.1-SNAPSHOT.jar"]