package com.example.solid.Config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ImageCacheInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        
        // Add caching headers for image requests
        if (requestURI.contains("/product-images/") || requestURI.contains("/images/")) {
            // Cache images for 30 days (2592000 seconds)
            response.setHeader("Cache-Control", "public, max-age=2592000");
            response.setHeader("Expires", String.valueOf(System.currentTimeMillis() + 2592000000L));
        }
        
        // Add compression header
        response.setHeader("Accept-Encoding", "gzip, deflate");
        
        return true;
    }
}
