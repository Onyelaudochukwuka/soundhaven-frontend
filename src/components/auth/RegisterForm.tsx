import { useForm, SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState, getValues } = useForm<RegisterData>();
  const { errors } = formState;
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<RegisterData & { confirmPassword: string }> = async (data) => {
    if (data.password !== data.confirmPassword) {
      console.error("Passwords don't match");
      return;
    }

    try {
      // Simulating successful registration without making an actual HTTP request
      // Uncomment the following lines when you have server-side implementation
      /*
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        router.push('/posts');
      } else {
        const errorData = await response.json();
        console.error(errorData);
      }
      */

      // Simulate successful registration
      setSuccess(true);
      router.push('/posts');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-w-[390px] sm-md:w-3/4 md:w-3/4 lg:w-3/4 flex flex-col items-center mb-8">
      {success && <div className="text-green-500 mb-4">Registration successful!</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="text-center w-3/4">
        <input
          {...register('name', { required: true })}
          type="text"
          placeholder="Name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
        />
        <input
          {...register('email', { required: true })}
          type="email"
          placeholder="Email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
        />
        <input
          {...register('password', { required: true, minLength: 8 })}
          type="password"
          placeholder="Password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
        />
        {errors.password?.type === "minLength" && <span className="text-red-500">Password must be at least 8 characters long</span>}
        <input
          {...register('confirmPassword', { required: true, validate: value => value === getValues('password') || "Passwords don't match" })}
          type="password"
          placeholder="Confirm Password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6"
        />
        {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
        <p className="text-gray-600 text-sm italic mb-6">
          Password must be 8+ characters, and contain an uppercase letter, a lowercase letter, and a number.
        </p>
        <button className="bg-blue-500 text-white py-3 rounded-lg font-bold text-xl hover:bg-blue-600 shadow appearance-none border w-full leading-tight focus:outline-none focus:shadow-outline">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
