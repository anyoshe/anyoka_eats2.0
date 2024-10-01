import React, { useState } from 'react';
import './Getquote.css'; 

const QuotationForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        address: '',
        productType: '',
        quantity: '',
        deliveryDate: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission (e.g., send data to an API)
        console.log('Form submitted:', formData);
    };

    return (
        <form className="quotation-form" onSubmit={handleSubmit}>

            <h2 className='quoteHeader'>Quotation Request Form</h2>

            <div className="Quote-form-group">
                <label>Full Name:</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="Quote-form-group">
                <label>Contact Number:</label>
                <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="Quote-form-group">
                <label>Address Location:</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="Quote-form-group">
                <label>Type of Product:</label>
                <input
                    type="text"
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="Quote-form-group">
                <label>Quantity:</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="Quote-form-group">
                <label>Delivery Date:</label>
                <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className="quote-submit-btn">Submit</button>
        </form>
    );
};

export default QuotationForm;
