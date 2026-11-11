package com.hostelsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HostelSyncApplication {
    public static void main(String[] args) {
        SpringApplication.run(HostelSyncApplication.class, args);
    }
}
