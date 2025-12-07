"""Data loader module for Festival Waste Prediction system."""

import pandas as pd
import os

# Path to dataset folder (relative to backend)
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset')


def load_sales_data():
    """Load the main sales dataset (100k records)."""
    path = os.path.join(DATASET_PATH, 'mega_sales_100k.csv')
    df = pd.read_csv(path)
    return df


def load_area_festivals():
    """Load area demographics and festival data."""
    path = os.path.join(DATASET_PATH, 'mega_area_festivals.csv')
    df = pd.read_csv(path)
    return df


def load_products():
    """Load product waste scores reference."""
    path = os.path.join(DATASET_PATH, 'mega_products.csv')
    df = pd.read_csv(path)
    return df


def load_timeseries():
    """Load daily waste timeseries data."""
    path = os.path.join(DATASET_PATH, 'mega_daily_waste_timeseries.csv')
    df = pd.read_csv(path)
    return df


def get_all_shops(sales_df=None):
    """Get list of all unique shops."""
    if sales_df is None:
        sales_df = load_sales_data()
    
    shops = sales_df[['Shop_ID', 'Shop_Name', 'Area', 'Pincode']].drop_duplicates()
    return shops.to_dict('records')


def get_all_festivals(sales_df=None):
    """Get list of all unique festivals."""
    if sales_df is None:
        sales_df = load_sales_data()
    
    festivals = sales_df['Festival'].unique().tolist()
    return festivals


def get_all_areas(area_df=None):
    """Get list of all unique areas."""
    if area_df is None:
        area_df = load_area_festivals()
    
    areas = area_df[['Area', 'Pincode']].drop_duplicates()
    return areas.to_dict('records')
