import { useState, useEffect } from 'react'

function FestivalComparison() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedFestival, setSelectedFestival] = useState(null)

    useEffect(() => {
        fetchComparisonData()
    }, [])

    const fetchComparisonData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/festivals/comparison')
            const result = await response.json()
            setData(result.festivals || [])
        } catch (error) {
            // Mock data
            setData([
                {
                    name: 'Diwali',
                    total_waste_kg: 2450000,
                    extra_waste_kg: 850000,
                    increase_percent: 53,
                    critical_areas: 8,
                    high_areas: 12,
                    trucks_needed: 45,
                    workers_needed: 180,
                    top_waste_categories: ['Plastic', 'Packaging', 'Food Waste']
                },
                {
                    name: 'Holi',
                    total_waste_kg: 1850000,
                    extra_waste_kg: 650000,
                    increase_percent: 42,
                    critical_areas: 5,
                    high_areas: 10,
                    trucks_needed: 35,
                    workers_needed: 140,
                    top_waste_categories: ['Plastic', 'Colors', 'Water Containers']
                },
                {
                    name: 'Ganesh Chaturthi',
                    total_waste_kg: 2100000,
                    extra_waste_kg: 780000,
                    increase_percent: 48,
                    critical_areas: 7,
                    high_areas: 11,
                    trucks_needed: 42,
                    workers_needed: 165,
                    top_waste_categories: ['Plaster', 'Decoration', 'Food Waste']
                },
                {
                    name: 'Navratri',
                    total_waste_kg: 1650000,
                    extra_waste_kg: 520000,
                    increase_percent: 38,
                    critical_areas: 4,
                    high_areas: 8,
                    trucks_needed: 28,
                    workers_needed: 110,
                    top_waste_categories: ['Decoration', 'Cloth', 'Food Waste']
                },
                {
                    name: 'Ugadi',
                    total_waste_kg: 1420000,
                    extra_waste_kg: 380000,
                    increase_percent: 32,
                    critical_areas: 3,
                    high_areas: 6,
                    trucks_needed: 22,
                    workers_needed: 85,
                    top_waste_categories: ['Food Waste', 'Packaging', 'Organic']
                }
            ])
        }
        setLoading(false)
    }

    const maxWaste = Math.max(...data.map(f => f.total_waste_kg), 1)
    const totalExtraWaste = data.reduce((sum, f) => sum + f.extra_waste_kg, 0)
    const avgIncrease = data.reduce((sum, f) => sum + f.increase_percent, 0) / data.length || 0

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading festival data...</p>
            </div>
        )
    }

    return (
        <div className="festival-comparison">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Festival Comparison</h1>
                    <p className="page-subtitle">Compare waste patterns across different festivals</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{data.length}</span>
                    <span className="stat-label">Festivals Analyzed</span>
                </div>
                <div className="stat-card warning">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{(totalExtraWaste / 1000000).toFixed(1)}M</span>
                    <span className="stat-label">Total Extra Waste (kg)</span>
                </div>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">+{avgIncrease.toFixed(0)}%</span>
                    <span className="stat-label">Average Increase</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{data[0]?.name}</span>
                    <span className="stat-label">Highest Waste Festival</span>
                </div>
            </div>

            {/* Festival Cards */}
            <div className="glass-card">
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Festival Waste Overview</h3>
                </div>
                <div className="comparison-grid" style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 5)}, 1fr)` }}>
                    {data.map((festival, idx) => (
                        <div
                            key={idx}
                            className={`comparison-card ${selectedFestival === festival.name ? 'active' : ''}`}
                            onClick={() => setSelectedFestival(selectedFestival === festival.name ? null : festival.name)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="comparison-festival">{festival.name}</div>
                            <div className="comparison-value">{(festival.total_waste_kg / 1000000).toFixed(2)}M</div>
                            <div className="comparison-label">Total Waste (kg)</div>
                            <div style={{
                                marginTop: '12px',
                                height: '8px',
                                background: 'var(--bg-primary)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(festival.total_waste_kg / maxWaste) * 100}%`,
                                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-warning))',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                            <div style={{
                                marginTop: '8px',
                                fontSize: '0.8rem',
                                color: festival.increase_percent > 45 ? 'var(--accent-danger)' : 'var(--accent-warning)'
                            }}>
                                +{festival.increase_percent}% increase
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Festival Details */}
            {selectedFestival && (
                <div className="glass-card" style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">{selectedFestival} - Detailed Analysis</h3>
                        <span className="waste-badge critical">Selected</span>
                    </div>
                    {(() => {
                        const festival = data.find(f => f.name === selectedFestival)
                        if (!festival) return null
                        return (
                            <>
                                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div className="stat-card">
                                        <span className="stat-value">{(festival.extra_waste_kg / 1000).toFixed(0)}T</span>
                                        <span className="stat-label">Extra Waste</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{festival.critical_areas}</span>
                                        <span className="stat-label">Critical Areas</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{festival.trucks_needed}</span>
                                        <span className="stat-label">Trucks Required</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{festival.workers_needed}</span>
                                        <span className="stat-label">Workers Needed</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Top Waste Categories</h4>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {festival.top_waste_categories.map((cat, i) => (
                                            <span key={i} className="waste-badge medium">{cat}</span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* Comparison Table */}
            <div className="glass-card" style={{ marginTop: 'var(--spacing-md)' }}>
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Detailed Comparison</h3>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Festival</th>
                                <th>Total Waste</th>
                                <th>Extra Waste</th>
                                <th>Increase</th>
                                <th>Critical Areas</th>
                                <th>Resources</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((festival, idx) => (
                                <tr key={idx}>
                                    <td className="cell-primary">{festival.name}</td>
                                    <td>{(festival.total_waste_kg / 1000000).toFixed(2)}M kg</td>
                                    <td className="text-danger">{(festival.extra_waste_kg / 1000).toFixed(0)}T</td>
                                    <td>
                                        <span className={`waste-badge ${festival.increase_percent > 45 ? 'critical' : festival.increase_percent > 35 ? 'high' : 'medium'}`}>
                                            +{festival.increase_percent}%
                                        </span>
                                    </td>
                                    <td>{festival.critical_areas}</td>
                                    <td>{festival.trucks_needed} trucks, {festival.workers_needed} workers</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default FestivalComparison
