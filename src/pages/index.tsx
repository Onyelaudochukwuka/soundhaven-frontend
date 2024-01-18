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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // Function to open the modal with specific content
  const openModalWithContent = (content: React.ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const loadTracks = async () => {
    try {
      const fetchedTracks = await fetchTracks();
      setTracks(fetchedTracks);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  return (
    <div className='flex-col'>
      <NavBar 
        onLoginClick={() => openModalWithContent(<LoginForm />)} 
        onRegisterClick={() => openModalWithContent(<RegisterForm />)}
      >
        <div>Welcome to SoundHaven! Log in to start your own library, comment on tracks, and create playlists.</div>
      </NavBar>

      <div className="flex min-h-screen font-dyslexic">
        <Head>
          <title>SoundHaven</title>
          <meta name="description" content="Discover and manage music with SoundHaven" />
        </Head>

        <Header />
        <div className="bg-red-500 p-4 text-white min-w-32">Anon&apos;s Library</div>
        <MainContent tracks={tracks} error={error} loadTracks={loadTracks} />
      </div>

      <Modal isOpen={isModalOpen} onClose={toggleModal}>
        {modalContent}
      </Modal>

      <Footer />
    </div>
  );
};

export default HomePage;
