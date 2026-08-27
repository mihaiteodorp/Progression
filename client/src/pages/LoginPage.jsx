
import styles from './LoginPage.module.css';
import { useState } from 'react';
import { Link } from 'react-router';

import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

import { loginRequest } from '../api/auth.js';


export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const user = await loginRequest(email, password);
            login(user);
            navigate('/workouts');

        } catch (error) {
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <section className={styles.loginPage} >
            <div className={styles.loginCard} >
                <div className={styles.heading} >
                    <h1>Welcome back</h1>
                    <p>Log in to continue to your account.</p>

                </div>
                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.field} >
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id='email'
                            name='email'
                            autoComplete='email'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.field} >
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id='password'
                            name='password'
                            autoComplete='current-password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                    </div>
                    {error && (
                        <p className={styles.errorMessage} role='alert' >{error}</p>
                    )}
                    <button
                        type='submit'
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                    </button>
                    <p className={styles.registerPrompt} >Don't have an account?{' '}<Link to='/register'>Create an account</Link></p>


                </form>

            </div>

        </section>
    )
}