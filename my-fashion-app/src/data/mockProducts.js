export const mockProducts = [
  // MEN'S PRODUCTS
  {
    product_id: "men-tee-001",
    product_name: "Crew Neck T-Shirt",
    product_price: 3000,
    sale_price: 2800,
    gender: "men",
    category: "Tops",
    product_quantity: 10,
    product_description: "Made from 100% Supima cotton for a soft, luxurious feel.",
    product_image: "/images/products/men-tee-001.png", 
    additional_images: ["/images/products/men-tee-004.jpg", "/images/products/men-tee-005.jpg"],
    product_color: ["Black", "White", "Grey"],
    product_size: ["S", "M", "L", "XL"],
    image_map: {
      "Black": "/images/products/men-tee-001.png",
      "White": "/images/products/men-tee-002.png",
      "Grey": "/images/products/men-tee-004.jpg"
    }
  },
  {
    product_id: "men-chino-001",
    product_name: "Slim Fit Chino Pants",
    product_price: 4500,
    gender: "men",
    category: "Bottoms",
    product_quantity: 90,
    product_description: "Versatile chinos that can be dressed up or down.",
    product_image: "/images/products/men-tee-002.png",
    product_color: ["Beige", "Navy"],
    product_size: ["S", "M", "L", "XL"]
  },

  // WOMEN'S PRODUCTS
  {
    product_id: "wom-jean-001",
    product_name: "High-Waisted Slim Jeans",
    product_price: 3000,
    gender: "women",
    category: "Denim",
    product_quantity: 80,
    product_description: "A flattering high-waisted cut with a hint of stretch.",
    product_image: "/images/products/women-001.png",
    product_color: ["Dark Indigo", "Light Wash"],
    product_size: ["S", "M", "L", "XL"]
  },
  {
    product_id: "wom-dress-001",
    product_name: "Linen A-Line Dress",
    product_price: 1150,
    gender: "women",
    category: "Dresses",
    product_quantity: 0, 
    product_description: "A breathable and elegant linen dress.",
    product_image: "/images/products/women-002.jpg",
    product_color: ["White", "Terracotta"],
    product_size: ["XS", "S", "M", "L"],
    image_map: {
        "White": "/images/products/women-dress-001-white.jpg",
        "Terracotta": "/images/products/women-dress-001-terracotta.jpg"
    }
  },

  // ACCESSORIES
  {
    product_id: "acc-watch-001",
    product_name: "Minimalist Chrono Watch",
    product_price: 1800,
    gender: "men", 
    category: "Watches",
    product_quantity: 50,
    product_description: "A sleek timepiece with a stainless steel case.",
    product_image: "/images/products/accessory-watch.jpg",
    product_color: ["Silver", "Black"],
    product_size: ["One Size"]
  },
  {
    product_id: "acc-bag-001",
    product_name: "Canvas Tote Bag",
    product_price: 4500,
    gender: "women", 
    category: "Bags",
    product_quantity: 120,
    product_description: "Durable and spacious, perfect for daily use.",
    product_image: "/images/products/accessory-bag.jpg",
    product_color: ["Beige", "Black"],
    product_size: ["One Size"]
  }
];