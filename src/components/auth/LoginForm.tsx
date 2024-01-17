import React, { useState } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LoginData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const formMethods = useForm<LoginData>();
  const { register, handleSubmit, formState } = formMethods;
  const { errors } = formState;
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    // Implement your login logic here
    console.log('Manual login with:', data);

    // Simulate login success for demonstration
    setLoginSuccess(true);
    setTimeout(() => {
      console.log('Login successful!');
      router.push('/posts');
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    // Implement Google login logic here
    console.log('Login with Google');
    setTimeout(() => {
      router.push('/posts'); // Redirect after successful login
    }, 1000);
  };

  return (
    <FormProvider {...formMethods}>
      <div className="min-w-[390px] sm-md:w-3/4 md:w-3/4 lg:w-3/4 flex flex-col items-center mb-8">
        {loginSuccess && <div className="text-green-500 mb-4">Login successful!</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="text-center w-3/4">
          <input
            {...register('username', { required: true })}
            type="text"
            placeholder="Username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          />
          <div className="relative">
            <input
              {...register('password', { required: true })}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-gray-600">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button className="bg-blue-500 text-white py-3 rounded-lg font-bold text-xl hover:bg-blue-600 shadow appearance-none border w-full leading-tight focus:outline-none focus:shadow-outline">
            Login
          </button>
        </form>
        <p className="text-center my-8 text-gray-700">
            <b>Or log in with:</b>
        </p>
        <button 
          onClick={handleGoogleLogin} 
          className="google-button p-6 bg-red-500 text-white py-2 rounded-lg shadow appearance-none border leading-tight focus:outline-none focus:shadow-outline flex items-center justify-center"
        >
          <FaGoogle className="mr-2" /> Sign in with Google
        </button>
        <p className="text-center mt-4 text-gray-700">
          <b>
            Don’t have an Account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Sign up.
            </Link>
          </b>
        </p>
      </div>
    </FormProvider>
  );
};

export default LoginForm;
