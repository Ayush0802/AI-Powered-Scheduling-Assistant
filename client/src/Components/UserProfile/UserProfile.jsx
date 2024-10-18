import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import styles from './UserProfile.module.css';
import Navbar from '../Navbar/Navbar';
import { base_url } from '../../assets/help';
import bgimg from '../../assets/bg.jpg'

const UserProfile = () => {
    const [formData, setFormData] = useState({ username: '', email: '', fullname: '', phone: '', id: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover'; 
        document.body.style.backgroundRepeat = 'no-repeat'; 
        
        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, [bgimg]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                // Set user id to fetch user details later
                setFormData({ ...formData, id: decodedToken.user.id });
                fetchUserDetails(decodedToken.user.id); 
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
    }, []);

    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`${base_url}/signup/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    username: data.username,
                    fullname: data.fullname,
                    email: data.email,
                    phone: data.phone,
                    id: data._id,
                });
            } else {
                console.error('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const response = await fetch(`${base_url}/signup/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), 
            });

            if (response.ok) {
                setSuccess('User details edited successfully!');
                setTimeout(() => {
                    setSuccess('');
                }, 2000);
            } else {
                setError('Failed to update user');
                console.error('Failed to update user');
            }
        } catch (error) {
            setError('Error updating user');
            console.error('Error updating user:', error);
        }
    };

    if (!formData) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            <div className={styles.profileContainer}>
                <h1>User Profile</h1>
                <form onSubmit={handleSubmit} className={styles.profileForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Full Name:</label>
                        <input
                            type="text"
                            id="fullname"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone:</label>
                        <input
                            type="number"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>User ID:</label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            readOnly
                        />
                    </div>
                    <button type="submit" className={styles.saveButton}>Save Changes</button>
                </form>
            </div>
        </>
    );
};

export default UserProfile;
