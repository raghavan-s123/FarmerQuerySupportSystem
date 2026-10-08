package com.krishimitra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the AI-Based Farmer Advisory System backend.
 * Run this (or `mvn spring-boot:run`) to start the REST API on port 8080.
 */
@SpringBootApplication
public class KrishimitraApplication {
    public static void main(String[] args) {
        SpringApplication.run(KrishimitraApplication.class, args);
        System.out.println("Backend REST API started on http://localhost:8080");
    }
}
