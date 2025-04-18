import React, { useState, useEffect } from 'react';
import styles from './ShopSection.module.css';
import ProductModal from './ProductModal';
import ProductList from './ProductList';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../config'; 

const ShopSection = () => {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${config.backendUrl}/api/products`);
            if (response.ok) {
                const data = await response.json();
                const sortedProducts = data.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setProducts(sortedProducts);
            } else {
                console.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = () => {
        setModalVisible(true);
        setEditingProduct(null);
    };

    const handleEditProduct = (product) => {
        setModalVisible(true);
        setEditingProduct(product);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Product deleted successfully');
                setRefreshTrigger((prev) => prev + 1);
            } else {
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleModalSubmit = () => {
        setModalVisible(false);
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div id="shopContent" className={styles.shopSection}>
            <div className={styles.titleBtn}>
                <button className={`${styles.addItemButton} open-modal`} onClick={handleAddProduct}>
                    Add Item
                </button>
            </div>

            <ProductModal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleModalSubmit}
                editingProduct={editingProduct}
                onProductUpdated={fetchProducts}
            />

            <ProductList
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                refreshTrigger={refreshTrigger}
            />
        </div> 
    );
};

export default ShopSection;
