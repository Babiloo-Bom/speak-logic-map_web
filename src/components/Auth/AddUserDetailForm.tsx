import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from './AuthLayout';
import styles from './_Auth.module.scss';
import { useUserStore } from '@/providers/RootStoreProvider';
import { observer } from 'mobx-react-lite';

interface FormData {
    title: string;
    function: string;
    location: string;
    file: string;
}

interface FormErrors {
    title?: string;
    function?: string;
    location?: string;
    file?: string;
    general?: string;
}


const AddUserDetailForm: React.FC = () => {
    const router = useRouter();
    const userStore = useUserStore();
    const [formData, setFormData] = useState<FormData>({
        title: '',
        function: '',
        location: '',
        file: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.title)) {
            newErrors.title = 'Please enter a valid title address';
        }

        if (!formData.function) {
            newErrors.function = 'Function is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Use UserStore to manage authentication
                userStore.setAuthData(data.user, data.accessToken, data.profile);


                // Redirect to dashboard
                router.push('/');
            } else {
                if (data.code === 'ACCOUNT_PENDING') {
                    setErrors({ general: data.error });
                } else if (data.code === 'ACCOUNT_SUSPENDED') {
                    setErrors({ general: data.error });
                } else {
                    setErrors({ general: data.error || 'Login failed' });
                }
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            illustration="lock"
            title="Add User Detail"
        >
            <form onSubmit={handleSubmit}>
                {errors.general && (
                    <div className={styles.errorBanner}>
                        {errors.general}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>
                        Enter your title
                    </label>
                    <input
                        type="title"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Title"
                        className={`${styles.input} ${errors.title ? styles.error : ''}`}
                        disabled={isLoading}
                    />
                    {errors.title && (
                        <span className={styles.errorMessage}>{errors.title}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="function" className={styles.label}>
                        Enter your function
                    </label>
                    <input
                        type="function"
                        id="function"
                        name="function"
                        value={formData.function}
                        onChange={handleInputChange}
                        placeholder="Function"
                        className={`${styles.input} ${errors.function ? styles.error : ''}`}
                        disabled={isLoading}
                    />
                    {errors.function && (
                        <span className={styles.errorMessage}>{errors.function}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="location" className={styles.label}>
                        Enter your location
                    </label>
                    <input
                        type="location"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Location"
                        className={`${styles.input} ${errors.location ? styles.error : ''}`}
                        disabled={isLoading}
                    />
                    {errors.location && (
                        <span className={styles.errorMessage}>{errors.location}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="image" className={styles.label}>
                        Upload image
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="px-10 py-2 border-2 border-solid border-[#3B4EA6] rounded-md text-[#3B4EA6] font-semibold cursor-pointer hover:bg-blue-50">
                            Upload Image
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-[#3B4EA6]">Lamp1.jpg</span>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="border-[#3B4EA6] hover:text-red-600"
                            >
                                {/* <Trash2 size={18} /> */}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`${styles.primaryButton} ${styles.small} mb-4`}
                    disabled={isLoading}
                >
                    Submit
                </button>
            </form>
        </AuthLayout>
    );
};

export default observer(AddUserDetailForm);
