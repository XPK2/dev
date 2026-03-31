package com.couple.backend.photo;

import java.time.LocalDate;

/**
 * DTO nhẹ cho list view — không trả data base64 để tránh payload quá lớn.
 * FE gọi GET /api/v1/photos/{id} khi cần xem full ảnh.
 */
public record PhotoSummary(
    Long id,
    Long uploadedBy,
    String caption,
    String mimeType,
    Integer fileSize,
    LocalDate takenDate,
    String createdAt,
    // Thumbnail: 50 ký tự đầu của data (chỉ để FE biết ảnh không rỗng)
    // Để tiết kiệm payload, FE load thumbnail riêng qua /photos/{id}/thumb
    String thumbPrefix
) {}
