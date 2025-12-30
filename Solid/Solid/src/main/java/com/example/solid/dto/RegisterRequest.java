// src/main/java/com/example/solid/dto/RegisterRequest.java

package com.example.solid.dto;

/**
 * DTO for user registration requests.
 * Contains the credentials and user name to create a new user account.
 */
public class RegisterRequest {

    private String email;
    private String password; // Raw password (will be hashed by AuthService)
    private String name;

    // --- Getters ---
    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    // --- Setters (Needed by Spring's JSON deserialization) ---
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setName(String name) {
        this.name = name;
    }
}