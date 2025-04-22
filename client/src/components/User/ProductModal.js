import React, { useState, useContext, useEffect } from 'react';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import styles from './ProductModal.module.css';

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct, onProductUpdated }) => {
    const { partner } = useContext(PartnerContext);
    const [primaryImage, setPrimaryImage] = useState(null);
    const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productBrand, setProductBrand] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productSubCategory, setProductSubCategory] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [productUnit, setProductUnit] = useState('pcs');
    const [productInventory, setProductInventory] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productTags, setProductTags] = useState('');
    const [productImages, setProductImages] = useState([]);
    const [productDiscountedPrice, setProductDiscountedPrice] = useState('');


    useEffect(() => {
        if (editingProduct) {
            setProductName(editingProduct.name || '');
            setProductPrice(editingProduct.price || '');
            setProductBrand(editingProduct.brand || '');
            setProductCategory(editingProduct.category || '');
            setProductSubCategory(editingProduct.subCategory || '');
            setProductQuantity(editingProduct.quantity || '');
            setProductUnit(editingProduct.unit || 'pcs');
            setProductInventory(editingProduct.inventory || '');
            setProductDescription(editingProduct.description || '');
            setProductTags(editingProduct.tags?.join(', ') || '');
            setProductImages(editingProduct.images || []);
            setProductDiscountedPrice(editingProduct.discountedPrice || '');


            // Format image URLs
            const formattedImages = editingProduct.images?.map((image) =>
                image.startsWith('/var/data') // Check if the path is relative
                    ? `${config.backendUrl}${image.replace('/var/data', '')}` // Format relative paths
                    : image // Use absolute URLs as-is
            ) || [];
            setProductImages(formattedImages);
        }

    }, [editingProduct]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        setProductImages((prevImages) => [...prevImages, ...files]);
    };

    // Function to set the primary image
    const handleSetPrimaryImage = (image) => {
        setPrimaryImage(image);
    };

    const handleDeleteImage = (index) => {
        setProductImages((prevImages) => {
            const imageToDelete = prevImages[index];
            if (typeof imageToDelete === 'string') {
                setDeletedImages((prevDeleted) => [...prevDeleted, imageToDelete]); // Track deleted images
            }
            return prevImages.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', productPrice);
        formData.append('brand', productBrand);
        formData.append('category', productCategory);
        formData.append('subCategory', productSubCategory);
        formData.append('quantity', productQuantity);
        formData.append('unit', productUnit);
        formData.append('description', productDescription);
        formData.append('tags', productTags);
        formData.append('inventory', productInventory);
        formData.append('discountedPrice', productDiscountedPrice);


        // Add shopId from PartnerContext
        if (partner && partner._id) {
            formData.append('shopId', partner._id);
        } else {
            console.error('Shop ID not found. Ensure the partner is logged in.');
            return;
        }

        productImages.forEach((image) => {
            if (typeof image !== 'string') {
                formData.append('images', image); // Only append new images
            }
        });
    
        // Append the primary image
        if (primaryImage) {
            formData.append('primaryImage', primaryImage);
        }
    
        // Append deleted images
        if (deletedImages.length > 0) {
            formData.append('deletedImages', JSON.stringify(deletedImages));
        }
    
        try {
            const url = editingProduct
                ? `${config.backendUrl}/api/products/${editingProduct._id}` // Update product
                : `${config.backendUrl}/api/products`;

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log(editingProduct ? 'Product updated successfully:' : 'Product added successfully:', result);

                if (onProductUpdated) {
                    onProductUpdated();
                }
                onClose();
            } else {
                const error = await response.json();
                console.error(editingProduct ? 'Failed to update product:' : 'Failed to add product:', error.message);
            }
        } catch (error) {
            console.error(editingProduct ? 'Error updating product:' : 'Error adding product:', error);
        }
    };

    const resetForm = () => {
        setProductName('');
        setProductPrice('');
        setProductBrand('');
        setProductCategory('');
        setProductSubCategory('');
        setProductQuantity('');
        setProductUnit('pcs');
        setProductInventory('');
        setProductDescription('');
        setProductTags('');
        setProductImages([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOne}>
            <div className={styles.modalContentOne}>

                <span className={styles.closeModalOne} onClick={resetForm}>&times;</span>

                <h2 className={styles.addProductH2}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>

                          <div className={styles.productImagePreviewContainer}>
                    {productImages.map((image, index) => (
                    <div key={index} className={styles.imagePreviewItem}>
                        <img
                        className={styles.productImagePreview}
                        src={
                                   
                                        typeof image === 'string'
                                          ? `${config.backendUrl}${image.replace('/mnt/shared/Projects/anyoka_eats2.0/online_hotel', '')}`
                                          : URL.createObjectURL(image)
                                      }
                                      
                                    alt={`Product ${index + 1}`}
                                />
                                 <div className={styles.imageBtns}>
                            <button
                            type="button"
                            className={styles.setPrimaryImageButton}
                            onClick={() => handleSetPrimaryImage(image)}
                            >
                            {image === primaryImage ? 'Primary' : 'Set Primary'}
                            </button>
                                {/* Delete Button */}
                                <button
                            type="button"
                            className={styles.deleteImageButton}
                            onClick={() => handleDeleteImage(index)}
                            >
                            &times;
                            </button>
                        </div>
                    </div>
                        ))}
                    </div>
                    
                <label className={`${styles.productImageLabel} ${styles.productLabel}`}>Images:</label>
                

                <input
                    type="file"
                    className={`${styles.productImageInput} ${styles.formInput}`}
                    id='productImageInput'
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                />
                 <form className={styles.productForm} onSubmit={handleSubmit}>
                    
                    <div className={styles.formGroup}>
                        <label className={`${styles.productNameLabel} ${styles.productLabel}`}>Name:</label>
                        <input
                        type="text"
                        className={`${styles.productNameInput} ${styles.formInput}`}
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productPriceLabel} ${styles.productLabel}`}>Price:</label>
                        <input
                        type="number"
                        className={`${styles.productPriceInput} ${styles.formInput}`}
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        step="0.01"
                        required
                        />
                    </div>
                    <div className={styles.formGroup}>
                    <label className={`${styles.productPriceLabel} ${styles.productLabel}`}>Discounted Price:</label>
                    <input
                        type="number"
                        className={`${styles.productPriceInput} ${styles.formInput}`}
                        value={productDiscountedPrice}
                        onChange={(e) => setProductDiscountedPrice(e.target.value)}
                         placeholder="e.g., 250"
                    />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={`${styles.productBrandLabel} ${styles.productLabel}`}>Brand:</label>
                        <input
                        type="text"
                        className={`${styles.productBrandInput} ${styles.formInput}`}
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productCategoryLabel} ${styles.productLabel}`}>Category:</label>
                        <input
                        type="text"
                        id="productCategoryInput"
                        className={`${styles.productCategoryInput} ${styles.formInput}`}
                        list="productCategories"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="Select a category"
                        required
                        />
                        <datalist id="productCategories">
                        <option value="Electronics" />
                        <option value="Fashion" />
                        <option value="Home & Kitchen" />
                        <option value="Beauty & Personal Care" />
                        <option value="Sports & Outdoors" />
                        <option value="Food" />
                        <option value="Toys And Games" />
                        <option value="Health" />
                        <option value="Pet Supplies" />
                        </datalist>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productSubcategoryLabel} ${styles.productLabel}`}>Subcategory:</label>
                        <input
                        type="text"
                        className={`${styles.productSubcategoryInput} ${styles.formInput}`}
                        value={productSubCategory}
                        onChange={(e) => setProductSubCategory(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productQuantityLabel} ${styles.productLabel}`}>Quantity:</label>
                        <input
                        type="number"
                        className={`${styles.productQuantityInput} ${styles.formInput}`}
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                        required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productUnitLabel} ${styles.productLabel}`}>Unit:</label>
                        <select
                        className={`${styles.productUnitSelect} ${styles.formInput}`}
                        value={productUnit}
                        onChange={(e) => setProductUnit(e.target.value)}
                        required
                        >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="grams">Grams</option>
                        <option value="unit">Unit</option>
                        <option value="set">Set</option>
                        <option value="plate">plate</option>
                        <option value="other">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productInventoryLabel} ${styles.productLabel}`}>Total Inventory:</label>
                        <input
                        type="number"
                        className={`${styles.productInventoryInput} ${styles.formInput}`}
                        value={productInventory}
                        onChange={(e) => setProductInventory(e.target.value)}
                        required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={`${styles.productTagsLabel} ${styles.productLabel}`}>Tags (comma-separated):</label>
                        <input
                        type="text"
                        className={`${styles.productTagsInput} ${styles.formInput}`}
                        value={productTags}
                        onChange={(e) => setProductTags(e.target.value)}
                        />
                    </div>

                    <div id='descFormGroup' className={styles.formGroup}>
                        <label className={`${styles.productDescriptionLabel} ${styles.productLabel}`}>Description:</label>
                        <textarea
                        className={`${styles.productDescriptionInput} ${styles.formInput}`}
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        required
                        />
                    </div>
                    <button type="submit" className={styles.submitProductButton}>
                        {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                </form>

                
            </div>
        </div>
    );
};

export default ProductModal;