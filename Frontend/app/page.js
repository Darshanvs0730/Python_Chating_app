"use client"
import { useFormik } from "formik"
import Link from "next/link";
import axios from "axios";
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { redirect, useRouter } from 'next/navigation'
import { endpoint } from "@/endpoints";
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Logo from '@/app/componant/Logo';

function Home() {
  const router = useRouter()
  const [response, setResponse] = useState()
  const [submitError, setSubmitError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialValues = {
    username: '',
    password: '',
  };

  useEffect(() => {
    const isLogin = JSON.parse(localStorage.getItem('user'))
    if (isLogin) {
      redirect('/chatpage')
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const { handleChange, handleSubmit, values, handleBlur, touched, errors } = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object({
      username: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true)
      setSubmitError(null)
      setResponse(null)
      try {
        const response = await axios.post(endpoint.login, values);
        setResponse(response.data.message)
        localStorage.setItem('user', JSON.stringify(response.data.data))
        if (response.data.data.access) {
          router.push("/chatpage")
        } else {
          router.push("/")
        }
      } catch (error) {
        setSubmitError(error.response?.data?.non_field_errors || 'Login failed. Please try again.');
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {!isLoading ? (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
            {/* Header with Logo */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Logo size="xl" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 text-sm">Sign in to continue your conversations</p>
            </div>

            {/* Messages */}
            {response && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
                {response}
              </div>
            )}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
                {submitError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="username"
                  id="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.username && touched.username
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="you@example.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                />
                {errors.username && touched.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all pr-12 ${
                      errors.password && touched.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <BsEyeSlash className="w-5 h-5" /> : <BsEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup">
                  <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors">
                    Sign up
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}

export default Home
