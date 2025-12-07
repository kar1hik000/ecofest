"""Waste calculation module for shops and areas."""

import pandas as pd
from data_loader import load_sales_data, load_products


def get_waste_level(score):
    """Convert numeric score to waste level category."""
    if score < 0.4:
        return "LOW"
    elif score < 0.7:
        return "MEDIUM"
    else:
        return "HIGH"


def calculate_shop_waste(shop_id, festival=None, sales_df=None):
    """
    Calculate waste metrics for a specific shop.
    
    Returns:
        dict: Shop waste analysis including score, level, and product breakdown
    """
    if sales_df is None:
        sales_df = load_sales_data()
    
    # Filter for shop
    shop_data = sales_df[sales_df['Shop_ID'] == shop_id]
    
    if shop_data.empty:
        return None
    
    # Filter by festival if specified
    if festival:
        shop_data = shop_data[shop_data['Festival'] == festival]
    
    if shop_data.empty:
        return None
    
    # Get shop info
    shop_info = shop_data.iloc[0]
    
    # Calculate metrics
    total_waste_kg = shop_data['Estimated_Waste_kg'].sum()
    avg_waste_score = shop_data['Item_Waste_Score'].mean()
    total_quantity = shop_data['Quantity_Sold'].sum()
    
    # Get product breakdown sorted by waste
    product_breakdown = shop_data.groupby(['Item_Name', 'Category']).agg({
        'Quantity_Sold': 'sum',
        'Item_Waste_Score': 'first',
        'Estimated_Waste_kg': 'sum'
    }).reset_index()
    
    product_breakdown = product_breakdown.sort_values('Estimated_Waste_kg', ascending=False)
    
    # Get high waste products (score > 0.7)
    high_waste_products = product_breakdown[product_breakdown['Item_Waste_Score'] > 0.7]
    
    return {
        'shop_id': shop_id,
        'shop_name': shop_info['Shop_Name'],
        'area': shop_info['Area'],
        'pincode': int(shop_info['Pincode']),
        'festival': festival or 'All Festivals',
        'waste_score': round(avg_waste_score, 2),
        'waste_level': get_waste_level(avg_waste_score),
        'total_waste_kg': round(total_waste_kg, 2),
        'total_items_sold': int(total_quantity),
        'product_breakdown': product_breakdown.to_dict('records'),
        'high_waste_products': high_waste_products.to_dict('records')
    }


def get_shop_comparison(area=None, festival=None, sales_df=None):
    """Get waste comparison across shops in an area."""
    if sales_df is None:
        sales_df = load_sales_data()
    
    # Filter by area if specified
    if area:
        sales_df = sales_df[sales_df['Area'] == area]
    
    # Filter by festival if specified
    if festival:
        sales_df = sales_df[sales_df['Festival'] == festival]
    
    # Aggregate by shop
    shop_stats = sales_df.groupby(['Shop_ID', 'Shop_Name', 'Area']).agg({
        'Estimated_Waste_kg': 'sum',
        'Item_Waste_Score': 'mean',
        'Quantity_Sold': 'sum'
    }).reset_index()
    
    shop_stats['waste_level'] = shop_stats['Item_Waste_Score'].apply(get_waste_level)
    shop_stats = shop_stats.sort_values('Estimated_Waste_kg', ascending=False)
    
    return shop_stats.head(20).to_dict('records')


def get_eco_alternatives(products_df=None):
    """Get mapping of high-waste products to eco-friendly alternatives."""
    if products_df is None:
        products_df = load_products()
    
    # Define eco-alternatives mapping
    alternatives = {
        'Plastic Diya Pack': 'Clay Diya Pack',
        'Plastic Diya Pack Variant 1': 'Clay Diya Pack Variant 1',
        'Plastic Diya Pack Variant 2': 'Clay Diya Pack Variant 2',
        'Synthetic Gulal Pack': 'Herbal Gulal Pack',
        'Synthetic Gulal Pack Variant 1': 'Herbal Gulal Pack Variant 1',
        'Synthetic Gulal Pack Variant 2': 'Herbal Gulal Pack Variant 2',
        'Plastic Kite': 'Paper-Bamboo Kite',
        'Plastic Kite Variant 1': 'Paper-Bamboo Kite',
        'Plastic Kite Variant 2': 'Paper-Bamboo Kite',
        'Nylon Manja Spool': 'Paper-Bamboo Kite',
        'PVC Gift Wrapping Roll': 'Recycled Paper Gift Wrap',
        'PVC Gift Wrapping Roll Variant 1': 'Recycled Paper Gift Wrap Variant 1',
        'PVC Gift Wrapping Roll Variant 2': 'Recycled Paper Gift Wrap',
        'Plaster of Paris Idol': 'Clay Idol with Natural Colors',
        'Plaster of Paris Idol Variant 1': 'Clay Idol with Natural Colors Variant 1',
        'Plaster of Paris Idol Variant 2': 'Clay Idol with Natural Colors Variant 2',
        'Thermocol Decoration Kit': 'Paper Lanterns',
        'Thermocol Decoration Kit Variant 1': 'Paper Lanterns Variant 1',
        'Thermocol Decoration Kit Variant 2': 'Paper Lanterns Variant 2',
        'Plastic Flower Garland': 'Fresh Flower Garland',
        'Plastic Flower Garland Variant 1': 'Fresh Flower Garland Variant 1',
        'Plastic Flower Garland Variant 2': 'Fresh Flower Garland Variant 2',
        'Halogen Serial Lights': 'LED String Lights',
        'Halogen Serial Lights Variant 1': 'LED String Lights Variant 1',
        'Halogen Serial Lights Variant 2': 'LED String Lights Variant 2',
        'PVC Christmas Tree': 'Real Christmas Tree (Cut)',
        'Plastic Tinsel': 'Paper Lanterns',
        'Water Balloons Pack': 'Herbal Gulal Pack',
        'Holi Color Spray Can': 'Herbal Gulal Pack',
    }
    
    return alternatives
