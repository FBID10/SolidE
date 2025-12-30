package com.example.solid.Controller;

import com.example.solid.dto.AuthResponse; // DTO: { String jwtToken }
import com.example.solid.dto.LoginRequest; // DTO: { String email, String password }
import com.example.solid.dto.RegisterRequest; // DTO: { String email, String password, String name }
import com.example.solid.dto.ResetPasswordRequest;
import com.example.solid.dto.ConfirmRegisterRequest;
import com.example.solid.User.AuthService;
import com.example.solid.User.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // New: PRE-REGISTER (create pending record + send code)
    @PostMapping("/pre-register")
    public ResponseEntity<?> preRegister(@RequestBody RegisterRequest request) {
        try {
            authService.initiateRegistration(request);
            return ResponseEntity.ok(Map.of("message", "Verification code sent."));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ise.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Pre-registration failed."));
        }
    }

    // New: CONFIRM-REGISTER (validate code, create user, return JWT)
    @PostMapping("/confirm-register")
    public ResponseEntity<?> confirmRegister(@RequestBody ConfirmRegisterRequest request) {
        try {
            boolean ok;
            var userCreated = authService.confirmRegistration(request);
            ok = userCreated;
            if (!ok) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired code."));
            }
            // Issue JWT so client can skip login
            String jwt = jwtService.generateToken(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Confirmation failed."));
        }
    }

    // Existing REGISTER kept for compatibility
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            var created = authService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ise.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Registration failed due to server error."));
        }
    }

    // RESEND: try pending first, then existing unverified user
    @PostMapping("/resend")
    public ResponseEntity<?> resend(@RequestParam("email") String email) {
        try {
            boolean sent = authService.resendPendingToken(email) || authService.resendVerificationToken(email);
            if (!sent) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Nothing to resend for this email."));
            }
            return ResponseEntity.ok(Map.of("message", "Verification code resent."));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to resend verification code."));
        }
    }

    // 2. POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // STEP 1: Spring checks email/password against database hash
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // STEP 2: If successful, generate JWT token
        String jwt = jwtService.generateToken(authentication.getName());

        // STEP 3: Return the token to the client
        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    // Forgot password: send code to email (always returns OK)
    @PostMapping("/forgot-send-code")
    public ResponseEntity<?> forgotSendCode(@RequestParam("email") String email) {
        try {
            authService.sendPasswordResetCode(email);
            return ResponseEntity.ok(Map.of("message", "If an account exists for this email, a verification code has been sent."));
        } catch (Exception ex) {
            ex.printStackTrace();
            // Still return OK to avoid account enumeration; log internal error
            return ResponseEntity.ok(Map.of("message", "If an account exists for this email, a verification code has been sent."));
        }
    }

    // 3. POST /api/auth/reset-password (now requires token)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            boolean ok = authService.resetPasswordWithToken(request.getEmail(), request.getToken(), request.getPassword());
            if (!ok) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid or expired verification code."));
            }
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ise.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Password reset failed."));
        }
    }

    // 4. GET /api/auth/verify
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        boolean verified = authService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok("Account verified successfully!");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
    }

}