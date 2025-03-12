'use client';

import { BiCheckCircle } from 'react-icons/bi';

interface SignupSuccessProps {
  onReset: () => void;
}

export const SignupSuccess = ({ onReset }: SignupSuccessProps) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <BiCheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Thanks for subscribing!</h2>
      <p className="text-gray-300 mb-8">
        You've been added to our newsletter. We'll keep you updated with the latest news and updates.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition"
      >
        Subscribe another email
      </button>
    </div>
  );
}; 