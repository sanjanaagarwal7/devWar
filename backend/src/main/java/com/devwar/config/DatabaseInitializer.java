package com.devwar.config;

import com.devwar.models.Challenge;
import com.devwar.models.User;
import com.devwar.repositories.ChallengeRepository;
import com.devwar.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, ChallengeRepository challengeRepository,
            PasswordEncoder encoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User u1 = new User();
                u1.setUsername("player1");
                u1.setEmail("p1@devwar.com");
                u1.setPassword(encoder.encode("password"));
                u1.setWins(10);
                u1.setLosses(2);
                u1.setRating(1250);
                userRepository.save(u1);

                User u2 = new User();
                u2.setUsername("player2");
                u2.setEmail("p2@devwar.com");
                u2.setPassword(encoder.encode("password"));
                u2.setWins(5);
                u2.setLosses(5);
                u2.setRating(1100);
                userRepository.save(u2);

                System.out.println("Mock Users initialized.");
            }

            if (challengeRepository.count() == 0) {
                Challenge c1 = new Challenge();
                c1.setTitle("React Counter");
                c1.setDescription(
                        "Build a React component that increments a counter on a button click. The button should have the id 'increment' and the count text should have the id 'count'.");
                c1.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                c1.setExpectedOutput("id='count'>1<");
                c1.setDifficulty("Easy");
                c1.setLanguage("React");
                challengeRepository.save(c1);

                Challenge c2 = new Challenge();
                c2.setTitle("Spring Boot Hello World API");
                c2.setDescription("Create a REST API mapping /api/hello returning 'Hello World'.");
                c2.setStarterCode("@RestController\npublic class HelloController {\n    // Code here\n}");
                c2.setExpectedOutput("Hello World");
                c2.setDifficulty("Easy");
                c2.setLanguage("Spring Boot");
                challengeRepository.save(c2);

                System.out.println("Mock Challenges initialized.");
            }
        };
    }
}
