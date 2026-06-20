import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="login-card__header">
          <div className="login-card__logo"><Shield size={32} color="#2563eb" /></div>
          <h1 className="login-card__title">Create Account</h1>
          <p className="login-card__subtitle">Join the Citizen Connect community</p>
        </div>

        {error && (
          <div className="login-card__error">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="register-card__success">
            <span className="register-card__success-icon"><CheckCircle size={24} color="#10b981" /></span>
            <div>
              <strong>Registration Successful!</strong>
              <p>{success}</p>
              <Link to="/login" className="register-card__login-link">Go to Login →</Link>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="login-card__form">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={18} /></span>
                <input
                  id="reg-name"
                  className="form-input form-input--icon"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  id="reg-email"
                  className="form-input form-input--icon"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  id="reg-password"
                  className="form-input form-input--icon"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
              {password && (
                <div className="password-strength">
                  <div className="password-strength__bar">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`password-strength__segment ${i <= strength.level ? 'password-strength__segment--active' : ''}`}
                        style={i <= strength.level ? { backgroundColor: strength.color } : {}}
                      />
                    ))}
                  </div>
                  <span className="password-strength__label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  id="reg-confirm"
                  className="form-input form-input--icon"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="form-hint form-hint--error">Passwords don't match</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg login-card__submit"
              disabled={loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        <p className="login-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
