package com.example.solid.Product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long product_id;
    private String product_name;
    private double product_price;
    private String gender;
    private String category;
    private int product_quantity;
    @Column(columnDefinition = "TEXT")
    private String product_description;

    // Multiple images
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    private List<String> product_images = new ArrayList<>();

    // Multiple colors
    @ElementCollection
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    private List<String> product_colors = new ArrayList<>();

    // Multiple sizes
    @ElementCollection
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    private List<String> product_sizes = new ArrayList<>();

    // Backward-compatible single-value accessor (returns first image if available)
    public String getProduct_image(){
        return (product_images != null && !product_images.isEmpty()) ? product_images.get(0) : null;
    }
    public void setProduct_image(String product_image){
        if (this.product_images == null) this.product_images = new ArrayList<>();
        this.product_images.clear();
        if (product_image != null && !product_image.isEmpty()) this.product_images.add(product_image);
    }

    public long getProduct_id(){
        return product_id;
    }
    public void setProduct_id(long product_id){
        this.product_id = product_id;
    }

    public String getProduct_name(){
        return product_name;
    }
    public void setProduct_name(String product_name){
        this.product_name = product_name;
    }

    public double getProduct_price(){
        return product_price;
    }
    public void setProduct_price(double product_price){
        this.product_price = product_price;
    }

    public int getProduct_quantity(){
        return product_quantity;
    }
    public void setProduct_quantity(int product_quantity){
        this.product_quantity = product_quantity;
    }

    public String getProduct_description(){
        return product_description;
    }
    public void setProduct_description(String product_description){
        this.product_description = product_description;
    }

    // New collection accessors
    public List<String> getProduct_images() {
        return product_images;
    }
    public void setProduct_images(List<String> product_images) {
        this.product_images = product_images;
    }

    public List<String> getProduct_colors() {
        return product_colors;
    }
    public void setProduct_colors(List<String> product_colors) {
        this.product_colors = product_colors;
    }

    public List<String> getProduct_sizes() {
        return product_sizes;
    }
    public void setProduct_sizes(List<String> product_sizes) {
        this.product_sizes = product_sizes;
    }

    // Corrected getters and setters for gender and category
    public String getGender(){
        return gender;
    }
    public void setGender(String gender){
        this.gender = gender;
    }

    public String getCategory(){
        return category;
    }
    public void setCategory(String category){
        this.category = category;
    }

    // Backward-compatible size/color single-value accessors (return CSV if needed)
    public String getProduct_color(){
        return (product_colors != null && !product_colors.isEmpty()) ? String.join(",", product_colors) : null;
    }
    public void setProduct_color(String product_color){
        if (this.product_colors == null) this.product_colors = new ArrayList<>();
        this.product_colors.clear();
        if (product_color != null && !product_color.isEmpty()) this.product_colors.add(product_color);
    }

    public String getProduct_size(){
        return (product_sizes != null && !product_sizes.isEmpty()) ? String.join(",", product_sizes) : null;
    }
    public void setProduct_size(String product_size){
        if (this.product_sizes == null) this.product_sizes = new ArrayList<>();
        this.product_sizes.clear();
        if (product_size != null && !product_size.isEmpty()) this.product_sizes.add(product_size);
    }
}