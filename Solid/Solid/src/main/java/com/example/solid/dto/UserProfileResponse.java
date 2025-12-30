package com.example.solid.dto;

import com.example.solid.User.User;
import com.example.solid.User.UserRole;

public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String role;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static UserProfileResponse fromEntity(User user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getUserId());
        dto.setEmail(user.getUsername());
        dto.setName(user.getName());
        UserRole r = user.getRole();
        dto.setRole(r == null ? null : r.name());
        return dto;
    }
} 