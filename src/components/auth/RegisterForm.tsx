import React, { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import { FaGoogle } from 'react-icons/fa';
import { AuthContext } from '@/contexts/AuthContext';
import { register as registerUser } from '@/services/apiService';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<RegisterData>();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [registerError, setRegisterError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // New state for success

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setRegisterError("Passwords don't match");
      return;
    }
  
    if (!authContext) {
      console.error('Auth context is not available');
      return;
    }
  
    try {
      const result = await registerUser(data.name, data.email, data.password);
      authContext.login(result.user, result.accessToken);
      setRegistrationSuccess(true);
  
      setTimeout(() => {
        router.push('/'); // Redirect after showing success message
      }, 2000); // 2 seconds delay for better user experience
    } catch (error: unknown) {
      if (error instanceof Error) {
        setRegisterError(error.message || 'Registration failed. Please try again.');
      } else {
        setRegisterError('An unexpected error occurred.');
      }
    }
  };
  

  const handleGoogleRegister = () => {
    // Implement your Google registration logic here.
    // This typically involves redirecting to a Google OAuth URL or using a library like Firebase.
    console.log('Register with Google - Implementation required');
  };

  return (
    <div>
      {registerError && <div className="error">{registerError}</div>}
      {registrationSuccess && <div className="success">Registration successful! Redirecting...</div>}

      {!registrationSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="text-center w-3/4">
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            placeholder="Name"
            className="input-field"
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}

          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            placeholder="Email"
            className="input-field"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}

          <input
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long'
              },
            })}
            type="password"
            placeholder="Password"
            className="input-field"
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}

          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === getValues('password') || "Passwords don't match",
            })}
            type="password"
            placeholder="Confirm Password"
            className="input-field"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}

          <button type="submit" className="submit-button">Sign Up</button>
        </form>
      )}
      <p className="text-center my-8 text-gray-700">
        <b>Or register with:</b>
      </p>
      <button onClick={handleGoogleRegister} className="google-button">
        <FaGoogle className="mr-2" /> Sign in with Google
      </button>
    </div>
  );
};

export default RegisterForm;
