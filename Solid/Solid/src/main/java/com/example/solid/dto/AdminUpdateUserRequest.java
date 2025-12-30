package com.example.solid.dto;

public class AdminUpdateUserRequest {
    private String name;
    private String email;
    private String role; // expect values like ROLE_USER or ROLE_ADMIN to match enum

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
} 