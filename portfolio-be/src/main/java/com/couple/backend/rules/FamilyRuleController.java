package com.couple.backend.rules;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rules")
public class FamilyRuleController {

    @Autowired
    private FamilyRuleService service;

    @GetMapping
    public ApiResponse<List<FamilyRule>> getAll() {
        return ApiResponse.success("Rules retrieved", service.getAll());
    }

    @PostMapping
    public ApiResponse<FamilyRule> create(@RequestBody Map<String, String> body, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error("Content is required");
        }
        return ApiResponse.success("Rule created", service.create(content.trim(), userDetails.getUserId()));
    }

    @PutMapping("/{id}")
    public ApiResponse<FamilyRule> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error("Content is required");
        }
        return ApiResponse.success("Rule updated", service.update(id, content.trim()));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Rule deleted");
    }
}
