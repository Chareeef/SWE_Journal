import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../index.css';
import apiClient from '../apiClient';
import Navigation from './Navigation';
import Footer from './Footer';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();
  const locate = useLocation();

  useEffect(() => {
    const successMessage = locate.state?.successMessage;
    if (successMessage) {
      setSuccessMessage(successMessage);
    }
  }, []);

  useEffect(() => {
    const alertMessage = locate.state?.alertMessage;
    if (alertMessage) {
      setAlertMessage(alertMessage);
    }
  }, []);

  const logInUser = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage('Invalid email');
    } else if (password.length === 0) {
      setAlertMessage('Invalid password');
    } else {
      const data = {
        email: email,
        password: password,
      };

      try {
        const response = await apiClient.post('/login', data);

        // Store JWT Tokens for later requests
        localStorage.setItem('jwt_access_token', response.data.access_token);
        localStorage.setItem('jwt_refresh_token', response.data.refresh_token);

        navigate('/home', {
          state: { successMessage: "It's nice to see you!" },
        });
      } catch (error) {
        if (error.response) {
          setAlertMessage(`Error: ${error.response.data.error}`);
        } else {
          setAlertMessage('An error occurred. Please try again later.');
        }
      }
    }
  };

  return (
    <>
      <Navigation publicComp={true} />
      <div className='d-flex flex-column min-vh-100'>
        <div className='bg-beige flex-1 flex-grow-1 d-flex flex-column justify-content-center'>
          <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
            <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black	text-900'>
              Sign in to your account
            </h2>
          </div>

          <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
            {successMessage && (
              <div className='alert alert-success mb-2' role='alert'>
                {successMessage}
              </div>
            )}

            {alertMessage && (
              <div className='alert alert-danger mb-2' role='alert'>
                {alertMessage}
              </div>
            )}
            <form className='space-y-6' onSubmit={logInUser}>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium leading-6 text-black text-900'
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
                    required
                  />
                </div>
              </div>

              <div>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium leading-6 text-black text-900'
                  >
                    Password
                  </label>
                </div>
                <div className='mt-2'>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    placeholder='password'
                    id='password'
                    name='password'
                    type='password'
                    minLength='6'
                    autoComplete='current-password'
                    className='block pl-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                    min='6'
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type='submit'
                  className='flex w-full justify-center rounded-md bg-green px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-glight hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className='mt-10 text-center text-sm text-black text-500'>
              Not a member?
              <br />
              <a
                href='/register'
                className='font-semibold leading-6 text-orange text-600 hover:text-indigo-500'
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SignIn;
