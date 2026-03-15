package com.devwar.services;

import com.devwar.models.BattleRoom;
import com.devwar.models.Challenge;
import com.devwar.repositories.ChallengeRepository;
import com.devwar.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class BattleService {

    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    // Queue for matchmaking
    private final Queue<String> matchmakingQueue = new ConcurrentLinkedQueue<>();

    // Active battles
    private final Map<String, BattleRoom> activeRooms = new ConcurrentHashMap<>();

    // Map of username -> roomId
    private final Map<String, String> userRooms = new ConcurrentHashMap<>();

    public BattleService(ChallengeRepository challengeRepository, UserRepository userRepository) {
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
    }

    public synchronized BattleRoom joinMatchmaking(String username) {
        if (matchmakingQueue.contains(username))
            return null;

        matchmakingQueue.add(username);

        if (matchmakingQueue.size() >= 2) {
            String player1 = matchmakingQueue.poll();
            String player2 = matchmakingQueue.poll();

            return createBattleRoom(player1, player2);
        }

        return null;
    }

    private BattleRoom createBattleRoom(String player1, String player2) {
        String roomId = UUID.randomUUID().toString();
        BattleRoom room = new BattleRoom(roomId);
        room.addPlayer(player1);
        room.addPlayer(player2);

        // Assign random challenge
        List<Challenge> challenges = challengeRepository.findAll();
        if (!challenges.isEmpty()) {
            Challenge challenge = challenges.get(new Random().nextInt(challenges.size()));
            room.setChallengeId(challenge.getId());
        }

        room.setStatus("active");

        activeRooms.put(roomId, room);
        userRooms.put(player1, roomId);
        userRooms.put(player2, roomId);

        return room;
    }

    public BattleRoom getRoomByUsername(String username) {
        String roomId = userRooms.get(username);
        if (roomId != null) {
            return activeRooms.get(roomId);
        }
        return null;
    }

    public BattleRoom getRoom(String roomId) {
        return activeRooms.get(roomId);
    }

    public void finishBattle(String roomId, String winnerUsername) {
        BattleRoom room = activeRooms.get(roomId);
        if (room != null) {
            room.setStatus("finished");
            room.setWinner(winnerUsername);

            // Update Elo / stats (simplified)
            for (String p : room.getPlayers()) {
                userRepository.findByUsername(p).ifPresent(user -> {
                    if (p.equals(winnerUsername)) {
                        user.setWins(user.getWins() + 1);
                        user.setRating(user.getRating() + 25);
                    } else {
                        user.setLosses(user.getLosses() + 1);
                        user.setRating(Math.max(0, user.getRating() - 15));
                    }
                    userRepository.save(user);
                });
                userRooms.remove(p);
            }
        }
    }

    public void leaveMatchmaking(String username) {
        matchmakingQueue.remove(username);
    }
}
