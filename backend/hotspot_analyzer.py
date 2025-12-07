"""Hotspot analyzer module for municipality waste predictions."""

import pandas as pd
from data_loader import load_area_festivals, load_sales_data


def get_priority_level(extra_waste_kg):
    """Determine priority level based on extra waste amount."""
    if extra_waste_kg > 80000:
        return "CRITICAL"
    elif extra_waste_kg > 50000:
        return "HIGH"
    elif extra_waste_kg > 30000:
        return "MEDIUM"
    else:
        return "LOW"


def calculate_resources(extra_waste_kg):
    """Calculate recommended extra resources based on waste volume."""
    # Assumptions: 1 truck handles ~5000kg, 1 worker handles ~500kg
    extra_trucks = max(1, int(extra_waste_kg / 20000))
    extra_workers = max(2, int(extra_waste_kg / 5000))
    days_needed = 3 if extra_waste_kg > 50000 else 2
    
    return {
        'extra_trucks': extra_trucks,
        'extra_workers': extra_workers,
        'days_needed': days_needed
    }


def identify_hotspots(festival, area_df=None):
    """
    Identify waste hotspots for a specific festival.
    
    Returns:
        list: Areas ranked by predicted extra waste
    """
    if area_df is None:
        area_df = load_area_festivals()
    
    # Filter for festival
    festival_data = area_df[area_df['Festival'] == festival].copy()
    
    if festival_data.empty:
        return []
    
    # Sort by predicted extra waste
    festival_data = festival_data.sort_values(
        'Predicted_Festival_Extra_Waste_kg', 
        ascending=False
    )
    
    # Add priority levels and resource recommendations
    hotspots = []
    for _, row in festival_data.iterrows():
        extra_waste = row['Predicted_Festival_Extra_Waste_kg']
        resources = calculate_resources(extra_waste)
        
        hotspots.append({
            'area': row['Area'],
            'pincode': int(row['Pincode']),
            'population': int(row['Population']),
            'baseline_waste_kg': round(row['Baseline_Daily_Waste_kg'], 2),
            'extra_waste_kg': round(extra_waste, 2),
            'total_waste_kg': round(row['Predicted_Total_Daily_Waste_kg'], 2),
            'waste_increase_percent': round((extra_waste / row['Baseline_Daily_Waste_kg']) * 100, 1),
            'priority': get_priority_level(extra_waste),
            'recommended_resources': resources
        })
    
    return hotspots


def get_festival_summary(festival, area_df=None):
    """Get summary statistics for a festival."""
    if area_df is None:
        area_df = load_area_festivals()
    
    festival_data = area_df[area_df['Festival'] == festival]
    
    if festival_data.empty:
        return None
    
    total_extra_waste = festival_data['Predicted_Festival_Extra_Waste_kg'].sum()
    total_baseline = festival_data['Baseline_Daily_Waste_kg'].sum()
    
    critical_areas = len(festival_data[festival_data['Predicted_Festival_Extra_Waste_kg'] > 80000])
    high_areas = len(festival_data[
        (festival_data['Predicted_Festival_Extra_Waste_kg'] > 50000) & 
        (festival_data['Predicted_Festival_Extra_Waste_kg'] <= 80000)
    ])
    
    return {
        'festival': festival,
        'total_areas': len(festival_data),
        'total_extra_waste_kg': round(total_extra_waste, 2),
        'total_baseline_kg': round(total_baseline, 2),
        'average_increase_percent': round((total_extra_waste / total_baseline) * 100, 1),
        'critical_areas': critical_areas,
        'high_priority_areas': high_areas,
        'total_extra_trucks_needed': sum(calculate_resources(w)['extra_trucks'] 
                                         for w in festival_data['Predicted_Festival_Extra_Waste_kg']),
        'total_extra_workers_needed': sum(calculate_resources(w)['extra_workers'] 
                                          for w in festival_data['Predicted_Festival_Extra_Waste_kg'])
    }


def get_area_details(area, pincode=None, area_df=None):
    """Get detailed information for a specific area across festivals."""
    if area_df is None:
        area_df = load_area_festivals()
    
    area_data = area_df[area_df['Area'] == area]
    
    if area_data.empty:
        return None
    
    festivals = []
    for _, row in area_data.iterrows():
        festivals.append({
            'festival': row['Festival'],
            'extra_waste_kg': round(row['Predicted_Festival_Extra_Waste_kg'], 2),
            'total_waste_kg': round(row['Predicted_Total_Daily_Waste_kg'], 2),
            'priority': get_priority_level(row['Predicted_Festival_Extra_Waste_kg'])
        })
    
    # Sort by extra waste
    festivals.sort(key=lambda x: x['extra_waste_kg'], reverse=True)
    
    first_row = area_data.iloc[0]
    return {
        'area': area,
        'pincode': int(first_row['Pincode']),
        'population': int(first_row['Population']),
        'baseline_daily_waste_kg': round(first_row['Baseline_Daily_Waste_kg'], 2),
        'festivals': festivals
    }
