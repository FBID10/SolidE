package com.example.solid.Order;

import com.example.solid.Cart.CartItem;
import com.example.solid.Cart.CartItemRepository;
import com.example.solid.Product.Product;
import com.example.solid.Product.ProductRepository;
import com.example.solid.User.User;
import com.example.solid.User.UserRepository;
// --- Import the OrderRequest DTO we defined in the controller ---
import com.example.solid.Order.OrderController.OrderRequest; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;



    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


    public void deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with ID: " + id);
        }
        orderRepository.deleteById(id);
    }


    // --- createOrder Method (UPDATED) ---
    public Order createOrder(Long userId, OrderRequest orderRequest) { // <-- 1. Accept OrderRequest
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found.");
        }
        User user = userOptional.get();

        List<CartItem> cartItems = cartItemRepository.findByUser_userId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot create an order from an empty cart.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(new Date());

        // --- 2. Set the new shipping details on the Order object ---
        order.setShippingFirstName(orderRequest.getFirstName());
        order.setShippingLastName(orderRequest.getLastName());
        order.setShippingEmail(orderRequest.getEmail());
        order.setShippingPhone(orderRequest.getPhone());
        order.setShippingAddress(orderRequest.getAddress());
        // --- 3. Set payment details (method and proof URL) if provided ---
        if (orderRequest.getPaymentMethod() != null) {
            order.setPaymentMethod(orderRequest.getPaymentMethod());
        }
        if (orderRequest.getPaymentProofUrl() != null) {
            order.setPaymentProofUrl(orderRequest.getPaymentProofUrl());
        }
        // --- End of new details ---

        double totalPrice = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product == null) {
                continue;
            }

            OrderItem orderItem = new OrderItem(product, item.getQuantity(), product.getProduct_price());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            totalPrice += product.getProduct_price() * item.getQuantity();
        }

        order.setTotalPrice(totalPrice);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        cartItemRepository.deleteAll(cartItems);

        return savedOrder;
    }
    // --- END UPDATE ---

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUser_userId(userId);
    }

    public Order getOrderById(Long orderId) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        return orderOptional.get();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            throw new RuntimeException("Order not found with ID: " + orderId);
        }
        
        Order order = orderOptional.get();
        order.setStatus(status);
        return orderRepository.save(order);
    }
}