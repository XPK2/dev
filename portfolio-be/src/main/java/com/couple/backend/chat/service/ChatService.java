package com.couple.backend.chat.service;

import com.couple.backend.chat.dto.MessageRequest;
import com.couple.backend.chat.dto.MessageResponse;
import com.couple.backend.chat.entity.Message;
import com.couple.backend.chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    @Autowired
    private MessageRepository messageRepository;

    public MessageResponse sendMessage(Long senderId, Long receiverId, MessageRequest request) {
        Message message = new Message(senderId, receiverId, request.getContent());
        Message saved = messageRepository.save(message);
        return new MessageResponse(saved.getId(), saved.getSenderId(), saved.getReceiverId(),
                                   saved.getContent(), saved.getCreatedAt());
    }

    public Page<MessageResponse> getConversation(Long userId1, Long userId2, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findConversation(userId1, userId2, pageable);
        return messages.map(msg -> new MessageResponse(msg.getId(), msg.getSenderId(), msg.getReceiverId(),
                                                        msg.getContent(), msg.getCreatedAt()));
    }
}
