package com.meterflow.backend.controller;

import com.meterflow.backend.entity.User;
import com.meterflow.backend.service.BillingService;
import com.meterflow.backend.service.DashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BillingService billingService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(billingService.getDashboardStats(user));
    }
}
