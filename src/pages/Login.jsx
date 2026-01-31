import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = isSignup 
      ? await supabase.auth.signUp({ email, password }) 
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Error Alert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message,
        confirmButtonColor: '#000', // Black theme
      });
    } else {
      if (isSignup) {
        // Success Alert for Signup
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Please check your email for confirmation.',
          confirmButtonColor: '#000',
        });
      } else {
        // Success Alert for Login
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Logging you in...',
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-sm border-dark" style={{ width: '400px', borderRadius: '0' }}>
        <h2 className="text-center mb-4 fw-bold">{isSignup ? 'CREATE ACCOUNT' : 'LOGIN'}</h2>
        <form onSubmit={handleAuth}>
          <div className="mb-3">
            <label className="form-label small fw-bold">EMAIL</label>
            <input type="email" className="form-control border-dark shadow-none" style={{ borderRadius: '0' }} 
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">PASSWORD</label>
            <input type="password" className="form-control border-dark shadow-none" style={{ borderRadius: '0' }} 
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-dark w-100 mb-3 fw-bold" disabled={loading} style={{ borderRadius: '0' }}>
            {loading ? 'WAIT...' : (isSignup ? 'SIGN UP' : 'SIGN IN')}
          </button>
          <p className="text-center small" onClick={() => setIsSignup(!isSignup)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignup ? 'Back to Login' : "Don't have an account? Create one"}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;