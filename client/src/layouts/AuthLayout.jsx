import { Outlet } from "react-router";
import styles from './AuthLayout.module.css';
import logo from '../assets/logo-white.png';


export default function AuthLayout(){

    return (
        <main className={styles.authLayout} >
            <div className={styles.branding} >
                <img 
                    src={logo} 
                    alt='Progression'
                    className={styles.logo}
                />
                <div className={styles.brandingText} >
                    <h2>Train smarter.
                        <br />
                        Track progress.
                        <br />
                        Stay consistent.
                    </h2>
                    <p>Everything you need to understand your training,
                        progress, and performance in one place.</p>

                </div>
            </div>

            <section className={styles.authContent} >
                <Outlet/>
            </section>
        </main>
    )
}