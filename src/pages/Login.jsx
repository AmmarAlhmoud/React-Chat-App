import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login process
    showToast('Success', 'Logged in successfully!', 'success');
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  const handleGoogleLogin = () => {
    showToast('Success', 'Logged in with Google!', 'success');
    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  const showToast = (title, message, type = 'success') => {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-check"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastSlide 0.3s ease reverse';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const createToastContainer = () => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <i className="fas fa-comments"></i>
        </div>
        <h1 className={styles.loginTitle}>Welcome to ChatApp</h1>
        <p className={styles.loginSubtitle}>Connect with your team instantly</p>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input 
              type="email" 
              className={styles.formInput} 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input 
              type="password" 
              className={styles.formInput} 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-sign-in-alt"></i>
            Sign In
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>or</span>
        </div>
        
        <button className={styles.btnGoogle} onClick={handleGoogleLogin}>
          <i className="fab fa-google"></i>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;