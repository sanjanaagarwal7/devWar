package com.devwar.controllers;

import com.devwar.models.Challenge;
import com.devwar.repositories.ChallengeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "*")
public class ChallengeController {

    private final ChallengeRepository challengeRepository;

    public ChallengeController(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Challenge>> getAllChallenges() {
        return ResponseEntity.ok(challengeRepository.findAll());
    }

    @GetMapping("/track/{language}")
    public ResponseEntity<List<Challenge>> getChallengesByLanguage(@PathVariable String language) {
        return ResponseEntity.ok(challengeRepository.findByLanguage(language));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Challenge> getChallengeById(@PathVariable Long id) {
        return challengeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Challenge> createChallenge(@RequestBody Challenge challenge) {
        return ResponseEntity.ok(challengeRepository.save(challenge));
    }
}
