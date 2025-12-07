import { useState, useEffect } from 'react'

// API Base URL - uses env variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function WasteTrends({ festival }) {
    const [trends, setTrends] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedArea, setSelectedArea] = useState('All Areas')
    const [areas, setAreas] = useState(['All Areas'])

    useEffect(() => {
        fetchTrends()
    }, [festival, selectedArea])

    const fetchTrends = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/trends/${festival}`)
            const data = await response.json()
            setTrends(data.trends || [])
            if (data.areas) {
                setAreas(['All Areas', ...data.areas])
            }
        } catch (error) {
            // Mock data for demonstration
            const mockTrends = []
            const baseWaste = 5000
            for (let i = 0; i < 30; i++) {
                const date = new Date()
                date.setDate(date.getDate() - 30 + i)
                const isFestival = i >= 12 && i <= 18
                mockTrends.push({
                    date: date.toISOString().split('T')[0],
                    waste_kg: baseWaste + (isFestival ? Math.random() * 8000 + 5000 : Math.random() * 2000),
                    baseline_kg: baseWaste + Math.random() * 500,
                    is_festival: isFestival
                })
            }
            setTrends(mockTrends)
            setAreas(['All Areas', 'Kengeri', 'Whitefield', 'JP Nagar', 'Koramangala', 'Indiranagar'])
        }
        setLoading(false)
    }

    const maxWaste = Math.max(...trends.map(t => t.waste_kg), 1)
    const avgWaste = trends.reduce((sum, t) => sum + t.waste_kg, 0) / trends.length || 0
    const peakWaste = Math.max(...trends.map(t => t.waste_kg))
    const festivalDays = trends.filter(t => t.is_festival).length

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading trends data...</p>
            </div>
        )
    }

    return (
        <div className="waste-trends">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Waste Trends Analysis</h1>
                    <p className="page-subtitle">Historical waste data and patterns for {festival}</p>
                </div>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '180px' }}>
                    <label className="form-label">Filter by Area</label>
                    <select
                        className="form-select"
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                    >
                        {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{(avgWaste / 1000).toFixed(1)}T</span>
                    <span className="stat-label">Average Daily Waste</span>
                </div>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{(peakWaste / 1000).toFixed(1)}T</span>
                    <span className="stat-label">Peak Waste Day</span>
                </div>
                <div className="stat-card warning">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{festivalDays}</span>
                    <span className="stat-label">Festival Days</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{trends.length}</span>
                    <span className="stat-label">Days Analyzed</span>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card">
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Daily Waste Trend (Last 30 Days)</h3>
                    <div className="map-legend">
                        <span className="legend-item">
                            <span className="legend-dot" style={{ background: 'var(--accent-primary)' }}></span>
                            Actual Waste
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot" style={{ background: 'var(--accent-warning)' }}></span>
                            Festival Days
                        </span>
                    </div>
                </div>

                <div className="chart-container" style={{ height: '320px', padding: '20px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        height: '100%',
                        gap: '4px',
                        width: '100%'
                    }}>
                        {trends.map((day, idx) => {
                            const height = (day.waste_kg / maxWaste) * 100
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        flex: 1,
                                        height: `${height}%`,
                                        background: day.is_festival
                                            ? 'linear-gradient(to top, var(--accent-warning), var(--accent-danger))'
                                            : 'linear-gradient(to top, var(--accent-primary), #4590e0)',
                                        borderRadius: '4px 4px 0 0',
                                        minWidth: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: 0.8
                                    }}
                                    title={`${day.date}: ${(day.waste_kg / 1000).toFixed(1)}T`}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.8}
                                />
                            )
                        })}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                }}>
                    <span>{trends[0]?.date}</span>
                    <span>{trends[Math.floor(trends.length / 2)]?.date}</span>
                    <span>{trends[trends.length - 1]?.date}</span>
                </div>
            </div>

            {/* Insights */}
            <div className="content-grid" style={{ marginTop: 'var(--spacing-md)' }}>
                <div className="glass-card">
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">Key Patterns</h3>
                    </div>
                    <div className="insights-content">
                        <div className="alert-item">
                            <svg className="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 6l-9.5 9.5-5-5L1 18" />
                            </svg>
                            <div className="alert-content">
                                <div className="alert-title">Festival Peak Detected</div>
                                <div className="alert-desc">Waste increases by ~{((peakWaste - avgWaste) / avgWaste * 100).toFixed(0)}% during festival period</div>
                            </div>
                        </div>
                        <div className="alert-item">
                            <svg className="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                            </svg>
                            <div className="alert-content">
                                <div className="alert-title">Optimal Collection Time</div>
                                <div className="alert-desc">Peak collection recommended during 6 AM - 10 AM</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">Predictions</h3>
                    </div>
                    <div className="insights-content">
                        <div className="alert-item critical">
                            <svg className="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            </svg>
                            <div className="alert-content">
                                <div className="alert-title">Next Festival Warning</div>
                                <div className="alert-desc">Expected {((peakWaste * 1.1) / 1000).toFixed(1)}T peak waste in next {festival} season</div>
                            </div>
                        </div>
                        <div className="alert-item">
                            <svg className="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" />
                            </svg>
                            <div className="alert-content">
                                <div className="alert-title">Resource Recommendation</div>
                                <div className="alert-desc">Deploy {Math.ceil(peakWaste / 5000)} additional trucks during peak days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WasteTrends
