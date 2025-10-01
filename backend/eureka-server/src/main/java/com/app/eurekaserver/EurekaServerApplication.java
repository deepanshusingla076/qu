package com.app.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    // Main entry point for Eureka Service Discovery Server
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}