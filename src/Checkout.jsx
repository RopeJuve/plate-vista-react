// src/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const cart = state?.cart || [];

    const [name, setName] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '' });

    const handleOrder = () => {
        if (name === '' || tableNumber === '' || paymentMethod === '') {
            alert('Please fill out all fields.');
            return;
        }

        if (paymentMethod === 'card' && (cardDetails.cardNumber === '' || cardDetails.expiryDate === '' || cardDetails.cvv === '')) {
            alert('Please fill out all card details.');
            return;
        }

        navigate('/order-confirmation', {
            state: {
                cart,
                name,
                tableNumber,
                paymentMethod,
                cardDetails: paymentMethod === 'card' ? cardDetails : null,
            }
        });
    };

    const handleCardDetailChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({ ...cardDetails, [name]: value });
    };

    if (!cart.length) {
        return (
            <div className="bg-gray-700 text-white p-4 rounded-lg">
                <h2 className="text-xl mb-4">Checkout</h2>
                <p>Your cart is empty. Please add items to your cart.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-700 text-white p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="text-xl mb-4">Checkout</h2>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white"
                    placeholder="Enter your name"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Table Number:</label>
                <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-800 text-white"
                    placeholder="Enter your table number"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Payment Method:</label>
                <div className="flex flex-col space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            className="form-radio text-green-500"
                        />
                        <span className="ml-2">Cash</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="form-radio text-green-500"
                        />
                        <span className="ml-2">Card</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="applePay"
                            checked={paymentMethod === 'applePay'}
                            onChange={() => setPaymentMethod('applePay')}
                            className="form-radio text-green-500"
                        />
                        <span className="ml-2">Apple Pay</span>
                    </label>
                </div>
            </div>

            {paymentMethod === 'card' && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-bold mb-2">Card Details</h3>
                    <div className="mb-2">
                        <label className="block text-sm mb-1">Card Number:</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardDetailChange}
                            className="w-full p-2 rounded-lg bg-gray-900 text-white"
                            placeholder="Enter your card number"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <div className="flex-1">
                            <label className="block text-sm mb-1">Expiry Date:</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleCardDetailChange}
                                className="w-full p-2 rounded-lg bg-gray-900 text-white"
                                placeholder="MM/YY"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm mb-1">CVV:</label>
                            <input
                                type="text"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleCardDetailChange}
                                className="w-full p-2 rounded-lg bg-gray-900 text-white"
                                placeholder="CVV"
                            />
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={handleOrder}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4">
                Place Order
            </button>
        </div>
    );
};

export default Checkout;
