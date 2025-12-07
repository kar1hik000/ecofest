"""Flask API server for Festival Waste Prediction system."""

from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
import os
import json
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import modules
from data_loader import (
    load_sales_data, load_area_festivals, load_products,
    get_all_shops, get_all_festivals, get_all_areas
)
from waste_calculator import (
    calculate_shop_waste, get_shop_comparison, get_eco_alternatives
)
from hotspot_analyzer import (
    identify_hotspots, get_festival_summary, get_area_details
)
from gemini_suggester import (
    generate_eco_suggestions, generate_marketing_message,
    generate_municipality_insights, ai_chat, generate_prediction_summary
)
from auth import (
    authenticate_user, generate_token, verify_token,
    token_required, admin_required
)


# Custom JSON provider for numpy types
class NumpyJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


# Initialize Flask app
app = Flask(__name__)
app.json_provider_class = NumpyJSONProvider
app.json = NumpyJSONProvider(app)
CORS(app)  # Enable CORS for frontend

# Cache data on startup
print("Loading datasets...")
SALES_DF = load_sales_data()
AREA_DF = load_area_festivals()
PRODUCTS_DF = load_products()
print(f"Loaded {len(SALES_DF)} sales records, {len(AREA_DF)} area-festival records")


# ==================== BASIC ENDPOINTS ====================

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for health checks."""
    return jsonify({
        'name': 'EcoFest API',
        'status': 'running',
        'version': '1.0.0'
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'sales_records': len(SALES_DF),
        'areas': len(AREA_DF['Area'].unique()),
        'festivals': list(SALES_DF['Festival'].unique())
    })


@app.route('/api/shops', methods=['GET'])
def list_shops():
    """Get all shops with optional filtering."""
    area = request.args.get('area')
    
    shops = get_all_shops(SALES_DF)
    
    if area:
        shops = [s for s in shops if s['Area'] == area]
    
    return jsonify({
        'count': len(shops),
        'shops': shops
    })


@app.route('/api/festivals', methods=['GET'])
def list_festivals():
    """Get all festivals."""
    festivals = get_all_festivals(SALES_DF)
    return jsonify({'festivals': festivals})


@app.route('/api/areas', methods=['GET'])
def list_areas():
    """Get all areas."""
    areas = get_all_areas(AREA_DF)
    return jsonify({
        'count': len(areas),
        'areas': areas
    })


# ==================== SHOP ANALYSIS ====================

@app.route('/api/shops/<shop_id>', methods=['GET'])
def get_shop_analysis(shop_id):
    """Get detailed waste analysis for a shop."""
    festival = request.args.get('festival')
    
    result = calculate_shop_waste(shop_id, festival, SALES_DF)
    
    if result is None:
        return jsonify({'error': 'Shop not found'}), 404
    
    return jsonify(result)


@app.route('/api/shops/<shop_id>/suggestions', methods=['GET'])
def get_shop_suggestions(shop_id):
    """Get AI-powered eco suggestions for a shop."""
    festival = request.args.get('festival', 'Diwali')
    
    # Get shop waste data
    shop_data = calculate_shop_waste(shop_id, festival, SALES_DF)
    
    if shop_data is None:
        return jsonify({'error': 'Shop not found'}), 404
    
    # Get AI suggestions
    high_waste = shop_data.get('high_waste_products', [])
    
    if not high_waste:
        return jsonify({
            'message': 'No high-waste products found for this shop',
            'suggestions': None
        })
    
    suggestions = generate_eco_suggestions(
        high_waste,
        shop_data['shop_name'],
        festival
    )
    
    # Add static alternatives
    alternatives_map = get_eco_alternatives()
    static_alternatives = []
    for product in high_waste:
        item_name = product.get('Item_Name', '')
        if item_name in alternatives_map:
            static_alternatives.append({
                'instead_of': item_name,
                'use': alternatives_map[item_name]
            })
    
    return jsonify({
        'shop': shop_data['shop_name'],
        'festival': festival,
        'high_waste_products': high_waste,
        'ai_suggestions': suggestions,
        'static_alternatives': static_alternatives
    })


@app.route('/api/shops/<shop_id>/marketing', methods=['GET'])
def get_shop_marketing(shop_id):
    """Generate marketing messages for a shop."""
    festival = request.args.get('festival', 'Diwali')
    
    # Get shop data
    shop_data = calculate_shop_waste(shop_id, festival, SALES_DF)
    
    if shop_data is None:
        return jsonify({'error': 'Shop not found'}), 404
    
    # Get eco alternatives to promote
    alternatives_map = get_eco_alternatives()
    eco_products = list(set(alternatives_map.values()))[:5]
    
    # Generate marketing messages
    messages = generate_marketing_message(
        shop_data['shop_name'],
        festival,
        eco_products
    )
    
    return jsonify({
        'shop': shop_data['shop_name'],
        'festival': festival,
        'marketing': messages
    })


@app.route('/api/compare-shops', methods=['GET'])
def compare_shops():
    """Compare waste across shops."""
    area = request.args.get('area')
    festival = request.args.get('festival')
    
    comparison = get_shop_comparison(area, festival, SALES_DF)
    
    return jsonify({
        'area': area or 'All Areas',
        'festival': festival or 'All Festivals',
        'shops': comparison
    })


# ==================== HOTSPOT ANALYSIS ====================

@app.route('/api/hotspots/<festival>', methods=['GET'])
def get_hotspots(festival):
    """Get waste hotspots for a festival."""
    hotspots = identify_hotspots(festival, AREA_DF)
    
    if not hotspots:
        return jsonify({'error': 'Festival not found'}), 404
    
    return jsonify({
        'festival': festival,
        'hotspots': hotspots
    })


@app.route('/api/hotspots/<festival>/summary', methods=['GET'])
def get_hotspots_summary(festival):
    """Get summary statistics for festival hotspots."""
    summary = get_festival_summary(festival, AREA_DF)
    
    if summary is None:
        return jsonify({'error': 'Festival not found'}), 404
    
    return jsonify(summary)


@app.route('/api/hotspots/<festival>/insights', methods=['GET'])
def get_hotspots_insights(festival):
    """Get AI-powered insights for municipality."""
    hotspots = identify_hotspots(festival, AREA_DF)
    
    if not hotspots:
        return jsonify({'error': 'Festival not found'}), 404
    
    insights = generate_municipality_insights(hotspots, festival)
    
    return jsonify({
        'festival': festival,
        'top_hotspots': hotspots[:5],
        'ai_insights': insights
    })


@app.route('/api/areas/<area>', methods=['GET'])
def get_area_info(area):
    """Get detailed information for an area."""
    result = get_area_details(area, area_df=AREA_DF)
    
    if result is None:
        return jsonify({'error': 'Area not found'}), 404
    
    return jsonify(result)


# ==================== DASHBOARD STATS ====================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get overall dashboard statistics."""
    festival = request.args.get('festival', 'Diwali')
    
    # Get summary for festival
    summary = get_festival_summary(festival, AREA_DF)
    
    # Get top shops by waste
    top_shops = get_shop_comparison(festival=festival, sales_df=SALES_DF)[:5]
    
    # Get hotspots
    hotspots = identify_hotspots(festival, AREA_DF)
    critical_hotspots = [h for h in hotspots if h['priority'] == 'CRITICAL']
    
    return jsonify({
        'festival': festival,
        'summary': summary,
        'top_waste_shops': top_shops,
        'critical_hotspots': critical_hotspots,
        'total_shops': len(get_all_shops(SALES_DF)),
        'total_areas': len(get_all_areas(AREA_DF))
    })


# ==================== EXPORT ENDPOINTS ====================

@app.route('/api/export/hotspots/<festival>/csv', methods=['GET'])
def export_hotspots_csv(festival):
    """Export hotspots data as CSV."""
    from flask import Response
    import io
    import csv
    
    hotspots = identify_hotspots(festival, AREA_DF)
    
    if not hotspots:
        return jsonify({'error': 'Festival not found'}), 404
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Rank', 'Area', 'Pincode', 'Population', 
        'Baseline Waste (kg)', 'Extra Waste (kg)', 'Total Waste (kg)',
        'Increase %', 'Priority', 'Extra Trucks', 'Extra Workers', 'Days Needed'
    ])
    
    # Write data
    for idx, h in enumerate(hotspots, 1):
        writer.writerow([
            idx,
            h['area'],
            h['pincode'],
            h['population'],
            h['baseline_waste_kg'],
            h['extra_waste_kg'],
            h['total_waste_kg'],
            f"{h['waste_increase_percent']}%",
            h['priority'],
            h['recommended_resources']['extra_trucks'],
            h['recommended_resources']['extra_workers'],
            h['recommended_resources']['days_needed']
        ])
    
    output.seek(0)
    
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=hotspots_{festival}_2025.csv'}
    )


@app.route('/api/export/action-plan/<festival>', methods=['GET'])
def export_action_plan(festival):
    """Generate and export municipal action plan."""
    from flask import Response
    
    hotspots = identify_hotspots(festival, AREA_DF)
    summary = get_festival_summary(festival, AREA_DF)
    
    if not hotspots:
        return jsonify({'error': 'Festival not found'}), 404
    
    # Generate action plan text
    lines = []
    lines.append("=" * 60)
    lines.append(f"MUNICIPAL WASTE MANAGEMENT ACTION PLAN")
    lines.append(f"Festival: {festival} 2025")
    lines.append("=" * 60)
    lines.append("")
    
    lines.append("EXECUTIVE SUMMARY")
    lines.append("-" * 40)
    lines.append(f"Total Areas Affected: {summary['total_areas']}")
    lines.append(f"Total Extra Waste Expected: {summary['total_extra_waste_kg']:,.0f} kg")
    lines.append(f"Average Waste Increase: {summary['average_increase_percent']:.1f}%")
    lines.append(f"Critical Priority Areas: {summary['critical_areas']}")
    lines.append(f"High Priority Areas: {summary['high_priority_areas']}")
    lines.append(f"Total Extra Trucks Required: {summary['total_extra_trucks_needed']}")
    lines.append(f"Total Extra Workers Required: {summary['total_extra_workers_needed']}")
    lines.append("")
    
    lines.append("CRITICAL ZONES - IMMEDIATE ACTION REQUIRED")
    lines.append("-" * 40)
    critical = [h for h in hotspots if h['priority'] == 'CRITICAL']
    for h in critical:
        lines.append(f"\n{h['area']} (Pincode: {h['pincode']})")
        lines.append(f"  Population: {h['population']:,}")
        lines.append(f"  Extra Waste: {h['extra_waste_kg']:,.0f} kg ({h['waste_increase_percent']:.1f}% increase)")
        lines.append(f"  Resources: {h['recommended_resources']['extra_trucks']} trucks, {h['recommended_resources']['extra_workers']} workers")
        lines.append(f"  Duration: {h['recommended_resources']['days_needed']} days")
    
    lines.append("")
    lines.append("HIGH PRIORITY ZONES")
    lines.append("-" * 40)
    high = [h for h in hotspots if h['priority'] == 'HIGH']
    for h in high[:10]:
        lines.append(f"{h['area']}: {h['extra_waste_kg']:,.0f} kg extra, {h['recommended_resources']['extra_trucks']} trucks needed")
    
    lines.append("")
    lines.append("RECOMMENDED ACTIONS")
    lines.append("-" * 40)
    lines.append("1. Pre-position waste collection vehicles in critical areas 2 days before festival")
    lines.append("2. Set up temporary waste collection points near major markets")
    lines.append("3. Deploy additional workforce in morning and evening shifts")
    lines.append("4. Coordinate with local shops for source segregation")
    lines.append("5. Arrange for special vehicles for festival-specific waste (flowers, decorations)")
    lines.append("")
    lines.append("=" * 60)
    lines.append("Generated by Festival Waste Prediction System")
    lines.append("=" * 60)
    
    content = "\n".join(lines)
    
    return Response(
        content,
        mimetype='text/plain',
        headers={'Content-Disposition': f'attachment; filename=action_plan_{festival}_2025.txt'}
    )


# ==================== AUTH ENDPOINTS ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing request body'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    user = authenticate_user(username, password)
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = generate_token(user['username'], user['role'], user['name'])
    
    return jsonify({
        'token': token,
        'user': user,
        'message': 'Login successful'
    })


@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_auth():
    """Verify if current token is valid."""
    return jsonify({
        'valid': True,
        'user': request.current_user
    })


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user info."""
    return jsonify({
        'username': request.current_user.get('username'),
        'role': request.current_user.get('role'),
        'name': request.current_user.get('name')
    })


# ==================== AI ENDPOINTS ====================

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat_endpoint():
    """AI chat assistant endpoint."""
    data = request.get_json()
    message = data.get('message', '')
    context = data.get('context', {})
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    result = ai_chat(message, context)
    return jsonify(result)


@app.route('/api/ai/summary/<festival>', methods=['GET'])
def ai_prediction_summary(festival):
    """Get AI-generated prediction summary for a festival."""
    # Get festival statistics
    summary = get_festival_summary(AREA_DF, SALES_DF, festival)
    
    if not summary:
        return jsonify({'error': 'Festival not found'}), 404
    
    # Generate AI summary
    result = generate_prediction_summary(festival, summary)
    return jsonify({
        'festival': festival,
        'stats': summary,
        'ai_summary': result.get('summary'),
        'success': result.get('success', False)
    })


# ==================== MAIN ====================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\nFestival Waste Prediction API running on http://localhost:{port}")
    print("Endpoints available:")
    print("   GET  /api/health")
    print("   GET  /api/shops")
    print("   GET  /api/shops/<id>")
    print("   GET  /api/shops/<id>/suggestions")
    print("   GET  /api/hotspots/<festival>")
    print("   GET  /api/dashboard/stats")
    print("   GET  /api/export/hotspots/<festival>/csv")
    print("   GET  /api/export/action-plan/<festival>")
    app.run(host='0.0.0.0', port=port, debug=True)

