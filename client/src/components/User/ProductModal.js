import React, { useState, useContext, useEffect } from 'react';
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext';
import './AccountPage.css';

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct, onProductUpdated }) => {
    const { partner } = useContext(PartnerContext);
    const [primaryImage, setPrimaryImage] = useState(null);
    const [deletedImages, setDeletedImages] = useState([]); // Track deleted images
    // State for product fields
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


    // Prefill fields when editingProduct changes
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
        <div className="modal-one">
            <div className="modal-content-one">
                <span className="close-modal-one" onClick={resetForm}>&times;</span>
                <h2 className="addProductH2">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <form className="product-form" onSubmit={handleSubmit}>
                    {/* Product Image */}
                    <label className="product-image-label product-label">Product Images:</label>
                    <input
                        type="file"
                        className="product-image-input formInput"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                    />
                    <div className="product-image-preview-container">
                        {productImages.map((image, index) => (
                            <div key={index} className="image-preview-item">
                                <img
                                    className="product-image-preview"
                                    // src={
                                    //     typeof image === 'string'
                                    //         ? image // Use the URL directly for existing images
                                    //         : URL.createObjectURL(image) // Create a preview for newly added images
                                    // }
                                    src={
                                        typeof image === 'string'
                                          ? `${config.backendUrl}${image.replace('/mnt/shared/Projects/anyoka_eats2.0/online_hotel', '')}`
                                          : URL.createObjectURL(image)
                                      }
                                      
                                    alt={`Product ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    className="set-primary-image-button"
                                    onClick={() => handleSetPrimaryImage(image)}
                                >
                                    {image === primaryImage ? 'Primary' : 'Set as Primary'}
                                </button>
                                {/* Delete Button */}
                                <button
                                    type="button"
                                    className="delete-image-button"
                                    onClick={() => handleDeleteImage(index)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Product Name */}
                    <label className="product-name-label product-label">Product Name:</label>
                    <input
                        type="text"
                        className="product-name-input formInput"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />

                    {/* Product Price */}
                    <label className="product-price-label product-label">Price:</label>
                    <input
                        type="number"
                        className="product-price-input formInput"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        step="0.01"
                        required
                    />

                    {/* Discounted Price */}
                    <label className="product-price-label product-label">Discounted Price:</label>
                    <input
                        type="number"
                        className="product-price-input formInput"
                        value={productDiscountedPrice}
                        onChange={(e) => setProductDiscountedPrice(e.target.value)}
                         placeholder="e.g., 250"
                    />

                    {/* Product Brand */}
                    <label className="product-brand-label product-label">Brand:</label>
                    <input
                        type="text"
                        className="product-brand-input formInput"
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        required
                    />

                    {/* Product Category */}
                    <label className="product-category-label product-label">Category:</label>
                    <input
                        type="text"
                        id="productCategoryInput"
                        className="product-category-input formInput"
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

                    {/* Product Subcategory */}
                    <label className="product-subcategory-label product-label">Subcategory:</label>
                    <input
                        type="text"
                        className="product-subcategory-input formInput"
                        value={productSubCategory}
                        onChange={(e) => setProductSubCategory(e.target.value)}
                    />

                    {/* Product Quantity */}
                    <label className="product-quantity-label product-label">Quantity:</label>
                    <input
                        type="number"
                        className="product-quantity-input formInput"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                        required
                    />

                    {/* Measurement Unit */}
                    <label className="product-unit-label product-label">Unit:</label>
                    <select
                        className="product-unit-select formInput"
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

                    {/* Inventory */}
                    <label className="product-inventory-label product-label">Total Inventory:</label>
                    <input
                        type="number"
                        className="product-inventory-input formInput"
                        value={productInventory}
                        onChange={(e) => setProductInventory(e.target.value)}
                        required
                    />

                    {/* Product Description */}
                    <label className="product-description-label product-label">Description:</label>
                    <textarea
                        className="product-description-input formInput"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                    />

                    {/* Product Tags */}
                    <label className="product-tags-label product-label">Tags (comma-separated):</label>
                    <input
                        type="text"
                        className="product-tags-input formInput"
                        value={productTags}
                        onChange={(e) => setProductTags(e.target.value)}
                    />

                    <button type="submit" className="submit-product-button">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;