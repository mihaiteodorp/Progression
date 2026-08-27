import styles from './RegisterPage.module.css';
import { useState } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { registerRequest } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';


export default function RegisterPage() {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();



    async function handleSubmit(event) {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        };

        setError('');
        setIsSubmitting(true);
        try {
            const user = await registerRequest(
                firstName,
                lastName,
                email,
                password
            );
            navigate('/workouts');

        } catch (error) {
            setError(error.message);

        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <section className={styles.registerPage} >
            <div className={styles.registerCard} >
                <div className={styles.heading} >
                    <h1>Create your account</h1>
                    <p>Sign up to get started with Progression.</p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                >
                    <div className={styles.field} >
                        <label htmlFor="firstName">First name</label>
                        <input
                            type="text"
                            id='firstName'
                            value={firstName}
                            name='firstName'
                            onChange={(event) => setFirstName(event.target.value)}
                            autoComplete='given-name'
                            required

                        />
                    </div>
                    <div className={styles.field} >
                        <label htmlFor="lastName">Last name</label>
                        <input
                            type="text"
                            id='lastName'
                            name='lastName'
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            autoComplete='family-name'
                            required
                        />

                    </div>
                    <div className={styles.field} >
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id='email'
                            name='email'
                            value={email}
                            autoComplete='email'
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                    </div>
                    <div className={styles.field} >
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name='password'
                            value={password}
                            id='password'
                            autoComplete='new-password'
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                    </div>
                    <div className={styles.field} >
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            type="password"
                            name='confirmPassword'
                            id='confirmPassword'
                            value={confirmPassword}
                            autoComplete='new-password'
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <p className={styles.errorMessage} >{error}</p>
                    )}
                    <button
                        disabled={isSubmitting}
                        type='submit'
                        className={styles.submitButton}
                    >
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                    <p className={styles.loginPrompt} >
                        Already have an account?{' '}
                        <Link to='/login' >Log in</Link>
                    </p>

                </form>
            </div>
        </section>
    )
}