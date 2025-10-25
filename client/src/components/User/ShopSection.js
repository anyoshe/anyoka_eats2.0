import React, { useState } from 'react';
import styles from './ShopSection.module.css';
import ProductModal from './ProductModal';
import ProductList from './ProductList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../config'; 
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

const ShopSection = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

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
                setRefreshTrigger((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleModalSubmit = () => {
        setModalVisible(false);
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div id="shopContent" className={styles.shopSection}>
            <div className={styles.titleBtn}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        className={styles.searchBar}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                </div>
                <button className={`${styles.addItemButton} open-modal`} onClick={handleAddProduct}>
                    Add Item
                </button>
            </div>

            <ProductModal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleModalSubmit}
                editingProduct={editingProduct}
                onProductUpdated={() => setRefreshTrigger(prev => prev + 1)}
            />

            <ProductList
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                searchTerm={searchTerm}
                refreshTrigger={refreshTrigger}
            />
        </div>
    );
};


export default ShopSection;
