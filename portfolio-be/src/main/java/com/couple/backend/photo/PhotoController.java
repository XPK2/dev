package com.couple.backend.photo;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService service;

    /** List photos — metadata only, no base64 data */
    @GetMapping
    public ApiResponse<List<PhotoSummary>> list() {
        return ApiResponse.success("Photos retrieved", service.listAll());
    }

    /** Get single photo with full base64 data */
    @GetMapping("/{id}")
    public ApiResponse<Photo> getOne(@PathVariable Long id) {
        return ApiResponse.success("Photo retrieved", service.getById(id));
    }

    /** Upload a new photo */
    @PostMapping
    public ApiResponse<Photo> upload(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        try {
            Photo saved = service.upload(body, user.getUserId());
            // Return metadata only — strip heavy base64 from response
            saved.setData("[uploaded]");
            return ApiResponse.success("Photo uploaded", saved);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /** Delete a photo */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        service.delete(id, user.getUserId());
        return ApiResponse.success("Photo deleted");
    }
}
