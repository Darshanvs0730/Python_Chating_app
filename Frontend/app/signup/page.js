"use client"
import { useFormik } from 'formik';
import Link from "next/link";
import axios from 'axios';
import { useState } from 'react';
import * as Yup from 'yup';
import { endpoint } from '@/endpoints';
import { useRouter } from 'next/navigation';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import Logo from '@/app/componant/Logo';

const Signup = () => {
    const router = useRouter()
    const [response, setResponse] = useState()
    const [submitError, setSubmitError] = useState()
    const [submitErrorMobilNum, setSubmitErrorMobilNum] = useState()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const initialValues = {
        first_name: '',
        last_name: '',
        email: '',
        mobile_no: '',
        password: '',
        gender: '',
    };

    const { handleChange, handleSubmit, values, touched, handleBlur, errors } = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({
            first_name: Yup.string().min(2, 'First name must be at least 2 characters').max(20, 'First name must be less than 20 characters').required('First name is required'),
            last_name: Yup.string().min(2, 'Last name must be at least 2 characters').max(20, 'Last name must be less than 20 characters').required('Last name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
            mobile_no: Yup.string().required('Mobile number is required'),
            gender: Yup.string().required('Gender is required'),
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true)
            setSubmitError(null)
            setSubmitErrorMobilNum(null)
            setResponse(null)
            
            const { gender, ...data } = values;
            data.gender = parseInt(gender);
            try {
                const response = await axios.post(endpoint.signup, data);
                if (response.data.message) {
                    router.push("/")
                }
                setResponse(response.data.message)
            } catch (error) {
                setSubmitError(error.response?.data?.email);
                setSubmitErrorMobilNum(error.response?.data?.mobile_no);
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 py-12">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
                    {/* Header with Logo */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-4">
                            <Logo size="xl" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
                        <p className="text-gray-500 text-sm">Join ChatFlow and start connecting</p>
                    </div>

                    {/* Messages */}
                    {response && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
                            {response}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.first_name && touched.first_name
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                    placeholder="John"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.first_name}
                                />
                                {errors.first_name && touched.first_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                        errors.last_name && touched.last_name
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                    placeholder="Doe"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.last_name}
                                />
                                {errors.last_name && touched.last_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="1"
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        checked={values.gender === '1'}
                                    />
                                    <span className="text-sm text-gray-700">Male</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="2"
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        checked={values.gender === '2'}
                                    />
                                    <span className="text-sm text-gray-700">Female</span>
                                </label>
                            </div>
                            {errors.gender && touched.gender && (
                                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="mobile_no" className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                name="mobile_no"
                                id="mobile_no"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    (errors.mobile_no && touched.mobile_no) || submitErrorMobilNum
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                placeholder="+1234567890"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.mobile_no}
                            />
                            {errors.mobile_no && touched.mobile_no && (
                                <p className="mt-1 text-sm text-red-600">{errors.mobile_no}</p>
                            )}
                            {submitErrorMobilNum && (
                                <p className="mt-1 text-sm text-red-600">{submitErrorMobilNum}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    (errors.email && touched.email) || submitError
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                placeholder="you@example.com"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                            />
                            {errors.email && touched.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                            {submitError && (
                                <p className="mt-1 text-sm text-red-600">{submitError}</p>
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
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                    placeholder="Create a password"
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href='/'>
                                <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors">
                                    Sign in
                                </span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
