package com.couple.backend.chat.repository;

import com.couple.backend.chat.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId1 AND m.receiverId = :userId2) " +
           "OR (m.senderId = :userId2 AND m.receiverId = :userId1) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findConversation(Long userId1, Long userId2, Pageable pageable);
}
