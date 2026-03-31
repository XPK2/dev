package com.couple.backend.spin;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/spin")
@RequiredArgsConstructor
public class SpinController {

    private final SpinPlaceService service;

    @GetMapping
    public ApiResponse<List<SpinPlace>> getAll() {
        return ApiResponse.success("Places retrieved", service.getAll());
    }

    @GetMapping("/{category}")
    public ApiResponse<List<SpinPlace>> getByCategory(@PathVariable String category) {
        return ApiResponse.success("Places retrieved", service.getByCategory(category));
    }

    @PostMapping
    public ApiResponse<SpinPlace> create(@RequestBody Map<String, String> body, Authentication authentication) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ApiResponse.error("Name is required");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ApiResponse.success("Place added", service.create(body, userDetails.getUserId()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Place deleted");
    }
}
