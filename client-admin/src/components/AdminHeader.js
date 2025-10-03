import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(`.${styles.mobileNav}`) && !event.target.closest(`.${styles.mobileMenuToggle}`)) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>AE</div>
          <span className={styles.logoText}>Admin</span>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Sign In
          </NavLink>
          <NavLink 
            to="/orders" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Orders
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Users
          </NavLink>
          <NavLink 
            to="/vendors" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Vendors
          </NavLink>
          <NavLink 
            to="/drivers" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Drivers
          </NavLink>
          <NavLink 
            to="/system" 
            className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            System
          </NavLink>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
          end
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
        >
          Orders
        </NavLink>
        <NavLink 
          to="/users" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
        >
          Users
        </NavLink>
        <NavLink 
          to="/vendors" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
        >
          Vendors
        </NavLink>
        <NavLink 
          to="/drivers" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
        >
          Drivers
        </NavLink>
        <NavLink 
          to="/system" 
          className={({ isActive }) => 
            isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink
          }
          onClick={closeMobileMenu}
        >
          System
        </NavLink>
      </nav>
    </header>
  );
}





