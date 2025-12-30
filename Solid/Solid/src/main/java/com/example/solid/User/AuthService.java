package com.example.solid.User;

import com.example.solid.dto.ConfirmRegisterRequest;
import com.example.solid.dto.RegisterRequest;
import com.example.solid.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository tokenRepository;
    private final PendingRegistrationRepository pendingRepository;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       VerificationTokenRepository tokenRepository,
                       PendingRegistrationRepository pendingRepository,
                       EmailService emailService,
                       PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.pendingRepository = pendingRepository;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    // Pre-register (do not create user yet) and email a 6-digit code
    public void initiateRegistration(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalStateException("User with email " + request.getEmail() + " already exists.");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        String token = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);

        PendingRegistration pending = pendingRepository.findByEmail(request.getEmail())
                .orElse(new PendingRegistration(request.getEmail(), hashedPassword, request.getName(), token, expiry));
        pending.setPasswordHash(hashedPassword);
        pending.setName(request.getName());
        pending.setToken(token);
        pending.setExpiryDate(expiry);
        pendingRepository.save(pending);

        emailService.sendEmail(pending.getEmail(), "Complete Registration!", "Your verification code is: " + token);
        System.out.println("[AuthService] Pre-register: code " + token + " for " + pending.getEmail());
    }

    // Confirm registration with email + token; create user and enable it
    public boolean confirmRegistration(ConfirmRegisterRequest request) {
        String inEmail = request.getEmail() == null ? "" : request.getEmail().trim();
        String inToken = request.getToken() == null ? "" : request.getToken().trim();

        System.out.println("[AuthService] confirmRegistration called for email='" + inEmail + "' token='" + inToken + "'");

        // Try PendingRegistration flow first
        Optional<PendingRegistration> pendingOpt = pendingRepository.findByEmail(inEmail);
        if (pendingOpt.isPresent()) {
            PendingRegistration pending = pendingOpt.get();
            System.out.println("[AuthService] Found pending registration for " + pending.getEmail() + " (token=" + pending.getToken() + ")");
            if (pending.getExpiryDate().isBefore(LocalDateTime.now())) {
                System.out.println("[AuthService] Pending registration expired for " + pending.getEmail());
                return false;
            }
            if (!pending.getToken().trim().equals(inToken)) {
                System.out.println("[AuthService] Pending registration token mismatch: expected='" + pending.getToken() + "' provided='" + inToken + "'");
                return false;
            }

            User user = new User(pending.getEmail(), pending.getPasswordHash(), pending.getName(), UserRole.ROLE_USER);
            user.activate();
            userRepository.save(user);
            pendingRepository.delete(pending);
            System.out.println("[AuthService] Pending registration confirmed and user created: " + user.getEmail());
            return true;
        }

        // Fall back to VerificationToken flow
        VerificationToken vt = tokenRepository.findByToken(inToken);
        if (vt == null) {
            System.out.println("[AuthService] No VerificationToken found for token='" + inToken + "'");
            return false;
        }
        if (vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            System.out.println("[AuthService] VerificationToken expired for token='" + inToken + "'");
            return false;
        }
        User user = vt.getUser();
        if (user == null) {
            System.out.println("[AuthService] VerificationToken has no associated user for token='" + inToken + "'");
            return false;
        }
        if (!user.getEmail().equalsIgnoreCase(inEmail)) {
            System.out.println("[AuthService] Email mismatch: token belongs to '" + user.getEmail() + "' but confirmation attempted for '" + inEmail + "'");
            return false;
        }

        user.setVerified(true);
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(vt);
        System.out.println("[AuthService] VerificationToken used and user enabled: " + user.getEmail());
        return true;
    }

    // Resend code for pending registrations
    public boolean resendPendingToken(String email) {
        Optional<PendingRegistration> pendingOpt = pendingRepository.findByEmail(email);
        if (pendingOpt.isEmpty()) return false;
        PendingRegistration pending = pendingOpt.get();
        String token = String.format("%06d", new Random().nextInt(999999));
        pending.setToken(token);
        pending.setExpiryDate(LocalDateTime.now().plusHours(24));
        pendingRepository.save(pending);
        emailService.sendEmail(pending.getEmail(), "Complete Registration!", "Your verification code is: " + token);
        System.out.println("[AuthService] Resent pending code " + token + " to " + pending.getEmail());
        return true;
    }

    // Registers a new user then emails a verification code (legacy path)
    public User registerUser(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalStateException("User with email " + request.getEmail() + " already exists.");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(request.getEmail(), hashedPassword, request.getName(), UserRole.ROLE_USER);
        userRepository.save(newUser);

        String token = String.format("%06d", new Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(token, newUser);
        tokenRepository.save(verificationToken);
        emailService.sendEmail(newUser.getEmail(), "Complete Registration!", "Your verification code is: " + token);
        System.out.println("[AuthService] Sent verification code " + token + " to " + newUser.getEmail());
        return newUser;
    }

    public boolean verifyUser(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) return false;
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) return false;
        User user = verificationToken.getUser();
        user.setVerified(true);
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);
        return true;
    }

    // Simple password update by email (no code)
    public void updatePassword(String email, String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalStateException("User with email " + email + " not found.");
        }
        User user = userOpt.get();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Resend verification token for unverified users
    public boolean resendVerificationToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        if (user.isEnabled() || user.isVerified()) return false;
        VerificationToken vt = tokenRepository.findByUser(user);
        String token = String.format("%06d", new Random().nextInt(999999));
        if (vt == null) {
            vt = new VerificationToken(token, user);
        } else {
            vt.setToken(token);
            vt.setExpiryDate(LocalDateTime.now().plusMinutes(60 * 24));
        }
        tokenRepository.save(vt);
        emailService.sendEmail(user.getEmail(), "Complete Registration!", "Your verification code is: " + token);
        System.out.println("[AuthService] Re-sent verification code " + token + " to " + user.getEmail());
        return true;
    }

    // Forgot password: send 6-digit code to email (silently ignore non-existing emails)
    public void sendPasswordResetCode(String email) {
        String inEmail = email == null ? "" : email.trim();
        Optional<User> userOpt = userRepository.findByEmail(inEmail);
        if (userOpt.isEmpty()) {
            System.out.println("[AuthService] Password reset requested for non-existing email: " + inEmail);
            return; // Don't reveal existence
        }
        User user = userOpt.get();
        String token = String.format("%06d", new Random().nextInt(999999));
        PasswordResetToken prt = passwordResetTokenRepository.findByUser(user);
        if (prt == null) {
            prt = new PasswordResetToken(user, token);
        } else {
            prt.setToken(token);
            prt.setExpiryDate(LocalDateTime.now().plusHours(24));
        }
        passwordResetTokenRepository.save(prt);
        emailService.sendEmail(user.getEmail(), "Password Reset Code", "Your password reset code is: " + token);
        System.out.println("[AuthService] Sent password reset code " + token + " to " + user.getEmail());
    }

    // Confirm reset with email + token and set new password
    public boolean resetPasswordWithToken(String email, String token, String newPassword) {
        String inEmail = email == null ? "" : email.trim();
        String inToken = token == null ? "" : token.trim();
        Optional<User> userOpt = userRepository.findByEmail(inEmail);
        if (userOpt.isEmpty()) {
            System.out.println("[AuthService] resetPasswordWithToken - user not found for email=" + inEmail);
            return false;
        }
        User user = userOpt.get();
        PasswordResetToken prt = passwordResetTokenRepository.findByUser(user);
        if (prt == null) {
            System.out.println("[AuthService] resetPasswordWithToken - no reset token for user=" + inEmail);
            return false;
        }
        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            System.out.println("[AuthService] resetPasswordWithToken - token expired for user=" + inEmail);
            return false;
        }
        if (!prt.getToken().trim().equals(inToken)) {
            System.out.println("[AuthService] resetPasswordWithToken - token mismatch: expected='" + prt.getToken() + "' provided='" + inToken + "'");
            return false;
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(prt);
        System.out.println("[AuthService] Password reset successful for " + user.getEmail());
        return true;
    }
}