import { useState, useEffect } from 'react'

// API Base URL - uses env variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function ShopAnalyzer({ festival }) {
    const [shops, setShops] = useState([])
    const [selectedShop, setSelectedShop] = useState(null)
    const [shopData, setShopData] = useState(null)
    const [suggestions, setSuggestions] = useState(null)
    const [marketing, setMarketing] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchShops()
    }, [])

    const fetchShops = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/shops`)
            const data = await response.json()
            setShops(data.shops || [])
        } catch (error) {
            setShops([
                { Shop_ID: 'S0208', Shop_Name: 'Ganesh Supermarket', Area: 'Electronic City' },
                { Shop_ID: 'S0169', Shop_Name: 'Ganesh Gifts', Area: 'MG Road' },
                { Shop_ID: 'S0507', Shop_Name: 'City Gifts', Area: 'Marathahalli' }
            ])
        }
    }

    const analyzeShop = async (shopId) => {
        setLoading(true)
        setSelectedShop(shopId)
        setSuggestions(null)
        setMarketing(null)

        try {
            const response = await fetch(`${API_BASE_URL}/api/shops/${shopId}?festival=${festival}`)
            const data = await response.json()
            setShopData(data)
        } catch (error) {
            setShopData({
                shop_id: shopId,
                shop_name: 'Demo Shop',
                area: 'MG Road',
                festival: festival,
                waste_score: 0.78,
                waste_level: 'HIGH',
                total_waste_kg: 245.5,
                total_items_sold: 150,
                high_waste_products: [
                    { Item_Name: 'Plastic Diya Pack', Quantity_Sold: 50, Item_Waste_Score: 0.85, Estimated_Waste_kg: 42.5 },
                    { Item_Name: 'Thermocol Decoration Kit', Quantity_Sold: 20, Item_Waste_Score: 0.94, Estimated_Waste_kg: 18.8 }
                ]
            })
        }
        setLoading(false)
    }

    const getEcoSuggestions = async () => {
        if (!selectedShop) return
        setLoadingSuggestions(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/shops/${selectedShop}/suggestions?festival=${festival}`)
            const data = await response.json()
            setSuggestions(data)
        } catch (error) {
            setSuggestions({
                ai_suggestions: {
                    suggestions: {
                        alternatives: [
                            { instead_of: 'Plastic Diya', use: 'Clay Diya', reason: 'Biodegradable', waste_reduction: '80%' },
                            { instead_of: 'Thermocol Kit', use: 'Paper Lanterns', reason: 'Recyclable', waste_reduction: '60%' }
                        ],
                        general_tips: [
                            'Stock more eco-friendly products before festivals',
                            'Display green alternatives prominently',
                            'Offer discounts on sustainable items'
                        ]
                    }
                },
                static_alternatives: [
                    { instead_of: 'Plastic Diya Pack', use: 'Clay Diya Pack' },
                    { instead_of: 'Synthetic Gulal', use: 'Herbal Gulal' }
                ]
            })
        }
        setLoadingSuggestions(false)
    }

    const getMarketing = async () => {
        if (!selectedShop) return

        try {
            const response = await fetch(`${API_BASE_URL}/api/shops/${selectedShop}/marketing?festival=${festival}`)
            const data = await response.json()
            setMarketing(data)
        } catch (error) {
            setMarketing({
                marketing: {
                    messages: {
                        sms: 'Celebrate Green ' + festival + '! Switch to eco-friendly diyas & decorations. Special offers at our store!',
                        whatsapp: '*Happy ' + festival + '!*\n\nMake your celebration eco-friendly!\n- Clay Diyas\n- Herbal Colors\n- Paper Lanterns\n\n*Special 20% OFF* on green products!',
                        poster_tagline: 'Go Green This ' + festival + '!',
                        social_media: 'Celebrate responsibly this ' + festival + '! Our eco-friendly collection helps you enjoy the festival while protecting the environment. #Green' + festival + ' #EcoFriendly'
                    }
                }
            })
        }
    }

    const filteredShops = shops.filter(shop =>
        shop.Shop_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.Area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.Shop_ID?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getWasteLevelClass = (level) => {
        switch (level?.toUpperCase()) {
            case 'HIGH': return 'danger'
            case 'MEDIUM': return 'warning'
            case 'LOW': return 'success'
            default: return ''
        }
    }

    return (
        <div className="shop-analyzer">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Shop Waste Analysis</h1>
                    <p className="page-subtitle">
                        Analyze individual shop waste patterns and receive AI-powered eco-friendly recommendations
                    </p>
                </div>
            </div>

            <div className="analyzer-layout">
                {/* Shop List Sidebar */}
                <aside className="shop-sidebar glass-card">
                    <div className="sidebar-header">
                        <h3>Select Shop</h3>
                        <span className="shop-count">{filteredShops.length} shops</span>
                    </div>

                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="shop-list">
                        {filteredShops.slice(0, 50).map((shop) => (
                            <div
                                key={shop.Shop_ID}
                                onClick={() => analyzeShop(shop.Shop_ID)}
                                className={`shop-item ${selectedShop === shop.Shop_ID ? 'active' : ''}`}
                            >
                                <div className="shop-name">{shop.Shop_Name}</div>
                                <div className="shop-area">{shop.Area}</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Analysis Panel */}
                <div className="analysis-panel">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Analyzing shop data...</p>
                        </div>
                    ) : shopData ? (
                        <>
                            {/* Shop Overview Card */}
                            <div className="glass-card shop-overview">
                                <div className="overview-header">
                                    <div>
                                        <h2 className="shop-title">{shopData.shop_name}</h2>
                                        <p className="shop-location">{shopData.area} • {festival} Analysis</p>
                                    </div>
                                    <span className={`waste-badge ${getWasteLevelClass(shopData.waste_level)}`}>
                                        {shopData.waste_level} Impact
                                    </span>
                                </div>

                                <div className="metrics-row">
                                    <div className="metric-item">
                                        <div className="metric-value">{(shopData.waste_score * 100).toFixed(0)}%</div>
                                        <div className="metric-label">Waste Score</div>
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-fill ${getWasteLevelClass(shopData.waste_level)}`}
                                                style={{ width: `${shopData.waste_score * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-value">{shopData.total_waste_kg?.toFixed(1)}</div>
                                        <div className="metric-label">Total Waste (kg)</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-value">{shopData.total_items_sold}</div>
                                        <div className="metric-label">Items Sold</div>
                                    </div>
                                </div>
                            </div>

                            {/* High Waste Products */}
                            <div className="glass-card">
                                <div className="glass-card-header">
                                    <h3 className="glass-card-title">High Impact Products</h3>
                                    <button className="btn btn-primary" onClick={getEcoSuggestions}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                                        </svg>
                                        Get AI Recommendations
                                    </button>
                                </div>

                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Quantity Sold</th>
                                            <th>Waste Score</th>
                                            <th>Est. Waste (kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(shopData.high_waste_products || []).map((product, idx) => (
                                            <tr key={idx}>
                                                <td className="cell-primary">{product.Item_Name}</td>
                                                <td>{product.Quantity_Sold}</td>
                                                <td>
                                                    <span className={`waste-badge ${product.Item_Waste_Score > 0.8 ? 'high' : 'medium'}`}>
                                                        {(product.Item_Waste_Score * 100).toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className="text-danger">
                                                    {product.Estimated_Waste_kg?.toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* AI Suggestions */}
                            {loadingSuggestions ? (
                                <div className="glass-card">
                                    <div className="loading-container">
                                        <div className="loading-spinner"></div>
                                        <p>Generating AI recommendations...</p>
                                    </div>
                                </div>
                            ) : suggestions && (
                                <div className="glass-card">
                                    <div className="glass-card-header">
                                        <h3 className="glass-card-title">Eco-Friendly Alternatives</h3>
                                        <button className="btn btn-secondary" onClick={getMarketing}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                            </svg>
                                            Generate Marketing
                                        </button>
                                    </div>

                                    <div className="suggestions-grid">
                                        {/* Product Swaps */}
                                        <div className="suggestion-section">
                                            <h4 className="section-title">Recommended Product Swaps</h4>
                                            {(suggestions.static_alternatives || []).map((alt, idx) => (
                                                <div key={idx} className="swap-item">
                                                    <div className="swap-from">
                                                        <span className="swap-label">Replace</span>
                                                        <span className="swap-product">{alt.instead_of}</span>
                                                    </div>
                                                    <div className="swap-arrow">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="swap-to">
                                                        <span className="swap-label">With</span>
                                                        <span className="swap-product eco">{alt.use}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* AI Tips */}
                                        <div className="suggestion-section">
                                            <h4 className="section-title">AI Recommendations</h4>
                                            <ul className="tips-list">
                                                {(suggestions.ai_suggestions?.suggestions?.general_tips || []).map((tip, idx) => (
                                                    <li key={idx}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Marketing Messages */}
                            {marketing && (
                                <div className="glass-card">
                                    <div className="glass-card-header">
                                        <h3 className="glass-card-title">Marketing Campaign Content</h3>
                                    </div>

                                    <div className="marketing-grid">
                                        <div className="marketing-item">
                                            <h4>SMS Message</h4>
                                            <div className="message-box">
                                                {marketing.marketing?.messages?.sms}
                                            </div>
                                        </div>

                                        <div className="marketing-item">
                                            <h4>WhatsApp Message</h4>
                                            <div className="message-box whatsapp">
                                                {marketing.marketing?.messages?.whatsapp}
                                            </div>
                                        </div>

                                        <div className="marketing-item full-width">
                                            <h4>Campaign Tagline</h4>
                                            <div className="tagline-box">
                                                {marketing.marketing?.messages?.poster_tagline}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state glass-card">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                            </svg>
                            <h3>Select a Shop</h3>
                            <p>Choose a shop from the list to analyze its waste patterns and get AI-powered recommendations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopAnalyzer
