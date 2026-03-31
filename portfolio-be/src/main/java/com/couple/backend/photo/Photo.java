package com.couple.backend.photo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(length = 500)
    private String caption;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String data;           // full base64 data URI

    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType = "image/jpeg";

    @Column(name = "file_size")
    private Integer fileSize = 0;  // bytes

    @Column(name = "taken_date")
    private LocalDate takenDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (takenDate == null) takenDate = LocalDate.now();
    }
}
