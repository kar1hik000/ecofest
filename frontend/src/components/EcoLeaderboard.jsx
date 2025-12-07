import { useState, useEffect } from 'react'

function EcoLeaderboard({ festival }) {
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchLeaderboard()
    }, [festival])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/leaderboard/${festival}`)
            const data = await response.json()
            setShops(data.shops || [])
        } catch (error) {
            // Mock data - sorted by eco score (higher = better)
            setShops([
                { id: 1, name: 'Green Earth Store', area: 'Indiranagar', eco_score: 92, waste_reduction: 45, alternative_products: 28, total_waste_kg: 45.2, badges: ['Eco Champion', 'Zero Plastic'] },
                { id: 2, name: 'Sustainable Mart', area: 'Koramangala', eco_score: 88, waste_reduction: 38, alternative_products: 22, total_waste_kg: 62.5, badges: ['Eco Champion'] },
                { id: 3, name: 'Nature Fresh', area: 'HSR Layout', eco_score: 85, waste_reduction: 35, alternative_products: 18, total_waste_kg: 78.3, badges: ['Waste Warrior'] },
                { id: 4, name: 'Eco Friendly Goods', area: 'JP Nagar', eco_score: 82, waste_reduction: 32, alternative_products: 15, total_waste_kg: 89.1, badges: ['Rising Star'] },
                { id: 5, name: 'Planet Saver Shop', area: 'Whitefield', eco_score: 79, waste_reduction: 28, alternative_products: 12, total_waste_kg: 102.4, badges: [] },
                { id: 6, name: 'Clean Green Market', area: 'Malleshwaram', eco_score: 76, waste_reduction: 25, alternative_products: 10, total_waste_kg: 115.8, badges: [] },
                { id: 7, name: 'Earthwise Store', area: 'Jayanagar', eco_score: 73, waste_reduction: 22, alternative_products: 8, total_waste_kg: 125.2, badges: [] },
                { id: 8, name: 'Green Basket', area: 'BTM Layout', eco_score: 70, waste_reduction: 20, alternative_products: 6, total_waste_kg: 138.9, badges: [] },
                { id: 9, name: 'Eco Valley', area: 'Marathahalli', eco_score: 68, waste_reduction: 18, alternative_products: 5, total_waste_kg: 145.3, badges: [] },
                { id: 10, name: 'Sustainable Solutions', area: 'Electronic City', eco_score: 65, waste_reduction: 15, alternative_products: 4, total_waste_kg: 158.7, badges: [] }
            ])
        }
        setLoading(false)
    }

    const getRankClass = (rank) => {
        if (rank === 1) return 'gold'
        if (rank === 2) return 'silver'
        if (rank === 3) return 'bronze'
        return ''
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--accent-success)'
        if (score >= 60) return 'var(--accent-primary)'
        if (score >= 40) return 'var(--accent-warning)'
        return 'var(--accent-danger)'
    }

    const filteredShops = filter === 'all'
        ? shops
        : filter === 'champions'
            ? shops.filter(s => s.eco_score >= 80)
            : shops.filter(s => s.badges.length > 0)

    const avgScore = shops.reduce((sum, s) => sum + s.eco_score, 0) / shops.length || 0
    const totalReduction = shops.reduce((sum, s) => sum + s.waste_reduction, 0)

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading leaderboard...</p>
            </div>
        )
    }

    return (
        <div className="eco-leaderboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Eco-Friendly Shops Leaderboard</h1>
                    <p className="page-subtitle">Recognizing shops making a difference during {festival}</p>
                </div>
                <div className="form-group" style={{ marginBottom: 0, minWidth: '160px' }}>
                    <label className="form-label">Filter</label>
                    <select
                        className="form-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Shops</option>
                        <option value="champions">Eco Champions (80+)</option>
                        <option value="badges">Badge Holders</option>
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{shops.length}</span>
                    <span className="stat-label">Participating Shops</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{avgScore.toFixed(0)}</span>
                    <span className="stat-label">Average Eco Score</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{totalReduction}%</span>
                    <span className="stat-label">Total Waste Reduced</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{shops.filter(s => s.badges.length > 0).length}</span>
                    <span className="stat-label">Badge Holders</span>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="glass-card">
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Top Performers</h3>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: '20px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    {/* 2nd Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>2</span>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{shops[1]?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shops[1]?.area}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)' }}>{shops[1]?.eco_score}</div>
                    </div>

                    {/* 1st Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, #ffd700, #ffb800)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>1</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{shops[0]?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{shops[0]?.area}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>{shops[0]?.eco_score}</div>
                    </div>

                    {/* 3rd Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            background: 'linear-gradient(135deg, #cd7f32, #a86528)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>3</span>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{shops[2]?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shops[2]?.area}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)' }}>{shops[2]?.eco_score}</div>
                    </div>
                </div>
            </div>

            {/* Full Leaderboard */}
            <div className="glass-card" style={{ marginTop: 'var(--spacing-md)' }}>
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Full Rankings</h3>
                </div>
                <div>
                    {filteredShops.map((shop, idx) => (
                        <div key={shop.id} className="leaderboard-item">
                            <div className={`leaderboard-rank ${getRankClass(idx + 1)}`}>
                                {idx + 1}
                            </div>
                            <div className="leaderboard-info">
                                <div className="leaderboard-name">{shop.name}</div>
                                <div className="leaderboard-area">{shop.area}</div>
                                {shop.badges.length > 0 && (
                                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
                                        {shop.badges.map((badge, i) => (
                                            <span key={i} className="waste-badge low" style={{ fontSize: '0.65rem' }}>{badge}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="leaderboard-score" style={{ color: getScoreColor(shop.eco_score) }}>
                                    {shop.eco_score}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {shop.waste_reduction}% reduced
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default EcoLeaderboard
