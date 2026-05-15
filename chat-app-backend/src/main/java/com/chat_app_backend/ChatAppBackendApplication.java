package com.chat_app_backend;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;

@SpringBootApplication
public class ChatAppBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatAppBackendApplication.class, args);
    }

    @Bean
    public MongoClient mongoClient() {
        // Read directly from System environment to bypass property mapping issues
        String connectionString = System.getenv("SPRING_DATA_MONGODB_URI");

        // Fallback for local testing if env var isn't set
        if (connectionString == null) {
            connectionString = "mongodb://localhost:27017/boltchatdb";
        }

        return MongoClients.create(connectionString);
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        return new MongoTemplate(mongoClient, "boltchatdb");
    }
}