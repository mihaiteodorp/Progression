
import styles from './UserMenu.module.css';
import { useState, useEffect, useRef } from 'react';



export default function UserMenu({ user, onLogout }) {

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    function toggleMenu() {
        setIsOpen(currentValue => !currentValue);

    };

    function closeMenu() {
        setIsOpen(false);
    };

    function handleLogout() {
        closeMenu();
        onLogout();
    }

    function getInitials(firstName, lastName) {
        
        const firstInitial=firstName?.charAt(0).toUpperCase() ?? '';
        const lastInitial=lastName?.charAt(0).toUpperCase() ?? '';

        return firstInitial + lastInitial || "?";

    }


    useEffect(()=>{
        if(!isOpen){
            return;
        }

        function handleClickOutside(event){
            if(menuRef.current && !menuRef.current.contains(event.target)){
                closeMenu();
            }
        }

        function handleKeyDown(event){
            if(event.key==='Escape'){
                closeMenu();
            }
        }

        document.addEventListener('mousedown',handleClickOutside);
        document.addEventListener('keydown',handleKeyDown);


        return ()=>{
            document.removeEventListener('mousedown',handleClickOutside);
            document.removeEventListener('keydown',handleKeyDown);
        }
    },[isOpen]);

    const initials=getInitials(user.firstName,user.lastName);
    const fullName=`${user.firstName} ${user.lastName}`;



    return (
        <div className={styles.userMenu} ref={menuRef} >
            <button
                type='button'
                className={styles.avatarButton}
                onClick={toggleMenu}
                aria-label='Open user menu'
                aria-expanded={isOpen}
                aria-haspopup='menu'
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt=''
                        className={styles.avatarImage}
                    />
                ) : (
                    <span 
                        className={styles.initial}
                    >
                        {initials}
                    </span>
                )}

            </button>

            {isOpen && (
                <div
                    className={styles.dropdown}
                    role='menu'
                >
                    <div className={styles.userDetails}>
                        <p className={styles.userName} >{fullName}</p>
                        <p className={styles.userEmail} >{user.email}</p>

                    </div>

                    <div className={styles.divider} />

                    <button
                        className={styles.menuItem}
                        type='button'
                        onClick={handleLogout}
                        role='menuitem'
                    >
                        Log out
                    </button>

                </div>
            )}

        </div>
    )
}