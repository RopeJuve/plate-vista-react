import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);

    useEffect(() => {
        if (!state || !state.cart || state.cart.length === 0) {
            navigate('/main-dish');
        }
    }, [state, navigate]);

    if (!state || !state.cart || state.cart.length === 0) {
        return null;
    }

    const generateOrderNumber = () => {
        return Math.floor(Math.random() * 1000000);
    };

    const orderNumber = generateOrderNumber();

    const handleFeedbackClick = () => {
        setShowFeedbackModal(true);
    };

    const handleHelpClick = () => {
        setShowHelpModal(true);
    };

    const handleReceiptDownload = () => {
        const receiptContent = `
            Order Number: ${orderNumber}
            Table Number: ${state.tableNumber}
            Payment Method: ${state.paymentMethod === 'card' ? 'Card' : state.paymentMethod === 'applePay' ? 'Apple Pay' : 'Cash'}

            Items:
            ${state.cart.map(item => `${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

            Total: $${state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `receipt-${orderNumber}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const submitFeedback = () => {
        // Handle feedback submission logic here (e.g., send to server)
        setShowFeedbackModal(false);
        setShowThankYouModal(true);
    };

    return (
        <div className="bg-gray-700 text-white p-4 rounded-lg max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Order Confirmation</h2>
            <p>Thank you, {state.name}!</p>
            <p>Your order has been placed successfully.</p>
            <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Order Summary:</h3>
                <ul>
                    {state.cart.map((item, index) => (
                        <li key={index}>
                            {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                        </li>
                    ))}
                </ul>
                <div className="mt-2">
                    <strong>Total:</strong> $
                    {state.cart
                        .reduce((acc, item) => acc + item.price * item.quantity, 0)
                        .toFixed(2)}
                </div>
            </div>
            <div className="mt-4">
                <p><strong>Order Number:</strong> #{orderNumber}</p>
                <p><strong>Table Number:</strong> {state.tableNumber}</p>
                <p><strong>Payment Method:</strong> {state.paymentMethod === 'card' ? 'Card' : state.paymentMethod === 'applePay' ? 'Apple Pay' : 'Cash'}</p>
                {(state.paymentMethod === 'card' || state.paymentMethod === 'applePay') && (
                    <div className="mt-4 text-green-500">
                        <p><strong>Payment Status:</strong> Payment Successful</p>
                    </div>
                )}
            </div>
            <div className="mt-4 flex space-x-4">
                <button
                    onClick={handleFeedbackClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                    Feedback
                </button>
                <button
                    onClick={handleHelpClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                    Need Help
                </button>
                <button
                    onClick={handleReceiptDownload}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                    Download Receipt
                </button>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded-lg max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
                        <div className="mb-2">
                            <label className="block text-sm font-medium">Rating:</label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-500'}`}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-medium">Title:</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded-lg bg-gray-700 text-white"
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                placeholder="Enter your review title"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Review (optional):</label>
                            <textarea
                                className="w-full p-2 rounded-lg bg-gray-700 text-white"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Enter your review"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
                                Cancel
                            </button>
                            <button
                                onClick={submitFeedback}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thank You Modal */}
            {showThankYouModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded-lg max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Thank You!</h3>
                        <p>Your feedback has been submitted successfully.</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowThankYouModal(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="bg-gray-800 p-4 rounded-lg max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                        <p>Customer service will reach out to you soon!</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderConfirmation;
