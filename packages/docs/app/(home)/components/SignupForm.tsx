'use client';

import { FormEvent } from 'react';
import { FieldValues, SubmissionError, SubmissionSuccess } from '@formspree/core';
import { ValidationError } from '@formspree/react';
import { ArrowRight } from 'lucide-react';
import { BiLoaderAlt } from 'react-icons/bi';

interface FormState<T extends FieldValues> {
  errors: SubmissionError<T> | null;
  result: SubmissionSuccess | null;
  submitting: boolean;
  succeeded: boolean;
}

interface SignupFormProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: FormState<FieldValues>;
}

export const SignupForm = ({ handleSubmit, state }: SignupFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
          placeholder="your.email@example.com"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </div>
      
      <ValidationError errors={state.errors} />
      
      <div>
        <button
          type="submit"
          disabled={state.submitting}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition"
        >
          {state.submitting ? (
            <>
              <BiLoaderAlt className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-900" />
              Registering...
            </>
          ) : (
            <>
              Register
            </>
          )}
        </button>
      </div>
    </form>
  );
}; 