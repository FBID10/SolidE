package com.example.solid.Order;

import com.example.solid.Order.OrderService;
import com.example.solid.User.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // --- DTO for receiving shipping details ---
    // This class maps the JSON from the frontend
    public static class OrderRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String address;
        private String paymentMethod;
        private String paymentProofUrl;

        // Getters are required for Jackson to deserialize the JSON
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAddress() { return address; }
        public String getPaymentMethod() { return paymentMethod; }
        public String getPaymentProofUrl() { return paymentProofUrl; }
    }
    // --- End DTO ---


    // --- Create Order (UPDATED) ---
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createOrder(
            Authentication authentication,
            @RequestBody OrderRequest orderRequest // <-- 1. This line is the fix
    ) {
        try {
            User user = (User) authentication.getPrincipal();
            if (user == null) {
                Map<String, String> errorResponse = Map.of("message", "User not authenticated");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }
            
            // --- 2. Pass user ID and shipping details to the service ---
            Order newOrder = orderService.createOrder(user.getUserId(), orderRequest);
            
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (ClassCastException e) {
            Map<String, String> errorResponse = Map.of("message", "Authentication error");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = Map.of("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    // --- END UPDATE ---

    // Get Orders for a Specific User (Secured with SpEL)
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.userId or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Admin: Get All Orders
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Get Specific Order by ID (User or Admin)
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId, Authentication authentication) {
        try {
            Order order = orderService.getOrderById(orderId); 
            User currentUser = (User) authentication.getPrincipal();

            if (order.getUser().getUserId().equals(currentUser.getUserId()) ||
                authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.ok(order);
            } else {
                Map<String, String> errorResponse = Map.of("message", "Access denied");
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
            }
        } catch (ClassCastException e) {
            Map<String, String> errorResponse = Map.of("message", "Authentication error");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            Map<String, String> errorResponse = Map.of("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    // Admin: Update Order Status
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            if (status == null || status.trim().isEmpty()) {
                Map<String, String> errorResponse = Map.of("message", "Status value is required in the request body.");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            Map<String, String> errorResponse = Map.of("message", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}