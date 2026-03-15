package com.devwar.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final BattleWebSocketHandler battleWebSocketHandler;
    private final ChatWebSocketHandler chatWebSocketHandler;

    public WebSocketConfig(BattleWebSocketHandler battleWebSocketHandler, ChatWebSocketHandler chatWebSocketHandler) {
        this.battleWebSocketHandler = battleWebSocketHandler;
        this.chatWebSocketHandler = chatWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(battleWebSocketHandler, "/ws/battle").setAllowedOrigins("*");
        registry.addHandler(chatWebSocketHandler, "/ws/chat").setAllowedOrigins("*");
    }
}
