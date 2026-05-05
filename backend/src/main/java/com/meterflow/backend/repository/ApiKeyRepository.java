package com.meterflow.backend.repository;

import com.meterflow.backend.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyIdentifier(String keyIdentifier);
    List<ApiKey> findByApiId(Long apiId);
}
