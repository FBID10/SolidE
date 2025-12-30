package com.example.solid.Config;

import com.example.solid.User.JwtService;
import io.jsonwebtoken.MalformedJwtException; // <--- ADD THIS IMPORT
import io.jsonwebtoken.security.SignatureException; // <--- ADD THIS IMPORT
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip the JWT filter for preflight requests and auth endpoints
        String path = request.getRequestURI();
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Debug: if there's an Authorization header, log a masked version so we can trace issues
        if (authHeader != null) {
            try {
                String masked = authHeader.length() > 20 ? authHeader.substring(0, 10) + "..." + authHeader.substring(authHeader.length()-6) : authHeader;
                System.out.println("[JwtAuthenticationFilter] Authorization header present (masked): " + masked);
            } catch (Exception e) {
                System.out.println("[JwtAuthenticationFilter] Authorization header present (could not mask)");
            }
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // FIX 1: Add .trim() to prevent 'Illegal base64url character: ' ' error
            jwt = authHeader.substring(7).trim();

            // If jwt is empty after trimming, skip validation gracefully
            if (jwt == null || jwt.isEmpty()) {
                // nothing to validate; let security handle unauthenticated request
                filterChain.doFilter(request, response);
                return;
            }

            // If token doesn't look like a JWT (must contain 2 dots), skip validation to avoid parsing errors
            if (jwt.chars().filter(ch -> ch == '.').count() != 2) {
                // token is not JWT format (e.g. 'local-auth-token'), don't attempt to validate
                filterChain.doFilter(request, response);
                return;
            }

            userEmail = jwtService.extractUsername(jwt);

            // Check if user is logged in and not already authenticated in the context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.validateToken(jwt, userDetails)) {
                    // Creates an authentication token and sets it in the Security Context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities() // Sets the roles (ADMIN/USER)
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (SignatureException | MalformedJwtException | IllegalArgumentException e) {
            // FIX 2: Gracefully handle bad tokens (Signature mismatch or invalid format)
            // This prevents the request from crashing the server with a 500 stack trace.
            // When an invalid token is found, we typically log the issue and let the chain continue
            // (it will eventually fail the .anyRequest().authenticated() check with a 403 or 401).
            System.out.println("JWT Validation Failed: " + e.getMessage());
            // Optionally, you can explicitly send an UNAUTHORIZED response here:
            // response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token.");
            // return;
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}