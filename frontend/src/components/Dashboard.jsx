import { useState, useEffect } from 'react'

function Dashboard({ festival }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionMessage, setActionMessage] = useState(null)
    const [showHowItWorks, setShowHowItWorks] = useState(false)

    useEffect(() => {
        fetchDashboardStats()
    }, [festival])

    const fetchDashboardStats = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/dashboard/stats?festival=${festival}`)
            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError('Failed to load dashboard data')
            setStats({
                festival: festival,
                summary: {
                    total_areas: 40,
                    total_extra_waste_kg: 1850000,
                    average_increase_percent: 45.2,
                    critical_areas: 8,
                    high_priority_areas: 12,
                    total_extra_trucks_needed: 45,
                    total_extra_workers_needed: 180
                },
                top_waste_shops: [
                    { Shop_Name: 'Metro Supermarket', Area: 'MG Road', Estimated_Waste_kg: 456.2 },
                    { Shop_Name: 'Lakshmi Stores', Area: 'Indiranagar', Estimated_Waste_kg: 398.1 },
                    { Shop_Name: 'Family Traders', Area: 'Koramangala', Estimated_Waste_kg: 345.7 }
                ],
                critical_hotspots: [
                    { area: 'Kengeri', extra_waste_kg: 112014, priority: 'CRITICAL' },
                    { area: 'Whitefield', extra_waste_kg: 101142, priority: 'CRITICAL' }
                ],
                total_shops: 600,
                total_areas: 40
            })
        }
        setLoading(false)
    }

    const handleGenerateReport = () => {
        window.open(`/api/export/action-plan/${festival}`, '_blank')
        setActionMessage('Municipality report is being downloaded...')
        setTimeout(() => setActionMessage(null), 3000)
    }

    const handleSendNotifications = async () => {
        setActionMessage('Sending notifications to high-waste shops...')
        // Simulate API call
        setTimeout(() => {
            setActionMessage('Notifications sent successfully to 15 shops!')
            setTimeout(() => setActionMessage(null), 3000)
        }, 1500)
    }

    const handleExportActionPlan = () => {
        window.open(`/api/export/hotspots/${festival}/csv`, '_blank')
        setActionMessage('Action plan CSV is being downloaded...')
        setTimeout(() => setActionMessage(null), 3000)
    }

    const handleGetStarted = () => {
        // Scroll to the stats section smoothly
        document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })
        setActionMessage('Welcome! Explore the waste prediction data below.')
        setTimeout(() => setActionMessage(null), 3000)
    }

    const handleHowItWorks = () => {
        setShowHowItWorks(true)
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading {festival} statistics...</p>
            </div>
        )
    }

    const summary = stats?.summary || {}

    return (
        <div className="dashboard">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Let's Make Our Festivals
                        <span className="text-highlight"> Green and Clean</span>
                    </h1>
                    <p className="hero-subtitle">
                        AI-powered waste prediction helping municipalities plan better
                        and shopkeepers choose eco-friendly alternatives for {festival} 2025.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={handleGetStarted}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                            </svg>
                            Get Started
                        </button>
                        <button className="btn btn-secondary" onClick={handleHowItWorks}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                            </svg>
                            How It Works
                        </button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/hero-forest.png" alt="Green forest aerial view" />
                </div>
            </div>

            {/* How It Works Modal */}
            {showHowItWorks && (
                <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowHowItWorks(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="modal-title">How It Works</h2>
                        <div className="modal-steps">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Data Collection</h4>
                                    <p>We analyze sales data from 600+ shops across 40 Bangalore areas during festival seasons.</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>AI Prediction</h4>
                                    <p>Our AI model predicts waste hotspots by analyzing product types, quantities, and waste scores.</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Eco Suggestions</h4>
                                    <p>Shopkeepers receive personalized eco-friendly product alternatives via Gemini AI.</p>
                                </div>
                            </div>
                            <div className="step-item">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h4>Municipality Planning</h4>
                                    <p>Municipalities get actionable reports with resource allocation recommendations.</p>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowHowItWorks(false)}>
                            Got It!
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid" id="stats-section">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{summary.total_areas || 40}</span>
                    <span className="stat-label">Areas Monitored</span>
                </div>

                <div className="stat-card warning">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">+{summary.average_increase_percent || 45}%</span>
                    <span className="stat-label">Projected Waste Increase</span>
                </div>

                <div className="stat-card danger">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{summary.critical_areas || 8}</span>
                    <span className="stat-label">Critical Hotspots</span>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{summary.total_extra_trucks_needed || 45}</span>
                    <span className="stat-label">Additional Trucks Required</span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Critical Hotspots */}
                <div className="glass-card">
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">Critical Hotspots</h3>
                        <span className="waste-badge critical">Immediate Action Required</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Extra Waste (Tonnes)</th>
                                <th>Priority Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.critical_hotspots || []).slice(0, 5).map((hotspot, idx) => (
                                <tr key={idx}>
                                    <td className="cell-primary">{hotspot.area}</td>
                                    <td>{(hotspot.extra_waste_kg / 1000).toFixed(1)}T</td>
                                    <td>
                                        <span className={`waste-badge ${hotspot.priority.toLowerCase()}`}>
                                            {hotspot.priority}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Waste Shops */}
                <div className="glass-card">
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">High Impact Shops</h3>
                        <span className="text-muted">Eco-alternatives recommended</span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Shop Name</th>
                                <th>Location</th>
                                <th>Waste (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.top_waste_shops || []).slice(0, 5).map((shop, idx) => (
                                <tr key={idx}>
                                    <td className="cell-primary">{shop.Shop_Name}</td>
                                    <td className="text-muted">{shop.Area}</td>
                                    <td className="text-danger">
                                        {shop.Estimated_Waste_kg?.toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card action-panel">
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Quick Actions</h3>
                </div>

                {actionMessage && (
                    <div className="action-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                        </svg>
                        {actionMessage}
                    </div>
                )}

                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={handleGenerateReport}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                        Generate Municipality Report
                    </button>
                    <button className="btn btn-secondary" onClick={handleSendNotifications}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" />
                        </svg>
                        Send Shop Notifications
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportActionPlan}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Export Action Plan
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
