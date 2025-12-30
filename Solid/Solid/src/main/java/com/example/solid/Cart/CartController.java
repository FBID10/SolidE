package com.example.solid.Cart;

import com.example.solid.User.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // Import Map

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Secured: Only allow the user themselves or an admin to view the cart
    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.userId or hasRole('ADMIN')")
    public ResponseEntity<?> getCartItems(@PathVariable Long userId) {
         try {
             List<CartItem> items = cartService.getCartItemsByUserId(userId);
             return ResponseEntity.ok(items);
         } catch (RuntimeException e) {
             // --- FIX: Return JSON error ---
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
         } catch (Exception e) {
             System.err.println("Unexpected error fetching cart items for user " + userId + ": " + e.getMessage());
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred."));
         }
    }

    // Secured: Only allow the user themselves to add to their cart
    @PostMapping("/add/{userId}")
    @PreAuthorize("isAuthenticated() and #userId == authentication.principal.userId")
    public ResponseEntity<?> addProductToCart(
            @PathVariable Long userId,
            @RequestBody CartRequest request,
            Authentication authentication) { // Authentication helps confirm user

        try {
            CartItem cartItem = cartService.addProductToCart(userId, request.getProductId(), request.getQuantity());
            // Service now throws exceptions if user/product not found
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            // --- FIX: Return JSON error ---
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error adding to cart: " + e.getMessage());
            // --- FIX: Return JSON error ---
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred."));
        }
    }

    // Secured: Only allow the user themselves to update their cart item
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long id, // This ID is the CartItem's database ID
            @RequestBody CartRequest request,
            Authentication authentication) {

        try {
             CartItem existingItem = cartService.getCartItemById(id);
             // Handle null principal gracefully
             Object principal = authentication.getPrincipal();
             if (!(principal instanceof User)) {
                 // --- FIX: Return JSON error ---
                 return new ResponseEntity<>(Map.of("message", "Authentication principal error"), HttpStatus.INTERNAL_SERVER_ERROR);
             }
             User currentUser = (User) principal;

             if (existingItem == null) {
                  // --- FIX: Return JSON error ---
                  return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found."));
             }
             // Check ownership
             if (!existingItem.getUser().getUserId().equals(currentUser.getUserId())) {
                  // --- FIX: Return JSON error ---
                  return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Permission denied to modify this cart item."));
             }

            CartItem updatedItem = cartService.updateCartItem(id, request.getQuantity());
            if (updatedItem != null) {
                 return ResponseEntity.ok(updatedItem); // Update successful
            } else {
                 return ResponseEntity.noContent().build(); // Item was deleted (quantity <= 0)
            }
        } catch (ClassCastException e){
             System.err.println("Error casting principal in updateCartItem: " + e.getMessage());
             // --- FIX: Return JSON error ---
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Authentication error."));
        } catch (RuntimeException e) {
             // --- FIX: Return JSON error ---
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }


    // Secured: Only allow the user themselves to remove their cart item
    @DeleteMapping("/remove/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeProductFromCart(
            @PathVariable Long id, // This ID is the CartItem's database ID
            Authentication authentication) {
         try {
             CartItem existingItem = cartService.getCartItemById(id);
             // Handle null principal gracefully
             Object principal = authentication.getPrincipal();
             if (!(principal instanceof User)) {
                 // --- FIX: Return JSON error ---
                 return new ResponseEntity<>(Map.of("message", "Authentication principal error"), HttpStatus.INTERNAL_SERVER_ERROR);
             }
             User currentUser = (User) principal;

              if (existingItem == null) {
                   // --- FIX: Return JSON error ---
                   return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found."));
              }
              // Check ownership
              if (!existingItem.getUser().getUserId().equals(currentUser.getUserId())) {
                   // --- FIX: Return JSON error ---
                   return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Permission denied to remove this cart item."));
              }

             cartService.removeProductFromCart(id);
             return ResponseEntity.noContent().build(); // Standard success for DELETE
         } catch (ClassCastException e){
             System.err.println("Error casting principal in removeProductFromCart: " + e.getMessage());
             // --- FIX: Return JSON error ---
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Authentication error."));
         } catch (RuntimeException e) {
             // --- FIX: Return JSON error ---
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
         }
    }


    // CartRequest inner class (used for receiving JSON body)
    static class CartRequest {
        private Long productId;
        private int quantity;

        // Getters and Setters are needed for Jackson JSON deserialization
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}