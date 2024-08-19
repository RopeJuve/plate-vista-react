// src/OrderNow.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderNow = ({ cart, userName }) => {
    const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
    const navigate = useNavigate();

    const handleOrderNowClick = () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to your cart.');
            return;
        }
        setIsCartPreviewOpen(!isCartPreviewOpen);
    };

    const proceedToCheckout = () => {
        setIsCartPreviewOpen(false); // Close the cart preview
        navigate('/checkout', { state: { cart, userName } });
    };

    return (
        <div>
            <button
                onClick={handleOrderNowClick}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full mt-4 fixed bottom-10 right-10">
                Order Now
            </button>

            {isCartPreviewOpen && (
                <div className="fixed bottom-20 right-10 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-64">
                    <h3 className="text-lg font-bold mb-2">Cart Preview</h3>
                    {userName && <p className="mb-2">Hello, {userName}!</p>}
                    {cart.map((item, index) => (
                        <div key={index} className="flex justify-between mb-1">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-700 mt-2 pt-2">
                        <strong>Total:</strong> ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </div>
                    <button 
                        onClick={proceedToCheckout}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 w-full">
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderNow;
