package com.couple.backend.notes;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notes")
public class NoteController {

    @Autowired
    private NoteService service;

    @GetMapping
    public ApiResponse<List<Note>> getAll() {
        return ApiResponse.success("Notes retrieved", service.getAll());
    }

    @PostMapping
    public ApiResponse<Note> create(@RequestBody Map<String, String> body, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String title = body.get("title");
        String content = body.get("content");
        String color = body.get("color");

        if (title == null || title.trim().isEmpty()) {
            return ApiResponse.error("Title is required");
        }
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error("Content is required");
        }

        return ApiResponse.success(
                "Note created",
                service.create(title.trim(), content.trim(), color, userDetails.getUserId())
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<Note> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String title = body.get("title");
        String content = body.get("content");
        String color = body.get("color");

        if (title == null || title.trim().isEmpty()) {
            return ApiResponse.error("Title is required");
        }
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error("Content is required");
        }

        return ApiResponse.success(
                "Note updated",
                service.update(id, title.trim(), content.trim(), color)
        );
    }

    @PatchMapping("/{id}/pin")
    public ApiResponse<Note> togglePin(@PathVariable Long id) {
        return ApiResponse.success("Note pin toggled", service.togglePin(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Note deleted");
    }
}