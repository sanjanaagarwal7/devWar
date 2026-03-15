package com.devwar.websocket;

import com.devwar.models.BattleRoom;
import com.devwar.services.BattleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class BattleWebSocketHandler extends TextWebSocketHandler {

    private final BattleService battleService;
    private final ObjectMapper mapper = new ObjectMapper();

    // session ID -> WebSocketSession
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    // session ID -> username
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    public BattleWebSocketHandler(BattleService battleService) {
        this.battleService = battleService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        Map<String, Object> data = mapper.readValue(payload, Map.class);
        String event = (String) data.get("event");

        if ("player_joined".equals(event)) {
            String username = (String) data.get("username");
            sessionUserMap.put(session.getId(), username);

            BattleRoom room = battleService.joinMatchmaking(username);
            if (room != null) {
                // match found! broadcast to both players
                broadcastToRoom(room.getRoomId(), Map.of(
                        "event", "match_found",
                        "roomId", room.getRoomId(),
                        "challengeId", room.getChallengeId() != null ? room.getChallengeId() : -1,
                        "players", room.getPlayers()));
            }
        } else if ("code_submitted".equals(event)) {
            String username = sessionUserMap.get(session.getId());
            boolean isCorrect = (Boolean) data.getOrDefault("isCorrect", false);

            BattleRoom room = battleService.getRoomByUsername(username);
            if (room != null && "active".equals(room.getStatus())) {
                if (isCorrect) {
                    battleService.finishBattle(room.getRoomId(), username);
                    broadcastToRoom(room.getRoomId(), Map.of(
                            "event", "battle_finished",
                            "winner", username,
                            "roomId", room.getRoomId()));
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = sessionUserMap.get(session.getId());
        if (username != null) {
            battleService.leaveMatchmaking(username);
            sessionUserMap.remove(session.getId());
        }
        sessions.remove(session.getId());
    }

    private void broadcastToRoom(String roomId, Map<String, Object> messageData) {
        BattleRoom room = battleService.getRoom(roomId);
        if (room == null)
            return;

        String jsonPayload;
        try {
            jsonPayload = mapper.writeValueAsString(messageData);
        } catch (Exception e) {
            return;
        }

        for (String player : room.getPlayers()) {
            for (Map.Entry<String, String> entry : sessionUserMap.entrySet()) {
                if (entry.getValue().equals(player)) {
                    WebSocketSession wsSession = sessions.get(entry.getKey());
                    if (wsSession != null && wsSession.isOpen()) {
                        try {
                            wsSession.sendMessage(new TextMessage(jsonPayload));
                        } catch (Exception ignored) {
                        }
                    }
                }
            }
        }
    }
}
