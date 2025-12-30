package com.example.solid.Cart;

import com.example.solid.Product.Product;
import com.example.solid.User.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByProduct(Product product);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    List<CartItem> findByUser_userId(Long userId);
    List<CartItem> findByUser(User user);
}