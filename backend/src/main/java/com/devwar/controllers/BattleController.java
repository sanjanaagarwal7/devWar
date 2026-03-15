package com.devwar.controllers;

import com.devwar.models.BattleRoom;
import com.devwar.models.User;
import com.devwar.repositories.UserRepository;
import com.devwar.services.BattleService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battles")
@CrossOrigin(origins = "*")
public class BattleController {

    private final BattleService battleService;
    private final UserRepository userRepository;

    public BattleController(BattleService battleService, UserRepository userRepository) {
        this.battleService = battleService;
        this.userRepository = userRepository;
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<BattleRoom> getRoomInfo(@PathVariable String roomId) {
        BattleRoom room = battleService.getRoom(roomId);
        return room != null ? ResponseEntity.ok(room) : ResponseEntity.notFound().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(userRepository.findAll(Sort.by(Sort.Direction.DESC, "rating")));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<User> getUserStats(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
