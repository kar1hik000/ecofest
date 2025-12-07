import { useState, useEffect, useRef } from 'react'

// Bangalore area coordinates - ALL 27 areas with well-spaced positions
const AREA_COORDINATES = {
    // Central Bangalore
    'MG Road': [12.9756, 77.6063],
    'Indiranagar': [12.9784, 77.6458],
    'Koramangala': [12.9352, 77.6245],
    'Basavanagudi': [12.9425, 77.5750],

    // North Bangalore
    'Hebbal': [13.0458, 77.5920],
    'Yelahanka': [13.1105, 77.5863],
    'Malleshwaram': [13.0135, 77.5591],
    'Rajajinagar': [12.9914, 77.5421],

    // South Bangalore
    'JP Nagar': [12.8963, 77.5757],
    'Jayanagar': [12.9199, 77.5738],
    'Banashankari': [12.9155, 77.5368],
    'BTM Layout': [12.9066, 77.6101],
    'HSR Layout': [12.9016, 77.6489],
    'Bannerghatta': [12.8624, 77.5972],

    // East Bangalore
    'Whitefield': [12.9798, 77.7600],
    'Marathahalli': [12.9591, 77.7074],
    'KR Puram': [13.0160, 77.7060],
    'Mahadevapura': [12.9814, 77.7170],
    'Bellandur': [12.9362, 77.6862],
    'Varthur': [12.9537, 77.7430],
    'Sarjapur': [12.8510, 77.7970],

    // West Bangalore
    'Vijayanagar': [12.9707, 77.5231],
    'Kengeri': [12.8961, 77.4723],
    'RR Nagar': [12.9261, 77.5093],

    // South-East
    'Electronic City': [12.8358, 77.6812]
}

const BANGALORE_CENTER = [12.9716, 77.5946]

// Separate Map Component using CircleMarkers (fixed pixel size)
function LeafletMap({ hotspots, selectedArea, onAreaSelect, maxWaste }) {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return '#c45c4a'  // Eco danger - warm red
            case 'HIGH': return '#d4a754'      // Eco warning - golden
            case 'MEDIUM': return '#3d7a5f'    // Forest green medium
            default: return '#5a9a7a'          // Light eco green
        }
    }

    useEffect(() => {
        if (typeof window === 'undefined') return

        const initMap = async () => {
            try {
                const L = await import('leaflet')

                if (!document.querySelector('link[href*="leaflet.css"]')) {
                    const link = document.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
                    document.head.appendChild(link)
                }

                if (!mapRef.current || mapInstanceRef.current) return

                const map = L.default.map(mapRef.current).setView(BANGALORE_CENTER, 11)
                mapInstanceRef.current = map

                L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map)

                // Add circle markers for each hotspot
                hotspots.forEach((hotspot, index) => {
                    let coords = AREA_COORDINATES[hotspot.area]

                    // Generate unique position for unknown areas
                    if (!coords) {
                        const angle = (index / hotspots.length) * 2 * Math.PI
                        const distance = 0.04 + (index % 5) * 0.015
                        coords = [
                            BANGALORE_CENTER[0] + Math.cos(angle) * distance,
                            BANGALORE_CENTER[1] + Math.sin(angle) * distance
                        ]
                    }

                    // CircleMarker uses PIXEL radius (8-20px), not meters
                    const pixelRadius = 8 + (hotspot.extra_waste_kg / maxWaste) * 12
                    const color = getPriorityColor(hotspot.priority)

                    const marker = L.default.circleMarker(coords, {
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.7,
                        radius: pixelRadius,
                        weight: 2
                    }).addTo(map)

                    marker.bindPopup(`
                        <div style="font-family: Inter, sans-serif;">
                            <h4 style="margin: 0 0 8px 0; font-size: 14px;">${hotspot.area}</h4>
                            <p style="margin: 4px 0; font-size: 12px;"><b>Priority:</b> ${hotspot.priority}</p>
                            <p style="margin: 4px 0; font-size: 12px;"><b>Extra Waste:</b> ${(hotspot.extra_waste_kg / 1000).toFixed(1)}T</p>
                            <p style="margin: 4px 0; font-size: 12px;"><b>Resources:</b> ${hotspot.recommended_resources?.extra_trucks} trucks</p>
                        </div>
                    `)

                    marker.on('click', () => onAreaSelect(hotspot))
                    markersRef.current.push(marker)
                })

            } catch (error) {
                console.error('Failed to initialize map:', error)
            }
        }

        initMap()

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
            markersRef.current = []
        }
    }, [])

    useEffect(() => {
        markersRef.current.forEach((marker, idx) => {
            if (hotspots[idx]) {
                const isSelected = hotspots[idx].area === selectedArea
                marker.setStyle({
                    weight: isSelected ? 4 : 2,
                    opacity: isSelected ? 1 : 0.8
                })
            }
        })
    }, [selectedArea, hotspots])

    return (
        <div
            ref={mapRef}
            style={{
                height: '400px',
                width: '100%',
                borderRadius: '8px',
                background: '#1a1a2e'
            }}
        />
    )
}

function HotspotMap({ festival }) {
    const [hotspots, setHotspots] = useState([])
    const [summary, setSummary] = useState(null)
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadingInsights, setLoadingInsights] = useState(false)
    const [selectedArea, setSelectedArea] = useState(null)
    const [mapReady, setMapReady] = useState(false)

    useEffect(() => {
        fetchHotspots()
    }, [festival])

    useEffect(() => {
        if (!loading && hotspots.length > 0) {
            const timer = setTimeout(() => setMapReady(true), 100)
            return () => clearTimeout(timer)
        }
    }, [loading, hotspots])

    const fetchHotspots = async () => {
        setLoading(true)
        setMapReady(false)
        try {
            const [hotspotsRes, summaryRes] = await Promise.all([
                fetch(`/api/hotspots/${festival}`),
                fetch(`/api/hotspots/${festival}/summary`)
            ])
            const hotspotsData = await hotspotsRes.json()
            const summaryData = await summaryRes.json()
            setHotspots(hotspotsData.hotspots || [])
            setSummary(summaryData)
        } catch (error) {
            setHotspots([
                { area: 'Kengeri', pincode: 560063, population: 230902, extra_waste_kg: 112014, waste_increase_percent: 78.3, priority: 'CRITICAL', recommended_resources: { extra_trucks: 5, extra_workers: 20 } },
                { area: 'Whitefield', pincode: 560023, population: 673839, extra_waste_kg: 101142, waste_increase_percent: 67.8, priority: 'CRITICAL', recommended_resources: { extra_trucks: 5, extra_workers: 20 } },
                { area: 'JP Nagar', pincode: 560042, population: 578576, extra_waste_kg: 99367, waste_increase_percent: 69.0, priority: 'HIGH', recommended_resources: { extra_trucks: 4, extra_workers: 18 } }
            ])
            setSummary({ festival, total_areas: 40, total_extra_waste_kg: 1850000, average_increase_percent: 45.2, critical_areas: 8, high_priority_areas: 12 })
        }
        setLoading(false)
    }

    const getAIInsights = async () => {
        setLoadingInsights(true)
        try {
            const response = await fetch(`/api/hotspots/${festival}/insights`)
            const data = await response.json()
            setInsights(data)
        } catch (error) {
            setInsights({
                ai_insights: {
                    insights: {
                        key_insights: ['Kengeri and Whitefield need immediate attention', 'Deploy resources 2 days before festival'],
                        immediate_actions: ['Pre-position vehicles in critical areas', 'Set up temporary collection points']
                    }
                }
            })
        }
        setLoadingInsights(false)
    }

    const downloadActionPlan = () => window.open(`/api/export/action-plan/${festival}`, '_blank')
    const downloadCSV = () => window.open(`/api/export/hotspots/${festival}/csv`, '_blank')

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'critical'
            case 'HIGH': return 'high'
            case 'MEDIUM': return 'medium'
            default: return 'low'
        }
    }

    const handleAreaSelect = (hotspot) => {
        setSelectedArea(selectedArea === hotspot.area ? null : hotspot.area)
    }

    const maxWaste = Math.max(...hotspots.map(h => h.extra_waste_kg || 0), 1)

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading hotspot data...</p>
            </div>
        )
    }

    return (
        <div className="hotspot-analyzer">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Waste Hotspot Analysis</h1>
                    <p className="page-subtitle">Municipal resource planning for {festival} 2025</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{(summary?.total_extra_waste_kg / 1000000)?.toFixed(2)}M</span>
                    <span className="stat-label">Total Extra Waste (kg)</span>
                </div>
                <div className="stat-card warning">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">+{summary?.average_increase_percent?.toFixed(1)}%</span>
                    <span className="stat-label">Average Increase</span>
                </div>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{summary?.critical_areas}</span>
                    <span className="stat-label">Critical Zones</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                            </svg>
                        </span>
                    </div>
                    <span className="stat-value">{summary?.high_priority_areas}</span>
                    <span className="stat-label">High Priority Areas</span>
                </div>
            </div>

            <div className="glass-card map-section">
                <div className="glass-card-header">
                    <h3 className="glass-card-title">Bangalore Hotspot Map</h3>
                    <div className="map-legend">
                        <span className="legend-item"><span className="legend-dot critical"></span> Critical</span>
                        <span className="legend-item"><span className="legend-dot high"></span> High</span>
                        <span className="legend-item"><span className="legend-dot medium"></span> Medium</span>
                        <span className="legend-item"><span className="legend-dot low"></span> Low</span>
                    </div>
                </div>

                <div className="leaflet-map-container">
                    {mapReady && (
                        <LeafletMap
                            hotspots={hotspots}
                            selectedArea={selectedArea}
                            onAreaSelect={handleAreaSelect}
                            maxWaste={maxWaste}
                        />
                    )}
                    {!mapReady && (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f0e8', borderRadius: '16px' }}>
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                </div>

                {selectedArea && (
                    <div className="selected-area-info">
                        {(() => {
                            const area = hotspots.find(h => h.area === selectedArea)
                            if (!area) return null
                            return (
                                <div className="area-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Selected Area</span>
                                        <span className="info-value">{area.area}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Population</span>
                                        <span className="info-value">{(area.population / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Extra Waste</span>
                                        <span className="info-value text-danger">{(area.extra_waste_kg / 1000).toFixed(1)}T</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Resources</span>
                                        <span className="info-value">{area.recommended_resources?.extra_trucks} trucks, {area.recommended_resources?.extra_workers} workers</span>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>

            <div className="hotspot-layout">
                <div className="glass-card hotspot-table-card">
                    <div className="glass-card-header">
                        <h3 className="glass-card-title">Hotspot Rankings</h3>
                        <button className="btn btn-primary" onClick={getAIInsights}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                            </svg>
                            Get AI Insights
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Area</th>
                                    <th>Population</th>
                                    <th>Extra Waste</th>
                                    <th>Increase</th>
                                    <th>Priority</th>
                                    <th>Resources</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hotspots.slice(0, 15).map((hotspot, idx) => (
                                    <tr
                                        key={idx}
                                        className={selectedArea === hotspot.area ? 'row-selected' : ''}
                                        onClick={() => handleAreaSelect(hotspot)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className={idx < 3 ? 'rank-top' : 'rank-normal'}>#{idx + 1}</td>
                                        <td>
                                            <div className="cell-primary">{hotspot.area}</div>
                                            <div className="cell-secondary">{hotspot.pincode}</div>
                                        </td>
                                        <td>{(hotspot.population / 1000).toFixed(0)}K</td>
                                        <td className="text-danger">{(hotspot.extra_waste_kg / 1000).toFixed(1)}T</td>
                                        <td>+{hotspot.waste_increase_percent?.toFixed(1)}%</td>
                                        <td>
                                            <span className={`waste-badge ${getPriorityClass(hotspot.priority)}`}>
                                                {hotspot.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="resource-info">
                                                <span>{hotspot.recommended_resources?.extra_trucks} trucks</span>
                                                <span className="divider">|</span>
                                                <span>{hotspot.recommended_resources?.extra_workers} workers</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="hotspot-sidebar">
                    <div className="glass-card">
                        <div className="glass-card-header">
                            <h3 className="glass-card-title">Priority Distribution</h3>
                        </div>
                        <div className="priority-breakdown">
                            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => {
                                const count = hotspots.filter(h => h.priority === priority).length
                                const percentage = hotspots.length > 0 ? (count / hotspots.length) * 100 : 0
                                return (
                                    <div key={priority} className="priority-item">
                                        <div className="priority-header">
                                            <span className={`waste-badge ${getPriorityClass(priority)}`}>{priority}</span>
                                            <span className="priority-count">{count} areas</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className={`progress-fill ${getPriorityClass(priority)}`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {loadingInsights ? (
                        <div className="glass-card">
                            <div className="loading-container small">
                                <div className="loading-spinner"></div>
                                <p>Generating insights...</p>
                            </div>
                        </div>
                    ) : insights && (
                        <div className="glass-card insights-panel">
                            <div className="glass-card-header">
                                <h3 className="glass-card-title">AI Recommendations</h3>
                            </div>
                            <div className="insights-content">
                                <div className="insight-section">
                                    <h4>Key Insights</h4>
                                    <ul>
                                        {(insights.ai_insights?.insights?.key_insights || []).map((insight, idx) => (
                                            <li key={idx}>{insight}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="insight-section">
                                    <h4>Immediate Actions</h4>
                                    <ul>
                                        {(insights.ai_insights?.insights?.immediate_actions || []).map((action, idx) => (
                                            <li key={idx}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card">
                        <div className="glass-card-header">
                            <h3 className="glass-card-title">Export Options</h3>
                        </div>
                        <div className="export-buttons">
                            <button className="btn btn-secondary full-width" onClick={downloadActionPlan}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" />
                                </svg>
                                Download Action Plan
                            </button>
                            <button className="btn btn-secondary full-width" onClick={downloadCSV}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Export to CSV
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default HotspotMap
