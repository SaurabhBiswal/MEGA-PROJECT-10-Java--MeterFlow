package com.meterflow.backend.repository;

import com.meterflow.backend.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    
    @Query("SELECT COUNT(u) FROM UsageLog u WHERE u.apiId = :apiId")
    long countByApiId(Long apiId);

    @Query("SELECT new com.meterflow.backend.dto.DailyUsage(FUNCTION('DATE', u.timestamp), COUNT(u)) " +
           "FROM UsageLog u WHERE u.apiId IN :apiIds AND u.timestamp >= :startDate " +
           "GROUP BY FUNCTION('DATE', u.timestamp) ORDER BY FUNCTION('DATE', u.timestamp)")
    java.util.List<com.meterflow.backend.dto.DailyUsage> findDailyUsageByApiIds(
        @org.springframework.data.repository.query.Param("apiIds") java.util.List<Long> apiIds, 
        @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate
    );
}
