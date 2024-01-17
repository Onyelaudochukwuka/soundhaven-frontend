// pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/SidebarLeft';
import MainContent from '../components/layout/MainContent';
import Footer from '../components/layout/Footer';
import { fetchTracks } from '../services/apiService';
import { Track } from '@/types';
import { useUser } from '@/contexts/UserContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Modal from '@/components/Modal';
import NavBar from '@/components/layout/NavBar';

const HomePage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState('');
  const { user } = useUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Function to toggle the login modal
  const toggleLoginModal = () => {
    console.log("Toggling modal, current state:", isLoginModalOpen);
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  const toggleRegisterModal = () => {
    setModalContent(<RegisterForm />);
    setIsLoginModalOpen(!isLoginModalOpen);
  };

  const loadTracks = async () => {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  return (
    <div className='flex-col'>
      <NavBar onLoginClick={toggleLoginModal} onRegisterClick={toggleRegisterModal}>
        <div>Welcome to SoundHaven! Log in to start your own library, comment on tracks, and create playlists.</div>
      </NavBar>


      <div className="flex min-h-screen font-dyslexic">
        <Head>
          <title>SoundHaven</title>
          <meta name="description" content="Discover and manage music with SoundHaven" />
        </Head>

        <Header />
        <div className="bg-red-500 p-4 text-white min-w-32">Anon's Library</div>

        <MainContent tracks={tracks} error={error} loadTracks={loadTracks} />
      </div>
      <Modal isOpen={isLoginModalOpen} onClose={toggleLoginModal}>
        <LoginForm />
      </Modal>
      <Footer />

    </div>
  );
};

export default HomePage;
