import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, verifyOtp, resetOtp } from '../features/auth/authSlice';
import { useTogglePassword } from '../utils/useTogglePassword';
import OtpDialog from '../components/OtpDailogue';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, emailForOtp } = useSelector((state) => state.auth);

  const [showPassword, togglePassword] = useTogglePassword();
  const [showConfirm, toggleConfirm] = useTogglePassword();
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    username: Yup.string().min(3, 'Too short').required('Required'),
    email: Yup.string().email('Invalid Email').required('Required'),
    password: Yup.string().min(8, 'Too Short!').required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        registerUser({
          username: values.username,
          email: values.email,
          password: values.password,
        })
      ).unwrap();
      setIsOtpOpen(true);
    } catch (err) {
      toast.error(err || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerify = async (otpCode) => {
    try {
      await dispatch(verifyOtp({ email: emailForOtp, otp: otpCode })).unwrap();
      toast.success('OTP Verified. Signup Complete!');
      dispatch(resetOtp());
      navigate('/login');
    } catch (err) {
      toast.error(err || 'Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-purple-700 headFont">
          Sign Up
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5" method="POST">
              {/* Username */}
              <div className="relative">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <Field
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="xyz@email.com"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Field
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <span
                  onClick={togglePassword}
                  className="absolute top-[38px] right-3 cursor-pointer text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <Field
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="mt-1 w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                <span
                  onClick={toggleConfirm}
                  className="absolute top-[38px] right-3 cursor-pointer text-gray-500"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white font-semibold bg-gradient-to-r from-purple-600 to-purple-900 hover:scale-105 transition disabled:opacity-50"
                >
                  {isSubmitting || loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        {/* Redirect to login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="text-purple-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>

      {/* OTP Dialog */}
      <OtpDialog
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleOtpVerify}
        email={emailForOtp}
      />
    </div>
  );
};

export default Signup;
