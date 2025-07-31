import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = ({ setIsAuthenticated, setForceRedirectToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('user', JSON.stringify({ 
          username: data.username, 
          role: data.role 
        }));
        localStorage.removeItem('loggedOut');
        setIsAuthenticated(true);
        if (setForceRedirectToLogin) {
          setForceRedirectToLogin(false);
        }
        
        navigate('/');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 z-0" />
      
      <motion.div 
        className="relative w-[350px] bg-white/95 rounded-2xl shadow-2xl p-8 z-[2] backdrop-blur-lg border border-white/20"
        style={{
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl text-slate-800 mb-2 font-semibold">Sign In</h2>
        </div>
        
        <div className="mb-6">
          <div className="mb-5">
            <label className="flex items-center text-sm mb-2 text-slate-600 font-medium">
              <div 
                className="inline-block w-4 h-4 mr-2 bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23475569"><path d="M12,12A4,4,0,1,0,8,8,4,4,0,0,0,12,12Zm0,2c-2.67,0-8,1.34-8,4v2H20V18C20,15.34,14.67,14,12,14Z"/></svg>')`
                }}
              />
              Username
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-800 bg-slate-50/50 transition-all duration-300 outline-none h-10 placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20"
            />
          </div>
          
          <div className="mb-5">
            <label className="flex items-center text-sm mb-2 text-slate-600 font-medium">
              <div 
                className="inline-block w-4 h-4 mr-2 bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23475569"><path d="M18,8H17V6A5,5,0,0,0,7,6V8H6a2,2,0,0,0-2,2v10a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V10A2,2,0,0,0,18,8ZM9,6a3,3,0,0,1,6,0V8H9Zm9,14H6V10H18Zm-6-3a2,2,0,1,0-2-2A2,2,0,0,0,12,17Z"/></svg>')`
                }}
              />
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-slate-800 bg-slate-50/50 transition-all duration-300 outline-none h-10 placeholder-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20"
            />
          </div>
          
          {error && (
            <motion.div 
              className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-5 flex items-center border-l-[3px] border-red-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="inline-block w-4 h-4 mr-2 bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e74c3c"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm0,18c-4.41,0-8-3.59-8-8s3.59-8,8-8,8,3.59,8,8-3.59,8-8,8Zm-1-13h2v6h-2Zm0,8h2v2h-2Z"/></svg>')`
                }}
              />
              {error}
            </motion.div>
          )}
          
          <motion.button 
            className="w-full px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 flex justify-center items-center shadow-lg shadow-slate-600/30 h-10 disabled:opacity-80 disabled:cursor-not-allowed hover:from-slate-700 hover:to-slate-900"
            onClick={handleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin mr-2" />
                <span>Logging in...</span>
              </>
            ) : (
              <>Log In</>
            )}
          </motion.button>
        </div>
      </motion.div>

      <style jsx>{`
        @media (max-width: 480px) {
          .login-container {
            padding: 0 1rem;
          }
          .login-box {
            width: 90% !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Login;