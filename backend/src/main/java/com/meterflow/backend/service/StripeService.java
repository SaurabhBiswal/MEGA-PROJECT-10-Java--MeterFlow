package com.meterflow.backend.service;

import com.meterflow.backend.entity.Role;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.pro-price-id}")
    private String proPriceId;

    private final UserRepository userRepository;

    public String createCheckoutSession(User user) throws StripeException {
        Stripe.apiKey = secretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/?upgraded=true")
                .setCancelUrl("http://localhost:5173/")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(proPriceId)
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("user_email", user.getEmail())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    /**
     * Handle Stripe webhook events.
     * When a payment succeeds, the user's role is upgraded to PRO_USER.
     */
    public void handleWebhook(String payload, String sigHeader) {
        Stripe.apiKey = secretKey;

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid Stripe webhook signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new RuntimeException("Failed to deserialize event data"));

            String userEmail = session.getMetadata().get("user_email");
            Optional<User> userOpt = userRepository.findByEmail(userEmail);

            userOpt.ifPresent(u -> {
                u.setRole(Role.PRO_USER);
                userRepository.save(u);
            });
        }
    }

    /**
     * Manual upgrade — used as fallback when webhooks are unavailable (local dev).
     */
    public void upgradeUser(String email) {
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setRole(Role.PRO_USER);
            userRepository.save(u);
        });
    }
}
