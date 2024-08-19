import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ cart }) => {
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        navigate('/checkout', { state: { cart } });
    };

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 shadow-md">
            <h2 className="text-xl mb-4">Order Summary</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cart.map(item => (
                        <li key={item.id}>
                            {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                        </li>
                    ))}
                </ul>
            )}
            <p className="mt-4 font-bold">Total: ${totalPrice.toFixed(2)}</p>
            <button 
                onClick={handleCheckout}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4">
                Proceed to Checkout
            </button>
        </div>
    );
};

export default OrderSummary;