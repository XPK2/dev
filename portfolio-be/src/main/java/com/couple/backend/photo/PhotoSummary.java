package com.couple.backend.photo;

import java.time.LocalDate;

/**
 * Lightweight DTO for list view — omits base64 data to keep payload small.
 * FE calls GET /api/v1/photos/{id} when it needs the full image.
 */
public record PhotoSummary(
    Long id,
    Long uploadedBy,
    String caption,
    String mimeType,
    Integer fileSize,
    LocalDate takenDate,
    String createdAt,
    // Reserved for future thumbnail prefix support
    String thumbPrefix
) {}
