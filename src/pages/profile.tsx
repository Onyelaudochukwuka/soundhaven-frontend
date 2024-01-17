import React from 'react';
import Header from '../components/layout/SidebarLeft';
import Footer from '../components/layout/Footer';
import UserProfile from '../components/user/UserProfile';
import { PostProps, UserProps } from '../../types';
import postDataRaw from '../components/PostsData.json';
import { getAuthor } from '../components/utils/authorUtils';

const Profile: React.FC = () => {
    const postData: PostProps[] = postDataRaw.posts;
    const firstPostAuthorId = postData[0].author.userId;

    // Get the full author data using the utility function
    const authorData: UserProps | undefined = getAuthor(firstPostAuthorId);
    if (!authorData) {
        throw new Error('Author data not found for given userId');
    }

    // Extract all posts for the given user
    const userPosts = postData.filter(post => post.author.userId === firstPostAuthorId);

    const userProfileData = {
        ...authorData,
        posts: userPosts
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="py-12 px-4 container mx-auto bg-white shadow rounded-md">
                <h1 className="text-3xl mb-8 border-b pb-4">Profile Page</h1>
                <UserProfile user={userProfileData} />
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
