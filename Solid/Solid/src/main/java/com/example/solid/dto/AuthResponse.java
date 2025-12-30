// src/main/java/com/example/solid/User/dto/AuthResponse.java

package com.example.solid.dto;

/**
 * Data Transfer Object (DTO) for the login response.
 * Holds the JWT token that the client needs for subsequent authenticated requests.
 */
public class AuthResponse {

    private String jwtToken;

    // --- Constructor ---
    public AuthResponse(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    // --- Getter and Setter ---
    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }
}