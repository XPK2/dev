package com.couple.backend.settings;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "couple_settings")
public class CoupleSettings {

    @Id
    private Long id = 1L;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "user1_nickname")
    private String user1Nickname;

    @Column(name = "user2_nickname")
    private String user2Nickname;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CoupleSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public String getUser1Nickname() { return user1Nickname; }
    public void setUser1Nickname(String user1Nickname) { this.user1Nickname = user1Nickname; }

    public String getUser2Nickname() { return user2Nickname; }
    public void setUser2Nickname(String user2Nickname) { this.user2Nickname = user2Nickname; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
