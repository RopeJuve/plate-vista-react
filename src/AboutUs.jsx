import React from 'react';

function AboutUs() {
    return (
        <div className="container mx-auto p-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">About Us</h2>

            <section className="mb-6">
                <h3 className="text-2xl font-semibold">Our Story</h3>
                <p>
                    PlateVista was founded with a passion for delivering mouth-watering dishes to food lovers across the world. 
                    Our mission is to make high-quality food accessible to everyone, offering a wide variety of gourmet dishes 
                    from various cuisines.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-2xl font-semibold">Our Vision & Mission</h3>
                <p>
                    Our vision is to become the go-to destination for food enthusiasts who seek both quality and convenience.
                    Our mission is to provide a delightful dining experience, whether you're ordering in or dining out.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-2xl font-semibold">Meet the Team</h3>
                <p>
                    Our team is composed of experienced chefs, dedicated service staff, and passionate foodies who work 
                    tirelessly to bring you the best dining experience possible. We believe in creating a warm and welcoming 
                    environment for all our customers.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-2xl font-semibold">Our Commitment to Sustainability</h3>
                <p>
                    At PlateVista, we are committed to sustainability and giving back to the community. We strive to source our 
                    ingredients locally and reduce our environmental footprint by using eco-friendly packaging.
                </p>
            </section>
        </div>
    );
}

export default AboutUs;
