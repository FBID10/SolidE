package com.example.solid.Product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
// Remove file-related imports
// import org.springframework.web.multipart.MultipartFile;
// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
// import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // --- The saveWithImage method and UPLOAD_DIR have been DELETED ---

    // --- EXISTING METHODS (All still valid) ---

    public Optional<Product> findById(long id) {
        return productRepository.findById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product update(long id, Product UDProducts) {
        Optional<Product> ExistingProduct = productRepository.findById(id);
        if (ExistingProduct.isPresent()) {
            Product product = ExistingProduct.get();
            product.setProduct_price(UDProducts.getProduct_price());
            product.setProduct_name(UDProducts.getProduct_name());
            product.setProduct_description(UDProducts.getProduct_description());
            product.setCategory(UDProducts.getCategory());
            product.setProduct_quantity(UDProducts.getProduct_quantity());
            // Copy collections (images, colors, sizes) if provided
            if (UDProducts.getProduct_images() != null) {
                product.setProduct_images(UDProducts.getProduct_images());
            }
            if (UDProducts.getProduct_colors() != null) {
                product.setProduct_colors(UDProducts.getProduct_colors());
            }
            if (UDProducts.getProduct_sizes() != null) {
                product.setProduct_sizes(UDProducts.getProduct_sizes());
            }
            return productRepository.save(product);
        }
        return null;
    }

    // This is the method our controller now calls
    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void delete(long id) {
        productRepository.deleteById(id);
    }
}