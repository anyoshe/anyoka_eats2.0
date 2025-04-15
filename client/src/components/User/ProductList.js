import React, { useState, useEffect, useContext } from 'react';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';
import ReviewsModal from './ReviewsModal';
import './ProductList.css';

const ProductList = ({ onEditProduct, onDeleteProduct, refreshTrigger }) => {
    const [productsByCategory, setProductsByCategory] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { partner } = useContext(PartnerContext);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!partner || !partner._id) {
                console.error('Partner ID is missing. Please log in.');
                return;
            }

            try {
                const response = await fetch(`${config.backendUrl}/api/products?partnerId=${partner._id}`);
                if (response.ok) {
                    const data = await response.json();

                    // Group products by category
                    const groupedProducts = data.products.reduce((acc, product) => {
                        if (!acc[product.category]) {
                            acc[product.category] = [];
                        }
                        acc[product.category].push(product);
                        return acc;
                    }, {});

                    setProductsByCategory(groupedProducts);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch products:', errorText);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [refreshTrigger, partner]);

    const getImageSrc = (product) => {
        if (product.primaryImage) {
            return product.primaryImage.startsWith('http')
                ? product.primaryImage
                : `${config.backendUrl}${product.primaryImage.replace('/var/data', '')}`;
        }

        if (product.images && product.images.length > 0) {
            return `${config.backendUrl}${product.images[0].replace('/var/data', '')}`;
        }

        return '/path/to/placeholder-image.jpg';
    };

    return (
        <div className="product-list-container">
            {Object.keys(productsByCategory).map((category) => (
                <div key={category} className="category-section">
                    {/* Category Heading */}
                    <h2 className="category-heading">{category}</h2>

                    {/* Products Grid */}
                    <div className="products-grid">
                        {productsByCategory[category].map((product) => (
                            <div className="product-item" key={product._id}>
                                <img
                                    src={getImageSrc(product)}
                                    alt={product.name}
                                    className="product-image-preview"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/path/to/placeholder-image.jpg';
                                    }}
                                />
                                <div className="product-details">
                                    <p className="product-name">
                                        <strong>Name:</strong> {product.name}
                                    </p>
                                    <p className="product-price">
                                        <strong>Price:</strong> KSh {product.price}
                                    </p>
                                    <p className="product-brand">
                                        <strong>Brand:</strong> {product.brand}
                                    </p>
                                    <p className="product-quantity">
                                        <strong>Quantity:</strong> {product.quantity} <span>{product.unit}</span>
                                    </p>
                                    <p className="product-rating">
                                        <strong>Rating:</strong> {product.ratings?.average?.toFixed(1) || 0} / 5
                                    </p>
                                    <button
                                        className="reviews-button"
                                        onClick={() => setSelectedProduct(product)} // Open the modal for this product
                                    >
                                        Reviews ({product.ratings?.reviews?.length || 0})
                                    </button>
                                    <div className="buttons-container">
                                        <button
                                            className="edit-product-button"
                                            onClick={() => onEditProduct(product)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-product-button"
                                            onClick={() => onDeleteProduct(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {/* Reviews Modal */}
            {selectedProduct && (
                <ReviewsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)} // Close the modal
                />
            )}
        </div>
    );
};

export default ProductList;