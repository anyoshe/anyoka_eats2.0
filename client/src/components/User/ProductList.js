import React, { useState, useEffect, useContext } from 'react';
import { PartnerContext } from '../../contexts/PartnerContext';
import config from '../../config';
import ReviewsModal from './ReviewsModal';
import styles from './ProductList.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faComments } from '@fortawesome/free-solid-svg-icons';

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
            return `${config.backendUrl}/uploads/${product.primaryImage.split('/uploads/')[1]}`;
        }

        if (product.images && product.images.length > 0) {
            return `${config.backendUrl}/uploads/${product.images[0].split('/uploads/')[1]}`;
        }

        return '/path/to/placeholder-image.jpg';
    };

    return (
        <div className={styles.productListContainer}>
            {Object.keys(productsByCategory).map((category) => (
                <div key={category} className={styles.categorySection}>
                    <h2 className={styles.categoryHeading}>{category}</h2>

                    <div className={styles.productsGrid}>
                        {productsByCategory[category].map((product) => (
                            <div className={styles.productItem} key={product._id}>
                                <img
                                    src={getImageSrc(product)}
                                    alt={product.name}
                                    className={styles.productImagePreview}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/path/to/placeholder-image.jpg';
                                    }}
                                />
                                <div className={styles.productDetails}>
                                    <div className={styles.productField}>
                                        <strong>Name:</strong>
                                        <span>{product.name}</span>
                                    </div>
                                    <div className={styles.productField}>
                                        <strong>Price:</strong>
                                        <span>KSh {product.price}</span>
                                    </div>
                                    <div className={styles.productField}>
                                        <strong>Brand:</strong>
                                        <span>{product.brand}</span>
                                    </div>
                                    <div className={styles.productField}>
                                        <strong>Quantity:</strong>
                                        <span>{product.quantity} {product.unit}</span>
                                    </div>
                                    <div className={styles.productField}>
                                        <strong>Rating:</strong>
                                        <span>{product.ratings?.average?.toFixed(1) || 0} / 5</span>
                                    </div>

                                    <div className={styles.buttonsContainer}>
                                        <button
                                            className={styles.reviewsButton}
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <FontAwesomeIcon icon={faComments} />
                                            {/* {product.ratings?.reviews?.length > 0 && `(${product.ratings.reviews.length})`} */}
                                        </button>

                                        <button
                                            className={styles.editProductButton}
                                            onClick={() => onEditProduct(product)}
                                            title="Edit"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className={styles.deleteProductButton}
                                            onClick={() => onDeleteProduct(product._id)}
                                            title="Delete"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {selectedProduct && (
                <ReviewsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default ProductList;