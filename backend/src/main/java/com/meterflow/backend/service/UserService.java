package com.meterflow.backend.service;

import com.meterflow.backend.dto.PasswordChangeDto;
import com.meterflow.backend.dto.UserProfileDto;
import com.meterflow.backend.entity.User;
import com.meterflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileDto getUserProfile(User user) {
        return UserProfileDto.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .usageAlerts(user.isUsageAlerts())
                .billingUpdates(user.isBillingUpdates())
                .build();
    }

    public UserProfileDto updateUserProfile(User user, UserProfileDto dto) {
        user.setFullName(dto.getFullName());
        user.setUsageAlerts(dto.isUsageAlerts());
        user.setBillingUpdates(dto.isBillingUpdates());
        
        User updatedUser = userRepository.save(user);
        
        return UserProfileDto.builder()
                .email(updatedUser.getEmail())
                .fullName(updatedUser.getFullName())
                .usageAlerts(updatedUser.isUsageAlerts())
                .billingUpdates(updatedUser.isBillingUpdates())
                .build();
    }

    public void updatePassword(User user, PasswordChangeDto dto) {
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}
