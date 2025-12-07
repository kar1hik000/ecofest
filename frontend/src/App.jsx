import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ShopAnalyzer from './components/ShopAnalyzer'
import HotspotMap from './components/HotspotMap'
import WasteTrends from './components/WasteTrends'
import FestivalComparison from './components/FestivalComparison'
import EcoLeaderboard from './components/EcoLeaderboard'
import Login from './components/Login'

// API Base URL - uses env variable in production, empty string for local dev proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [selectedFestival, setSelectedFestival] = useState('Diwali')
    const [festivals, setFestivals] = useState([])
    const [loading, setLoading] = useState(true)

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    // Global notification state
    const [notification, setNotification] = useState(null)

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    // Check for existing session on mount
    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            fetchFestivals()
        }
    }, [isAuthenticated])

    const checkAuth = async () => {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            try {
                // Verify token is still valid
                const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    setUser(JSON.parse(storedUser))
                    setIsAuthenticated(true)
                } else {
                    // Token expired, clear storage
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                }
            } catch (error) {
                // API not available, use stored session
                setUser(JSON.parse(storedUser))
                setIsAuthenticated(true)
            }
        }
        setAuthLoading(false)
    }

    const handleLogin = (userData, token) => {
        setUser(userData)
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
        setActiveTab('dashboard')
    }

    const fetchFestivals = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/festivals`)
            const data = await response.json()
            setFestivals(data.festivals || [])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching festivals:', error)
            setFestivals(['Diwali', 'Holi', 'Ganesh Chaturthi', 'Christmas', 'Sankranti'])
            setLoading(false)
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard festival={selectedFestival} />
            case 'shop':
                return <ShopAnalyzer festival={selectedFestival} />
            case 'hotspot':
                return <HotspotMap festival={selectedFestival} />
            case 'trends':
                return <WasteTrends festival={selectedFestival} />
            case 'comparison':
                return <FestivalComparison />
            case 'leaderboard':
                return <EcoLeaderboard festival={selectedFestival} />
            default:
                return <Dashboard festival={selectedFestival} />
        }
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    // Show login if not authenticated
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />
    }

    return (
        <div className="app-container">
            {/* Global Notification */}
            {notification && (
                <div className={`global-notification ${notification.type}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        {notification.type === 'error' ? (
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        ) : notification.type === 'success' ? (
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        ) : (
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        )}
                    </svg>
                    <span>{notification.message}</span>
                    <button className="notification-close" onClick={() => setNotification(null)}>×</button>
                </div>
            )}

            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <img src="/logo.png" alt="EcoFest" className="logo-image" />
                        <span className="logo-text">EcoFest</span>
                    </div>

                    <div className="header-controls">
                        {/* Festival Selector */}
                        <div className="form-group" style={{ marginBottom: 0, minWidth: '180px' }}>
                            <select
                                className="form-select"
                                value={selectedFestival}
                                onChange={(e) => setSelectedFestival(e.target.value)}
                            >
                                {festivals.map((f) => (
                                    <option key={f} value={f}>{f} 2025</option>
                                ))}
                            </select>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="nav-tabs">
                            <button
                                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dashboard')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                </svg>
                                Dashboard
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'shop' ? 'active' : ''}`}
                                onClick={() => setActiveTab('shop')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                                Shop Analysis
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'hotspot' ? 'active' : ''}`}
                                onClick={() => setActiveTab('hotspot')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Hotspot Zones
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'trends' ? 'active' : ''}`}
                                onClick={() => setActiveTab('trends')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                Trends
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'comparison' ? 'active' : ''}`}
                                onClick={() => setActiveTab('comparison')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 20V10M12 20V4M6 20v-6" />
                                </svg>
                                Compare
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('leaderboard')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                                Leaderboard
                            </button>
                        </nav>

                        {/* User Menu */}
                        <div className="user-menu">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-role">{user?.role}</div>
                                </div>
                            </div>
                            <button className="logout-btn" onClick={handleLogout} title="Logout">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading festival data...</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <span>Festival Waste Prediction System</span>
                    <span className="divider">|</span>
                    <span>Powered by AI for Sustainable Celebrations</span>
                </div>
            </footer>
        </div>
    )
}

export default App
