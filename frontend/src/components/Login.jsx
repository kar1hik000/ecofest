import { useState, useEffect, useRef } from 'react'

// API Base URL - uses env variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1092182564358-l028j4jk8d27lv9j8ps7bm0vejf6m6qf.apps.googleusercontent.com'

function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetSent, setResetSent] = useState(false)
    const googleButtonRef = useRef(null)

    // Registration state
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regUsername, setRegUsername] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regRole, setRegRole] = useState('shopkeeper')
    const [regLoading, setRegLoading] = useState(false)
    const [regSuccess, setRegSuccess] = useState(false)

    // Initialize Google Sign-In
    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                })

                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    width: 320,
                    text: 'signin_with',
                    shape: 'rectangular',
                })
            }
        }

        // Wait for Google script to load
        if (window.google) {
            initializeGoogleSignIn()
        } else {
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle)
                    initializeGoogleSignIn()
                }
            }, 100)

            return () => clearInterval(checkGoogle)
        }
    }, [])

    const handleGoogleCallback = async (response) => {
        setLoading(true)
        setError('')

        try {
            // Send the Google credential token to our backend
            const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Google sign-in failed')
                setLoading(false)
                return
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            onLogin(data.user, data.token)
        } catch (err) {
            setError('Google sign-in failed. Please try again.')
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Login failed')
                setLoading(false)
                return
            }

            // Store token and user in localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // Call parent callback
            onLogin(data.user, data.token)

        } catch (err) {
            setError('Network error. Please try again.')
        }
        setLoading(false)
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setRegLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: regUsername,
                    password: regPassword,
                    name: regName,
                    email: regEmail,
                    role: regRole
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setRegLoading(false)
                return
            }

            setRegSuccess(true)
            setTimeout(() => {
                setShowRegister(false)
                setRegSuccess(false)
                setRegName('')
                setRegEmail('')
                setRegUsername('')
                setRegPassword('')
            }, 2000)

        } catch (err) {
            setError('Network error. Please try again.')
        }
        setRegLoading(false)
    }

    const handleForgotPassword = (e) => {
        e.preventDefault()
        setResetSent(true)
        setTimeout(() => {
            setShowForgotPassword(false)
            setResetSent(false)
            setResetEmail('')
        }, 3000)
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/logo.png" alt="EcoFest" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
                    </div>
                    <h1 className="login-title">EcoFest</h1>
                    <p className="login-subtitle">AI-Powered Festival Waste Management</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner-small"></span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                                </svg>
                                Sign In
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="login-divider">
                        <span>or continue with</span>
                    </div>

                    {/* Google Sign In Button - rendered by Google SDK */}
                    <div className="google-btn-container">
                        <div ref={googleButtonRef} id="google-signin-button"></div>
                    </div>

                    <div className="login-links">
                        <button
                            type="button"
                            className="forgot-password-link"
                            onClick={() => setShowForgotPassword(true)}
                        >
                            Forgot password?
                        </button>
                        <span className="link-divider">•</span>
                        <button
                            type="button"
                            className="register-link"
                            onClick={() => setShowRegister(true)}
                        >
                            Create account
                        </button>
                    </div>
                </form>
            </div>

            {/* Register Modal */}
            {showRegister && (
                <div className="modal-overlay" onClick={() => setShowRegister(false)}>
                    <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowRegister(false)}>×</button>
                        <h2 className="modal-title">Create Account</h2>

                        {regSuccess ? (
                            <div className="reset-success">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent-success)' }}>
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <p>Account created successfully! You can now sign in.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister}>
                                {error && (
                                    <div className="login-error" style={{ marginBottom: '16px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">I am a</label>
                                    <select
                                        className="form-select"
                                        value={regRole}
                                        onChange={(e) => setRegRole(e.target.value)}
                                    >
                                        <option value="shopkeeper">Shopkeeper</option>
                                        <option value="municipality">Municipality Official</option>
                                    </select>
                                </div>

                                <button type="submit" className="login-button" disabled={regLoading}>
                                    {regLoading ? (
                                        <>
                                            <span className="loading-spinner-small"></span>
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            Create Account
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>
                        <h2 className="modal-title">Reset Password</h2>

                        {resetSent ? (
                            <div className="reset-success">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent-success)' }}>
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <p>Password reset link has been sent to your email!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <button type="submit" className="login-button">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                    Send Reset Link
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Login
