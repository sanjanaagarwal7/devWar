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
                // ===== REACT TRACK =====
                Challenge r1 = new Challenge();
                r1.setTitle("React Counter");
                r1.setDescription(
                        "Build a simple counter app.\n\n1. Display a number starting at 0 inside an element with id=\"count\"\n2. Add a button with id=\"increment\" that increases the count by 1 each click\n\nClick the Increment button once, then hit Submit.");
                r1.setHint("Use useState to track the count. Display it and wire up a button to increment it.");
                r1.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                r1.setExpectedOutput("id=\"count\">1<");
                r1.setDifficulty("Easy");
                r1.setLanguage("React");
                challengeRepository.save(r1);

                Challenge r2 = new Challenge();
                r2.setTitle("Toggle Visibility");
                r2.setDescription(
                        "Build a component with a toggle button.\n\n1. Add a button with id=\"toggle\" that shows/hides a message\n2. When visible, render a <p> with id=\"message\" containing the text \"Hello DevWar!\"\n3. The message should start hidden and appear after one click\n\nClick the toggle button once, then submit.");
                r2.setHint("Use a boolean state to conditionally render the message paragraph.");
                r2.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                r2.setExpectedOutput("id=\"message\">Hello DevWar!</p>");
                r2.setDifficulty("Easy");
                r2.setLanguage("React");
                challengeRepository.save(r2);

                Challenge r3 = new Challenge();
                r3.setTitle("Todo List");
                r3.setDescription(
                        "Build a simple todo list.\n\n1. Add an <input> with id=\"todo-input\" for typing a task\n2. Add a button with id=\"add-btn\" that adds the input text to a list\n3. Render the list items inside a <ul> with id=\"todo-list\"\n\nType \"Learn React\" in the input, click Add, then submit.");
                r3.setHint("Capture input value on change, push it into the array on button click, and map the array to <li> elements.");
                r3.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  const [todos, setTodos] = useState([]);\n  const [input, setInput] = useState('');\n\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                r3.setExpectedOutput("Learn React</li>");
                r3.setDifficulty("Medium");
                r3.setLanguage("React");
                challengeRepository.save(r3);

                Challenge r4 = new Challenge();
                r4.setTitle("Color Picker");
                r4.setDescription(
                        "Build a color picker that changes background color.\n\n1. Create three buttons: one for Red, Green, and Blue\n2. Wrap the buttons in a <div> with id=\"color-box\" whose background color changes on click\n3. Each button should set the background to its color\n\nClick the Red button, then submit.");
                r4.setHint("Use inline style={{ backgroundColor: color }} on the wrapper div and update state on each button click.");
                r4.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  const [color, setColor] = useState('white');\n\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                r4.setExpectedOutput("background-color: red");
                r4.setDifficulty("Easy");
                r4.setLanguage("React");
                challengeRepository.save(r4);

                Challenge r5 = new Challenge();
                r5.setTitle("Character Counter");
                r5.setDescription(
                        "Build a live character counter.\n\n1. Add a <textarea> with id=\"text-area\"\n2. Below it, show the character count in a <span> with id=\"char-count\"\n3. The count should update as the user types\n\nType exactly \"hello\" in the textarea, then submit.");
                r5.setHint("Track the textarea value in state and display its .length in the span.");
                r5.setStarterCode(
                        "import React, { useState } from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      {/* Your code here */}\n    </div>\n  );\n}");
                r5.setExpectedOutput("id=\"char-count\">5</span>");
                r5.setDifficulty("Medium");
                r5.setLanguage("React");
                challengeRepository.save(r5);

                // ===== SPRING BOOT TRACK =====
                Challenge s1 = new Challenge();
                s1.setTitle("Hello World API");
                s1.setDescription(
                        "Create a REST controller that responds to GET /api/hello with the text \"Hello World\".\n\nUse @RestController and @GetMapping annotations.");
                s1.setHint("Use @GetMapping with the correct path and return a plain string from the method.");
                s1.setStarterCode("@RestController\npublic class HelloController {\n    // Code here\n}");
                s1.setExpectedOutput("Hello World");
                s1.setDifficulty("Easy");
                s1.setLanguage("Spring Boot");
                challengeRepository.save(s1);

                Challenge s2 = new Challenge();
                s2.setTitle("Path Variable Greeting");
                s2.setDescription(
                        "Create an endpoint GET /api/greet/{name} that returns \"Hello, {name}!\".\n\nFor example, /api/greet/John should return \"Hello, John!\".");
                s2.setHint("Annotate the method parameter with @PathVariable and concatenate it into the response string.");
                s2.setStarterCode("@RestController\n@RequestMapping(\"/api\")\npublic class GreetController {\n    // Code here\n}");
                s2.setExpectedOutput("Hello, {name}!");
                s2.setDifficulty("Easy");
                s2.setLanguage("Spring Boot");
                challengeRepository.save(s2);

                Challenge s3 = new Challenge();
                s3.setTitle("Request Body Echo");
                s3.setDescription(
                        "Create a POST endpoint /api/echo that accepts a JSON body with a \"message\" field and returns it back.\n\nExample: POST {\"message\": \"hi\"} should return {\"message\": \"hi\"}.");
                s3.setHint("Accept the request body as a Map<String, String> and return it directly.");
                s3.setStarterCode("@RestController\npublic class EchoController {\n    // Code here\n}");
                s3.setExpectedOutput("{\"message\":\"hi\"}");
                s3.setDifficulty("Medium");
                s3.setLanguage("Spring Boot");
                challengeRepository.save(s3);

                Challenge s4 = new Challenge();
                s4.setTitle("Query Parameter Sum");
                s4.setDescription(
                        "Create a GET endpoint /api/sum that accepts two query parameters 'a' and 'b' and returns their sum.\n\nExample: /api/sum?a=3&b=5 should return 8.");
                s4.setHint("Bind both query parameters with @RequestParam, perform the addition, and return the result.");
                s4.setStarterCode("@RestController\npublic class MathController {\n    // Code here\n}");
                s4.setExpectedOutput("8");
                s4.setDifficulty("Easy");
                s4.setLanguage("Spring Boot");
                challengeRepository.save(s4);

                // ===== NODE.JS TRACK =====
                Challenge n1 = new Challenge();
                n1.setTitle("Hello Express");
                n1.setDescription(
                        "Create an Express server with a GET / route that responds with \"Hello Express!\".\n\nUse app.get() to define the route.");
                n1.setHint("Define a GET route on the root path and use res.send() to respond.");
                n1.setStarterCode("const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000);");
                n1.setExpectedOutput("Hello Express!");
                n1.setDifficulty("Easy");
                n1.setLanguage("Node.js");
                challengeRepository.save(n1);

                Challenge n2 = new Challenge();
                n2.setTitle("JSON Response");
                n2.setDescription(
                        "Create a GET /api/user route that returns a JSON object with name and age.\n\nReturn: { \"name\": \"DevWar\", \"age\": 1 }");
                n2.setHint("Define a GET route and use res.json() to return an object with the required fields.");
                n2.setStarterCode("const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000);");
                n2.setExpectedOutput("{\"name\":\"DevWar\",\"age\":1}");
                n2.setDifficulty("Easy");
                n2.setLanguage("Node.js");
                challengeRepository.save(n2);

                Challenge n3 = new Challenge();
                n3.setTitle("Middleware Logger");
                n3.setDescription(
                        "Create a middleware that logs the request method and URL to the console.\n\nThen create a GET /api/ping route that returns \"pong\".");
                n3.setHint("Register middleware with app.use() that logs and calls next(), then add the route.");
                n3.setStarterCode("const express = require('express');\nconst app = express();\n\n// Your middleware here\n\n// Your route here\n\napp.listen(3000);");
                n3.setExpectedOutput("pong");
                n3.setDifficulty("Medium");
                n3.setLanguage("Node.js");
                challengeRepository.save(n3);

                Challenge n4 = new Challenge();
                n4.setTitle("Route Parameters");
                n4.setDescription(
                        "Create a GET /api/users/:id route that returns the user ID from the URL.\n\nReturn format: { \"userId\": \"<id>\" }");
                n4.setHint("Define a parameterized route with :id and access it via req.params.");
                n4.setStarterCode("const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000);");
                n4.setExpectedOutput("{\"userId\":");
                n4.setDifficulty("Easy");
                n4.setLanguage("Node.js");
                challengeRepository.save(n4);

                // ===== SQL TRACK =====
                Challenge q1 = new Challenge();
                q1.setTitle("SELECT All Users");
                q1.setDescription(
                        "Write a SQL query to select all columns from the 'users' table.\n\nTable: users (id, username, email, rating)");
                q1.setHint("Use the wildcard selector to fetch every column from the table.");
                q1.setStarterCode("-- Write your SQL query below\nSELECT ");
                q1.setExpectedOutput("SELECT * FROM users");
                q1.setDifficulty("Easy");
                q1.setLanguage("SQL");
                challengeRepository.save(q1);

                Challenge q2 = new Challenge();
                q2.setTitle("Filter by Rating");
                q2.setDescription(
                        "Write a query to find all users with a rating above 1200.\n\nTable: users (id, username, email, rating)");
                q2.setHint("Add a WHERE clause with a comparison operator to filter by the rating column.");
                q2.setStarterCode("-- Write your SQL query below\nSELECT ");
                q2.setExpectedOutput("WHERE rating > 1200");
                q2.setDifficulty("Easy");
                q2.setLanguage("SQL");
                challengeRepository.save(q2);

                Challenge q3 = new Challenge();
                q3.setTitle("Count and Group");
                q3.setDescription(
                        "Write a query to count the number of users per difficulty level from the 'challenges' table.\n\nTable: challenges (id, title, difficulty, language)\nReturn columns: difficulty, count");
                q3.setHint("Combine an aggregate function with GROUP BY to count rows per category.");
                q3.setStarterCode("-- Write your SQL query below\nSELECT ");
                q3.setExpectedOutput("GROUP BY difficulty");
                q3.setDifficulty("Medium");
                q3.setLanguage("SQL");
                challengeRepository.save(q3);

                Challenge q4 = new Challenge();
                q4.setTitle("ORDER BY Rating");
                q4.setDescription(
                        "Write a query to get all users sorted by rating in descending order.\n\nTable: users (id, username, email, rating)");
                q4.setHint("Add an ORDER BY clause with the correct direction to sort highest first.");
                q4.setStarterCode("-- Write your SQL query below\nSELECT ");
                q4.setExpectedOutput("ORDER BY rating DESC");
                q4.setDifficulty("Easy");
                q4.setLanguage("SQL");
                challengeRepository.save(q4);

                System.out.println("Mock Challenges initialized.");
            }
        };
    }
}
