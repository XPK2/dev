package com.couple.backend.bucket;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bucket")
public class BucketController {

    @Autowired
    private BucketItemService service;

    @GetMapping
    public ApiResponse<List<BucketItem>> getAll() {
        return ApiResponse.success("Bucket list retrieved", service.getAll());
    }

    @PostMapping
    public ApiResponse<BucketItem> create(@RequestBody Map<String, String> body, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ApiResponse.error("Text is required");
        }
        return ApiResponse.success("Item created", service.create(text.trim(), userDetails.getUserId()));
    }

    @PatchMapping("/{id}/toggle")
    public ApiResponse<BucketItem> toggle(@PathVariable Long id) {
        return ApiResponse.success("Item toggled", service.toggle(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<BucketItem> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ApiResponse.error("Text is required");
        }
        return ApiResponse.success("Item updated", service.update(id, text.trim()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Item deleted");
    }
}
