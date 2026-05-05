package com.meterflow.backend.controller;

import com.meterflow.backend.entity.User;
import com.meterflow.backend.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final StripeService stripeService;

    /**
     * Creates a Stripe Checkout Session and returns the redirect URL.
     * Called when the user clicks "Upgrade Plan".
     */
    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@AuthenticationPrincipal User user) {
        try {
            String url = stripeService.createCheckoutSession(user);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Stripe Webhook endpoint — must be publicly accessible (e.g., via ngrok for local testing).
     * Listens for checkout.session.completed → upgrades user to PRO_USER.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            stripeService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    /**
     * Manual upgrade confirmation — called by frontend after returning from Stripe Checkout.
     * This is a fallback for local testing when webhooks are not available.
     */
    @PostMapping("/confirm-upgrade")
    public ResponseEntity<Map<String, String>> confirmUpgrade(@AuthenticationPrincipal User user) {
        try {
            stripeService.upgradeUser(user.getEmail());
            return ResponseEntity.ok(Map.of("status", "upgraded", "role", "PRO_USER"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
