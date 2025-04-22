import React, { useState, useEffect } from 'react';
import styles from './ShopSection.module.css';
import ProductModal from './ProductModal';
import ProductList from './ProductList';
import config from '../../config'; 
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ShopSection = () => {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to refresh the product list
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch products from the database
    const fetchProducts = async () => {
      try {
          const response = await fetch(`${config.backendUrl}/api/products`);
          if (response.ok) {
              const data = await response.json();
              // Sort products by creation date (latest first)
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
        setEditingProduct(null); // Reset editing state
    };

    const handleEditProduct = (product) => {
        setModalVisible(true);
        setEditingProduct(product); // Pass the product to be edited
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`${config.backendUrl}/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Product deleted successfully');
                setRefreshTrigger((prev) => prev + 1); // Trigger a refresh
            } else {
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleModalSubmit = () => {
        setModalVisible(false); // Close the modal
        setRefreshTrigger((prev) => prev + 1); // Trigger a refresh
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

            {/* Product Modal */}
            <ProductModal
                isOpen={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleModalSubmit}
                editingProduct={editingProduct}
                onProductUpdated={fetchProducts}
            />

            {/* Product List */}
            <ProductList
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                refreshTrigger={refreshTrigger} // Pass the refresh trigger
            />
        </div>
    );
};

export default ShopSection;