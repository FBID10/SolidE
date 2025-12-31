package com.example.solid.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ImageService {

    /**
     * Normalize image URLs for frontend consumption.
     * Handles both external URLs and relative paths.
     */
    public String normalizeImageUrl(String imagePath) {
        if (imagePath == null || imagePath.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = imagePath.trim();
        
        // If already a full URL, return as-is
        if (trimmed.matches("^https?://.*")) {
            return trimmed;
        }
        
        // Try to parse JSON array
        if (trimmed.startsWith("[")) {
            try {
                // If stored as JSON array, extract first element
                String json = trimmed.substring(1, trimmed.indexOf("]"));
                String firstUrl = json.split(",")[0].replaceAll("\"", "").trim();
                return normalizeImageUrl(firstUrl);
            } catch (Exception e) {
                return null;
            }
        }
        
        // Return as-is if it's already a valid path
        return trimmed;
    }

    /**
     * Add image caching headers and optimization hints
     */
    public void applyImageOptimization() {
        // This can be extended to add image compression, sizing, etc.
    }
}
