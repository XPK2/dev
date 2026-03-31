package com.couple.backend.photo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository repo;

    // ── Tối đa 5MB per ảnh (base64 ~= 4/3 * raw, 5MB raw ≈ 6.7MB base64) ──
    private static final int MAX_BASE64_LEN = 7_000_000;

    public List<PhotoSummary> listAll() {
        return repo.findAllSorted().stream()
            .map(p -> new PhotoSummary(
                p.getId(),
                p.getUploadedBy(),
                p.getCaption(),
                p.getMimeType(),
                p.getFileSize(),
                p.getTakenDate(),
                p.getCreatedAt().toString(),
                null   // thumbPrefix — không dùng, FE load full qua /photos/{id}
            ))
            .toList();
    }

    public Photo getById(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Photo not found: " + id));
    }

    public Photo upload(Map<String, Object> body, Long userId) {
        String data = (String) body.get("data");   // full base64 data URI
        if (data == null || data.isBlank()) {
            throw new IllegalArgumentException("Image data is required");
        }
        if (data.length() > MAX_BASE64_LEN) {
            throw new IllegalArgumentException("Image too large (max 5MB)");
        }

        // Trích mime type từ data URI: "data:image/jpeg;base64,..."
        String mimeType = "image/jpeg";
        if (data.startsWith("data:")) {
            int semicolon = data.indexOf(';');
            if (semicolon > 5) mimeType = data.substring(5, semicolon);
        }

        Photo photo = new Photo();
        photo.setUploadedBy(userId);
        photo.setData(data);
        photo.setMimeType(mimeType);
        photo.setCaption((String) body.getOrDefault("caption", ""));
        photo.setFileSize((int) Math.round(data.length() * 0.75)); // approx raw bytes

        Object takenDateObj = body.get("takenDate");
        if (takenDateObj instanceof String s && !s.isBlank()) {
            try { photo.setTakenDate(LocalDate.parse(s)); } catch (Exception ignored) {}
        }
        if (photo.getTakenDate() == null) photo.setTakenDate(LocalDate.now());

        return repo.save(photo);
    }

    public void delete(Long id, Long userId) {
        Photo photo = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Photo not found"));
        // Cả 2 người đều có thể xóa
        repo.delete(photo);
    }
}
