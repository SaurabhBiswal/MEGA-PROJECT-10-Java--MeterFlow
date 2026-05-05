package com.meterflow.backend.repository;

import com.meterflow.backend.entity.ApiMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiMetadataRepository extends JpaRepository<ApiMetadata, Long> {
    List<ApiMetadata> findByUserId(Long userId);
}
