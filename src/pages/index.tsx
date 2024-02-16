import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/layout/SidebarLeft';
import MainContent from '../components/layout/MainContent';
import Footer from '../components/layout/Footer';
import { fetchTracks } from '../services/apiService';
import { Track } from '../../types/types';
import { useAuth } from '@/hooks/UseAuth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Modal from '@/components/Modal';
import NavBar from '@/components/layout/NavBar';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("User in HomePage:", user);
  }, [user]);

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

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setIsModalOpen(false); // Close modal
      router.push('/'); // Redirect after successful registration
    }, 2000);
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Simplify the modal handling to directly close after login
  const closeModal = () => {
    setIsModalOpen(false);
    console.log("Closing modal directly.");
  };

  const openModalWithContent = (content: React.ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const openRegistrationModal = () => {
    openModalWithContent(
      <RegisterForm onSuccess={handleRegistrationSuccess} onCloseModal={toggleModal} />
    );
  };

  // Updated to use the direct close function after successful login
  const openLoginModal = () => {
    openModalWithContent(
      <LoginForm onCloseModal={closeModal} />
    );
  };

  const navBarContent = user ? (
    <div>SoundHaven</div>
  ) : (
    <div>Welcome to SoundHaven! Log in to start your own library, comment on tracks, and create playlists.</div>
  );

  return (
    <div className='flex-col'>
      <NavBar
        onLoginClick={openLoginModal}
        onRegisterClick={openRegistrationModal}
      >
        {navBarContent}
      </NavBar>

      <div className="flex min-h-screen">
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
