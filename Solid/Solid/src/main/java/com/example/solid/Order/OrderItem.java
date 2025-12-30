package com.example.solid.Order;

import com.example.solid.Product.Product;
// --- IMPORT ADDED ---
import com.fasterxml.jackson.annotation.JsonBackReference;
// --- END IMPORT ---
import jakarta.persistence.*;

@Entity
public class OrderItem { // (Fixed a minor typo here: "class  OrderItem")
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    long id;

    @ManyToOne
    private Product product;
    int quantity;
    double price;

    // --- ANNOTATION ADDED ---
    @ManyToOne
    @JoinColumn(name="order_id")
    @JsonBackReference // This stops the infinite loop
    private Order order;
    // --- END ANNOTATION ---

    public OrderItem() {}

    public OrderItem(Product product, int quantity, double price) {
        this.product = product;
        this.quantity = quantity;
        this.price = price;
    }

    public long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

}