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

@Controller
public class ChatWebSocketController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload WsMessagePayload payload, Authentication authentication) {
        if (authentication == null) return;
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long senderId = userDetails.getUserId();
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
}
