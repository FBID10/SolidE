package com.example.solid.User;

import com.example.solid.User.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Required method by Spring Security. Fetches the UserDetails
     * (our User entity) object by the username (which is email in our app).
     * * @param email The username provided during login.
     * @return The UserDetails object containing the hashed password and authorities.
     * @throws UsernameNotFoundException if the email is not found in the database.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Use the custom findByEmail method from our UserRepository
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}