package com.meterflow.backend.controller;

import com.meterflow.backend.dto.PasswordChangeDto;
import com.meterflow.backend.dto.UserProfileDto;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(userService.updateUserProfile(user, dto));
    }

    @PutMapping("/password")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal User user,
            @RequestBody PasswordChangeDto dto) {
        try {
            userService.updatePassword(user, dto);
            return ResponseEntity.ok("Password updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
