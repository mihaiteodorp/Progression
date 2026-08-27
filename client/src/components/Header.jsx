
import styles from './Header.module.css';
import UserMenu from './UserMenu';
import logo from '../assets/logo-white.png'
import { Link } from 'react-router';

export default function Header({ user, onLogout }) {

    return (
        <header className={styles.header}>
    <div className={styles.headerInner}>
        <Link
            to="/workouts"
            className={styles.brandLink}
            aria-label="Go to workouts"
        >
            <img
                src={logo}
                alt="Repwise"
                className={styles.brandImage}
            />
        </Link>

        <UserMenu user={user} onLogout={onLogout} />
    </div>
</header>
    )
}