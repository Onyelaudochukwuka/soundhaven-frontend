import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const Register: React.FC = () => {
  return (
    <div className="bg-[#f6f6f6] min-h-screen">
      <div className="flex flex-col pt-6 items-center lg:w-3/4 md:items-start justify-between md:w-3/4 min-w-[390px] p-6 sm-md:w-3/4 transition">
      <div className="relative w-full h-[235px] mb-4 overflow-hidden">
            {/* Image */}
            <div
              className="bg-cover bg-center w-full h-full"
              style={{
                backgroundImage: 'url(/images/mountain_climb_no-bg.svg)',
                filter: 'drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.1))', 
            }}
            ></div> 
        </div>     
        <h1 className="text-3xl font-semibold mb-8 text-center md:text-left lg:text-left md:text-3xl lg:text-4xl">Create an Account</h1>
        <RegisterForm /> 
      </div>
    </div>
  );
};

export default Register;
