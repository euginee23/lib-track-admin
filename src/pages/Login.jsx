import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../utils/auth";

const palette = {
  darkest: "#031716",
  darkRed: "#880000",
  red: "#B22222",
  midRed: "#CD5C5C",
  lightRed: "#F08080",
  gray: "#A9A9A9",
};

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already logged in
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      if (user) {
        toast.success(`Welcome back, ${user.firstName} ${user.lastName}!`);
        onLogin();
        navigate("/dashboard");
      }
    }
  }, [navigate, onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.error("Please enter your username.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      toast.success(`Welcome, ${response.user.firstName} ${response.user.lastName}!`);
      onLogin();
      navigate("/dashboard");
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ 
        height: '100vh', 
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="card-header text-center wmsu-bg-primary text-white py-3">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <img
              src="/wmsu_logo.png"
              alt="WMSU Logo"
              height="40"
              className="me-2"
            />
            <h4 className="mb-0 fw-bold">WMSU Lib-Track</h4>
          </div>
        </div>
        
        <div className="card-body p-4">
          <h5 className="text-center mb-4 text-dark">Administrator Login</h5>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold text-dark">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-control form-control-lg"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ borderColor: '#880000' }}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold text-dark">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control form-control-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderColor: '#880000' }}
              />
            </div>

            <div className="text-end mb-4">
              <a 
                href="#" 
                className="text-decoration-none small"
                style={{ color: '#880000' }}
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Please contact the system administrator to reset your password.");
                }}
              >
                Forgot Password?
              </a>
            </div>
            
            <button
              type="submit"
              className="btn btn-lg w-100 text-white fw-semibold"
              disabled={loading}
              style={{ 
                backgroundColor: '#880000', 
                borderColor: '#880000',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#660000';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#880000';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
        
        <div className="card-footer text-center text-muted py-3">
          <small>WMSU Lib-Track | CodeHub.Site © {new Date().getFullYear()} </small>
        </div>
      </div>
    </div>
  );
}

export default Login;