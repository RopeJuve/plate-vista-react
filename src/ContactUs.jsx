import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ContactUs() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();  // Initialize the useNavigate hook

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formState);
        setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        navigate('/');  // Redirect to the home page after closing the confirmation
    };

    return (
        <div className="container mx-auto p-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>

            <div className="mb-6">
                <h3 className="text-2xl font-semibold">Location & Hours of Operation</h3>
                <p>123 Food Street, Gourmet City, FC 12345</p>
                <p>Monday - Friday: 9:00 AM - 10:00 PM</p>
                <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
            </div>

            <div className="mb-6">
                <h3 className="text-2xl font-semibold">Contact Information</h3>
                <p>Phone: <a href="tel:+1234567890" className="text-blue-500">+1 234 567 890</a></p>
                <p>Email: <a href="mailto:support@platevista.com" className="text-blue-500">support@platevista.com</a></p>
                <p>
                    Follow us on:
                    <a href="https://facebook.com" className="text-blue-500 ml-2">Facebook</a> |
                    <a href="https://twitter.com" className="text-blue-500 ml-2">Twitter</a> |
                    <a href="https://instagram.com" className="text-blue-500 ml-2">Instagram</a>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-200 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Send Us a Message</h3>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Subject</label>
                    <select
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="">Select a subject...</option>
                        <option value="Support">Support</option>
                        <option value="Sales">Sales</option>
                        <option value="General Inquiry">General Inquiry</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Message</label>
                    <textarea
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    Send Message
                </button>
            </form>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">Thank you for your inquiry!</h3>
                        <p>We will get back to you soon.</p>
                        <button
                            onClick={handleCloseConfirmation}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactUs;
