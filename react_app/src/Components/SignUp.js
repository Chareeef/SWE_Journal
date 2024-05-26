import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const hostIP = process.env.REACT_APP_HOST || '127.0.0.1';

  const registerUser = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username) {
      alert('Please enter your username');
    } else if (!email) {
      alert('Please enter you email');
    } else if (!emailRegex.test(email)) {
      alert('Invalid email');
    } else if (password.length < 6) {
      alert('Password must include at least 6 characters');
    } else {
      const data = {
        username: username,
        email: email,
        password: password,
      };

      try {
        await axios.post(`http://${hostIP}:5000/register`, data);

        alert(`Great to meet you ${username}! You can Log In now!`);
        navigate('/login');
      } catch (error) {
        if (error.response) {
          alert(`Error: ${error.response.data.error}`);
        } else {
          alert('An error occurred. Please try again later.');
        }
      }
    }
  };

  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight  text-white	text-900'>
            Create your account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form onSubmit={registerUser} className='space-y-6'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium leading-6 text-white text-900'
              >
                Username
              </label>
              <div className='mt-2'>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  placeholder='username'
                  id='username'
                  name='username'
                  type='username'
                  autoComplete='username'
                  className='block pl-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium leading-6 text-white text-900'
              >
                Email address
              </label>
              <div className='mt-2'>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder='email'
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  className='block pl-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium leading-6 text-white text-900'
                >
                  Password
                </label>
                <div className='text-sm'></div>
              </div>
              <div className='mt-2'>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder='password'
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  className='block pl-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-glight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Sign up
              </button>
            </div>
          </form>

          <p className='mt-10 text-center text-sm text-black text-500'>
            Already have an account?{' '}
            <a
              href='/login'
              className='font-bold leading-6 text-white text-600 hover:text-indigo-500'
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignUp;
