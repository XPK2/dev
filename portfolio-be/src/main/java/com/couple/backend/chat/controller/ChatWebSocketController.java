package com.couple.backend.chat.controller;

import com.couple.backend.chat.dto.MessageRequest;
import com.couple.backend.chat.dto.MessageResponse;
import com.couple.backend.chat.service.ChatService;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload WsMessagePayload payload, Authentication authentication) {
        if (authentication == null) {
            System.err.println("Chat.send: No authentication");
            return;
        }
        
        Long senderId = extractUserId(authentication);
        if (senderId == null) {
            System.err.println("Chat.send: No userId found");
            return;
        }
        
        Long receiverId = payload.getReceiverId();

        MessageRequest request = new MessageRequest();
        request.setContent(payload.getContent());

        MessageResponse response = chatService.sendMessage(senderId, receiverId, request);

        // Push to both sender and receiver
        messagingTemplate.convertAndSendToUser(
                String.valueOf(senderId), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(receiverId), "/queue/messages", response);
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload WsMessagePayload payload, Authentication authentication) {
        if (authentication == null) return;
        Long senderId = extractUserId(authentication);
        if (senderId == null) return;
        Long receiverId = payload.getReceiverId();

        Map<String, Object> typingEvent = new HashMap<>();
        typingEvent.put("type", "typing");
        typingEvent.put("senderId", senderId);
        typingEvent.put("receiverId", receiverId);

        System.out.println("Typing event from " + senderId + " to " + receiverId);
        // Push to receiver only
        messagingTemplate.convertAndSendToUser(
                String.valueOf(receiverId), "/queue/messages", typingEvent);
    }

    @MessageMapping("/chat.online")
    public void handleOnline(@Payload WsMessagePayload payload, Authentication authentication) {
        if (authentication == null) return;
        Long senderId = extractUserId(authentication);
        if (senderId == null) return;
        Long receiverId = payload.getReceiverId();

        Map<String, Object> onlineEvent = new HashMap<>();
        onlineEvent.put("type", "online");
        onlineEvent.put("senderId", senderId);
        onlineEvent.put("receiverId", receiverId);

        System.out.println("Online event from " + senderId + " to " + receiverId);
        // Push to receiver only
        messagingTemplate.convertAndSendToUser(
                String.valueOf(receiverId), "/queue/messages", onlineEvent);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null) return null;
        
        // Try CustomUserDetails first
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getUserId();
        }
        
        // Try details field (set by StompAuthenticationFilter)
        Object details = authentication.getDetails();
        if (details instanceof Long) {
            return (Long) details;
        }
        
        return null;
    }
}
