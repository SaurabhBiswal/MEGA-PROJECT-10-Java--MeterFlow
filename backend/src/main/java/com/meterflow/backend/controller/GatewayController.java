package com.meterflow.backend.controller;

import com.meterflow.backend.entity.ApiKey;
import com.meterflow.backend.entity.ApiMetadata;
import com.meterflow.backend.repository.ApiKeyRepository;
import com.meterflow.backend.repository.ApiMetadataRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Enumeration;
import java.util.stream.Collectors;

import com.meterflow.backend.repository.UsageLogRepository;
import com.meterflow.backend.service.RateLimiterService;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequiredArgsConstructor
public class GatewayController {

    private final ApiKeyRepository apiKeyRepository;
    private final ApiMetadataRepository apiMetadataRepository;
    private final UsageLogRepository usageLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiterService;
    private final RestTemplate restTemplate = new RestTemplate();

    @RequestMapping("/gateway/**")
    public ResponseEntity<String> proxyRequest(HttpServletRequest request) {
        String apiKeyHeader = request.getHeader("X-API-KEY");
        if (apiKeyHeader == null || !apiKeyHeader.startsWith("mf_")) {
            return ResponseEntity.status(401).body("Missing or invalid X-API-KEY header format");
        }

        String[] parts = apiKeyHeader.split("_");
        if (parts.length != 3) {
            return ResponseEntity.status(401).body("Invalid X-API-KEY format");
        }

        String keyIdentifier = parts[1];
        ApiKey apiKey = apiKeyRepository.findByKeyIdentifier(keyIdentifier).orElse(null);

        if (apiKey == null || !"ACTIVE".equals(apiKey.getStatus()) || !passwordEncoder.matches(apiKeyHeader, apiKey.getKey())) {
            return ResponseEntity.status(403).body("Invalid or revoked API Key");
        }

        ApiMetadata metadata = apiMetadataRepository.findById(apiKey.getApiId())
                .orElse(null);

        if (metadata == null) {
            return ResponseEntity.status(404).body("API not found");
        }

        // Rate Limiting (Token Bucket — FREE: 10 req/min, PRO: 100 req/min)
        boolean allowed = rateLimiterService.tryConsume(keyIdentifier, false);
        if (!allowed) {
            return ResponseEntity.status(429)
                    .header("X-RateLimit-Limit", "10")
                    .header("X-RateLimit-Reset", "60")
                    .body("{\"error\": \"Rate limit exceeded. Upgrade to PRO for higher limits.\"}");
        }

        // Forward Request
        String path = request.getRequestURI().replaceFirst("/gateway", "");
        String queryString = request.getQueryString() != null ? "?" + request.getQueryString() : "";
        String targetUrl = metadata.getTargetBaseUrl() + path + queryString;

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (!headerName.equalsIgnoreCase("X-API-KEY") && !headerName.equalsIgnoreCase("Host")) {
                headers.put(headerName, Collections.list(request.getHeaders(headerName)));
            }
        }

        long startTime = System.currentTimeMillis();
        int responseStatus = 500;
        ResponseEntity<String> response = null;

        try {
            String body = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            response = restTemplate.exchange(targetUrl, HttpMethod.valueOf(request.getMethod()), entity, String.class);
            responseStatus = response.getStatusCode().value();
            return ResponseEntity.status(responseStatus).headers(response.getHeaders()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            responseStatus = e.getStatusCode().value();
            return ResponseEntity.status(responseStatus).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error forwarding request: " + e.getMessage());
        } finally {
            long latencyMs = System.currentTimeMillis() - startTime;
            com.meterflow.backend.entity.UsageLog log = com.meterflow.backend.entity.UsageLog.builder()
                    .apiId(apiKey.getApiId())
                    .apiKey(keyIdentifier)
                    .endpoint(path)
                    .responseStatus(responseStatus)
                    .latencyMs(latencyMs)
                    .build();
            usageLogRepository.save(log);
        }
    }
}
