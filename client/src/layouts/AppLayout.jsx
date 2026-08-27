
import { Outlet, useNavigate } from 'react-router';
import styles from './AppLayout.module.css';
import Header from '../components/Header';

import { useAuth } from '../context/AuthContext';

export default function AppLayout() {

    const navigate = useNavigate();
    const {user, logout}=useAuth();



    function handleLogout() {
        logout();
        navigate('/login')
    }

    return (

        <div className={styles.appLayout}>
            <Header user={user} onLogout={handleLogout} />
            <div className={styles.divider} />
            <main className={styles.mainContent} >
                <Outlet />
                
            </main>

            <div className={styles.divider} />

        </div>

    )
}