package com.meterflow.backend.controller;

import com.meterflow.backend.entity.ApiKey;
import com.meterflow.backend.entity.ApiMetadata;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.service.ApiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/apis")
@RequiredArgsConstructor
public class ApiController {

    private final ApiService apiService;

    @PostMapping
    public ResponseEntity<ApiMetadata> createApi(
            @AuthenticationPrincipal User user,
            @RequestBody CreateApiRequest request
    ) {
        return ResponseEntity.ok(apiService.createApi(user, request.getName(), request.getTargetBaseUrl()));
    }

    @GetMapping
    public ResponseEntity<List<ApiMetadata>> getUserApis(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(apiService.getUserApis(user));
    }

    @PostMapping("/{apiId}/keys")
    public ResponseEntity<ApiKey> generateApiKey(@PathVariable Long apiId) {
        return ResponseEntity.ok(apiService.generateApiKey(apiId));
    }

    @GetMapping("/{apiId}/keys")
    public ResponseEntity<List<ApiKey>> getApiKeys(@PathVariable Long apiId) {
        return ResponseEntity.ok(apiService.getApiKeys(apiId));
    }
}

@Data
class CreateApiRequest {
    private String name;
    private String targetBaseUrl;
}
