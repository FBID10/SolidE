// src/main/java/com/example/solid/dto/LoginRequest.java

package com.example.solid.dto;

/**
 * DTO for user login requests.
 * Contains the email (username) and raw password for authentication.
 */
public class LoginRequest {

    private String email;
    private String password; // Raw password

    // --- Getters ---
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    // --- Setters ---
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}