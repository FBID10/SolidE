import React, { useState, useEffect } from "react";
import "./Card.css";
import { getImageUrl } from '../../data/imageUtils.js';
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const addToCart = async () => {
        try {
            const response = await fetch("http://localhost:9090/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: product.product_id,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add item to cart.");
            }

            const data = await response.json();
            console.log("Item added to cart:", data);
            alert("Product added to cart!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Error adding product to cart.");
        }
    };

    const handleBuyNow = async () => {
        try {
            const response = await fetch("http://localhost:9090/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: product.product_id,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add item to cart.");
            }

            navigate("/checkout");

        } catch (error) {
            console.error("Error during Buy Now:", error);
            alert("Could not proceed to checkout. Please try again.");
        }
    };

    return (
        <div className="product-card">
            <img
                src={ product.product_image ? getImageUrl(product.product_image) : '/vite.svg' }
                alt={product.product_name}
                className="product-image"
                onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/vite.svg'}}
            />
            <div className="product-info">
                <h3 className="product-name">{product.product_name}</h3>
                <p className="product-description">{product.product_description}</p>
                <p className="product-price">Rs {product.product_price}</p>
                <div className="product-card-actions">
                    <button className="add-to-cart-button" onClick={addToCart}>
                        Add to Cart
                    </button>
                    <button className="buy-now-button" onClick={handleBuyNow}>
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

const Card = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        fetch("http://localhost:9090/api/products")
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                if (isMounted) setCards(data);
            })
            .catch((err) => {
                if (isMounted) setError(err.message);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {cards.map((product) => (
                <ProductCard key={product.product_id} product={product} />
            ))}
        </div>
    );
};

export default Card;