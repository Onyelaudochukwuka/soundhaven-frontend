import { useMutation } from 'react-query';
import axios from 'axios';

const registerUser = async (userData: { name: string; email: string; password: string }) => {
  const response = await axios.post('/api/register', userData);
  return response.data;
};

export const useRegister = () => {
  return useMutation(registerUser);
};
