package com.meterflow.backend.service;

import com.meterflow.backend.entity.ApiKey;
import com.meterflow.backend.entity.ApiMetadata;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.repository.ApiKeyRepository;
import com.meterflow.backend.repository.ApiMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class ApiService {
    private final ApiMetadataRepository apiMetadataRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiMetadata createApi(User user, String name, String targetBaseUrl) {
        ApiMetadata api = ApiMetadata.builder()
                .userId(user.getId())
                .name(name)
                .targetBaseUrl(targetBaseUrl)
                .build();
        return apiMetadataRepository.save(api);
    }

    public List<ApiMetadata> getUserApis(User user) {
        return apiMetadataRepository.findByUserId(user.getId());
    }

    public ApiKey generateApiKey(Long apiId) {
        String keyIdentifier = UUID.randomUUID().toString().substring(0, 8);
        String secret = UUID.randomUUID().toString().replace("-", "");
        String rawKey = "mf_" + keyIdentifier + "_" + secret;
        String maskedKey = "mf_" + keyIdentifier + "_***" + secret.substring(secret.length() - 4);
        
        ApiKey apiKey = ApiKey.builder()
                .apiId(apiId)
                .keyIdentifier(keyIdentifier)
                .key(passwordEncoder.encode(rawKey))
                .maskedKey(maskedKey)
                .status("ACTIVE")
                .build();
        
        ApiKey savedKey = apiKeyRepository.save(apiKey);
        savedKey.setRawKey(rawKey); // transient, for response only
        savedKey.setKey(null); // don't send the hash to the frontend
        return savedKey;
    }

    public List<ApiKey> getApiKeys(Long apiId) {
        List<ApiKey> keys = apiKeyRepository.findByApiId(apiId);
        keys.forEach(k -> k.setKey(null)); // never return the hash
        return keys;
    }
}
