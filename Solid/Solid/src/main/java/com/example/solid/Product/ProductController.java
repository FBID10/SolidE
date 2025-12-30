package com.example.solid.Product;

import org.springframework.security.access.prepost.PreAuthorize; // Import this
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
// Remove file-related imports
// import org.springframework.web.multipart.MultipartFile;
// import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // --- THIS IS THE REVERTED METHOD ---
    @PreAuthorize("hasRole('ADMIN')") // We add security back
    @PostMapping
    public Product save(@RequestBody Product product) { // Changed back to @RequestBody
        // We call the simple save method
        return productService.save(product);
    }

    // --- OTHER METHODS ---

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Optional<Product> findBYId(@PathVariable long id) {
        return productService.findById(id);
    }
    
    @PreAuthorize("hasRole('ADMIN')") // We add security back
    @PutMapping("/{id}")
    public Product update(@PathVariable long id, @RequestBody Product product) {
        return productService.update(id, product);
    }

    @PreAuthorize("hasRole('ADMIN')") // We add security back
    @DeleteMapping("/{id}")
    public void delete(@PathVariable long id) {
        productService.delete(id);
    }
}