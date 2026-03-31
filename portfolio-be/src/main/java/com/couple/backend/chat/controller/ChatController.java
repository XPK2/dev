package com.couple.backend.chat.controller;

import com.couple.backend.chat.dto.MessageRequest;
import com.couple.backend.chat.dto.MessageResponse;
import com.couple.backend.chat.service.ChatService;
import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @PostMapping("/send/{receiverId}")
    public ApiResponse<MessageResponse> sendMessage(@PathVariable Long receiverId,
                                                    @Valid @RequestBody MessageRequest request,
                                                    Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        MessageResponse response = chatService.sendMessage(userDetails.getUserId(), receiverId, request);
        return ApiResponse.success("Message sent", response);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ApiResponse<Page<MessageResponse>> getConversation(@PathVariable Long otherUserId,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "20") int size,
                                                             Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Page<MessageResponse> messages = chatService.getConversation(userDetails.getUserId(), otherUserId, page, size);
        return ApiResponse.success("Messages retrieved", messages);
    }
}
