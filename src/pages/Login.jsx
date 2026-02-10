import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Chrome } from 'lucide-react';
import Swal from 'sweetalert2';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isLogin) {
      // Login Logic 
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      // Signup Logic 
      result = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: '' } } 
      });
    }

    const { data, error } = result;

    if (error) {
      Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        borderRadius: '15px'
      });
    } else {
      if (isLogin) {
        navigate('/dashboard');
      } else {
        Swal.fire({
          title: 'Success!',
          text: 'Account created! Please check your email for verification.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        setIsLogin(true); // Signup ke baad login par le jao
      }
    }
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: '28px', maxWidth: '450px', width: '90%' }}>
        
        <div className="text-center mb-4">
          <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
            {isLogin ? <LogIn size={32} className="text-success" /> : <UserPlus size={32} className="text-success" />}
          </div>
          <h3 className="fw-bold text-dark">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
          <p className="text-secondary small">
            {isLogin ? 'Login to manage your professional resumes' : 'Join us to build your professional CV today'} [cite: 6]
          </p>
        </div>

        <form onSubmit={handleAuth}>
          <div className="mb-3">
            <label className="small fw-bold text-secondary mb-1 ms-1">EMAIL ADDRESS</label> 
            <div className="position-relative">
              <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={18} />
              <input 
                type="email" 
                className="form-control border-0 bg-light ps-5 py-3 shadow-none" 
                style={{ borderRadius: '15px' }}
                placeholder="name@email.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="small fw-bold text-secondary mb-1 ms-1">PASSWORD</label> 
            <div className="position-relative">
              <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={18} />
              <input 
                type="password" 
                className="form-control border-0 bg-light ps-5 py-3 shadow-none" 
                style={{ borderRadius: '15px' }}
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-dark w-100 py-3 fw-bold rounded-pill shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm"></span> : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </button>

          <button 
            type="button"
            className="btn btn-outline-secondary w-100 py-3 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 border-light shadow-sm mb-2"
            style={{ backgroundColor: '#fff' }}
          >
            <Chrome size={18} /> {isLogin ? 'Sign in' : 'Sign up'} with Google [cite: 22]
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="small text-secondary m-0">
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <span 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-success fw-bold ms-1 cursor-pointer" 
              style={{ cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;