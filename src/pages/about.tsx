// pages/about.tsx

import React from 'react';
import Header from '../components/layout/SidebarLeft';
import Footer from '../components/layout/Footer';

function AboutPage() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 leading-tight tracking-tighter border-b-2 border-gray-300 pb-2 px-0 py-2">
                    About Us
                </h1>

                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Our Project</h2>
                    <p>
                        Our project is focused on creating a community for developers to share their experiences, 
                        collaborate on projects, and learn from each other. We believe that by building a strong 
                        community, we can push the boundaries of what's possible in tech and create an inclusive 
                        environment for all developers.
                    </p>
                    <p className="mt-4">
                        Over the years, we've seen incredible growth and have had the privilege of helping countless 
                        developers grow their skills, find collaborators for their projects, and even land their dream jobs. 
                        We're excited for you to join our community and can't wait to see what you'll achieve.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AboutPage;
