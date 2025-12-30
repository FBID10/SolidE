export const mockOrders = [
  {
    orderId: "SD-1001",
    userId: "user-001",
    status: "In Transit",
    estimatedDelivery: "September 30, 2025",
    items: [
      {
        product_name: "Crew Neck T-Shirt",
        product_image: "/images/products/men-tee-001.png",
        quantity: 1,
      },
    ],
    trackingHistory: [
      {
        timestamp: "2025-09-28T10:30:00.000Z",
        status: "Package has left the sorting facility.",
        location: "Colombo, WP",
      },
      {
        timestamp: "2025-09-28T08:15:00.000Z",
        status: "Package arrived at sorting facility.",
        location: "Colombo, WP",
      },
      {
        timestamp: "2025-09-27T18:00:00.000Z",
        status: "Order confirmed and ready for shipping.",
        location: "Warehouse",
      },
      {
        timestamp: "2025-09-27T17:45:00.000Z",
        status: "Order Placed",
        location: "Online",
      },
    ],
  },
  {
    orderId: "SD-1002",
    userId: "user-001",
    status: "Processing",
    estimatedDelivery: "October 1, 2025",
    items: [
      {
        product_name: "Linen A-Line Dress",
        product_image: "/images/products/women-002.jpg",
        quantity: 1,
      },
       {
        product_name: "Canvas Tote Bag",
        product_image: "/images/products/accessory-bag.jpg",
        quantity: 1,
      },
    ],
    trackingHistory: [
      {
        timestamp: "2025-09-28T09:00:00.000Z",
        status: "Order Placed",
        location: "Online",
      },
    ],
  },
];