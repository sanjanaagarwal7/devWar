package com.devwar.models;

import java.util.ArrayList;
import java.util.List;

public class BattleRoom {

    private String roomId;
    private List<String> players = new ArrayList<>();
    private Long challengeId;
    private int timer;
    private String winner;
    private String status; // "waiting", "active", "finished"

    public BattleRoom() {
    }

    public BattleRoom(String roomId) {
        this.roomId = roomId;
        this.timer = 600; // 10 minutes in seconds
        this.status = "waiting";
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public List<String> getPlayers() {
        return players;
    }

    public void setPlayers(List<String> players) {
        this.players = players;
    }

    public void addPlayer(String username) {
        this.players.add(username);
    }

    public Long getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }

    public int getTimer() {
        return timer;
    }

    public void setTimer(int timer) {
        this.timer = timer;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
