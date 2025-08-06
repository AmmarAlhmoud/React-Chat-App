import React from 'react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      background: 'var(--bg-light)',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
        Page not found
      </p>
    </div>
  );
};

export default NotFound;