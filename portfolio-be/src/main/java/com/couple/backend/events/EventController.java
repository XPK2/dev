package com.couple.backend.events;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.exception.AppException;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    @Autowired
    private CoupleEventRepository repository;

    @GetMapping("/upcoming")
    public ApiResponse<List<CoupleEvent>> getUpcoming() {
        List<CoupleEvent> events = repository
                .findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now());
        return ApiResponse.success("Events retrieved", events);
    }

    @GetMapping
    public ApiResponse<List<CoupleEvent>> getAll() {
        return ApiResponse.success("All events retrieved",
                repository.findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.of(2000, 1, 1)));
    }

    @PostMapping
    public ApiResponse<CoupleEvent> create(@RequestBody Map<String, String> body, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String title = body.get("title");
        String eventDate = body.get("eventDate");
        if (title == null || eventDate == null) {
            return ApiResponse.error("Title and eventDate are required");
        }
        CoupleEvent event = new CoupleEvent();
        event.setTitle(title.trim());
        event.setEventDate(LocalDate.parse(eventDate));
        event.setEmoji(body.getOrDefault("emoji", "🎉"));
        event.setCreatedBy(userDetails.getUserId());
        return ApiResponse.success("Event created", repository.save(event));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new AppException("NOT_FOUND", "Event not found", 404);
        }
        repository.deleteById(id);
        return ApiResponse.success("Event deleted");
    }
}
