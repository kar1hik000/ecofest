"""
Data Migration Script - Migrate CSV data to Supabase
Run this script after creating the tables in Supabase SQL Editor
"""
import os
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from database import supabase

# Paths to CSV files
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset')


def migrate_festival_waste_data():
    """Migrate festival waste data from CSV to Supabase."""
    csv_path = os.path.join(DATASET_PATH, 'mega_area_festivals.csv')
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
    
    print("Loading festival waste data from CSV...")
    df = pd.read_csv(csv_path)
    print(f"Found {len(df)} records")
    
    # Get festival and area IDs from Supabase
    festivals_response = supabase.table('festivals').select('id, name').execute()
    areas_response = supabase.table('areas').select('id, name').execute()
    
    festival_map = {f['name']: f['id'] for f in festivals_response.data}
    area_map = {a['name']: a['id'] for a in areas_response.data}
    
    print(f"Found {len(festival_map)} festivals and {len(area_map)} areas in database")
    
    # Prepare data for insertion
    records = []
    for _, row in df.iterrows():
        festival_name = row.get('Festival', row.get('festival', ''))
        area_name = row.get('Area', row.get('area', ''))
        
        if festival_name not in festival_map:
            continue
        if area_name not in area_map:
            continue
        
        # Calculate priority based on waste amount
        total_waste = float(row.get('Total Waste (kg)', row.get('total_waste_kg', 0)))
        if total_waste > 5000:
            priority = 'critical'
        elif total_waste > 3000:
            priority = 'high'
        elif total_waste > 1000:
            priority = 'medium'
        else:
            priority = 'low'
        
        record = {
            'festival_id': festival_map[festival_name],
            'area_id': area_map[area_name],
            'date': row.get('Date', '2024-01-01'),
            'total_waste_kg': total_waste,
            'recyclable_kg': float(row.get('Recyclable (kg)', row.get('recyclable_kg', 0))),
            'organic_kg': float(row.get('Organic (kg)', row.get('organic_kg', 0))),
            'hazardous_kg': float(row.get('Hazardous (kg)', row.get('hazardous_kg', 0))),
            'priority': priority
        }
        records.append(record)
    
    if records:
        print(f"Inserting {len(records)} festival waste records...")
        # Insert in batches
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                supabase.table('festival_waste').insert(batch).execute()
                print(f"Inserted batch {i//batch_size + 1}/{(len(records) + batch_size - 1)//batch_size}")
            except Exception as e:
                print(f"Error inserting batch: {e}")
    else:
        print("No records to insert")


def migrate_shops_data():
    """Migrate shop data from CSV to Supabase."""
    csv_path = os.path.join(DATASET_PATH, 'mega_sales_100k.csv')
    
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
    
    print("\nLoading shop sales data from CSV...")
    df = pd.read_csv(csv_path)
    print(f"Found {len(df)} records")
    
    # Get area IDs from Supabase
    areas_response = supabase.table('areas').select('id, name').execute()
    area_map = {a['name']: a['id'] for a in areas_response.data}
    
    # Group by shop and aggregate (using correct column names from CSV)
    shop_data = df.groupby(['Shop_Name', 'Area']).agg({
        'Item_Name': lambda x: list(set(x)),
        'Quantity_Sold': 'sum',
        'Estimated_Waste_kg': 'sum'
    }).reset_index()
    
    records = []
    for _, row in shop_data.iterrows():
        area_name = row.get('Area', '')
        
        if area_name not in area_map:
            continue
        
        # Calculate eco score based on waste (lower waste = higher score)
        total_waste = float(row.get('Estimated_Waste_kg', 0))
        eco_score = max(1.0, min(10.0, 10.0 - (total_waste / 100)))
        eco_score = round(eco_score, 1)
        
        record = {
            'name': row['Shop_Name'],
            'area_id': area_map[area_name],
            'products': row['Item_Name'][:10] if isinstance(row['Item_Name'], list) else [],
            'avg_daily_sales': float(row.get('Quantity_Sold', 0)),
            'eco_score': eco_score,
            'total_waste_kg': total_waste
        }
        records.append(record)
    
    if records:
        print(f"Inserting {len(records)} shop records...")
        # Limit to first 500 unique shops
        records = records[:500]
        batch_size = 50
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                supabase.table('shops').insert(batch).execute()
                print(f"Inserted batch {i//batch_size + 1}/{(len(records) + batch_size - 1)//batch_size}")
            except Exception as e:
                print(f"Error inserting batch: {e}")
    else:
        print("No shop records to insert")


def main():
    """Run all migrations."""
    print("=" * 50)
    print("EcoFest Data Migration to Supabase")
    print("=" * 50)
    
    try:
        # Test connection
        print("\nTesting Supabase connection...")
        response = supabase.table('festivals').select('count', count='exact').execute()
        print(f"Connection successful! Found {response.count} festivals")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("\nMake sure you have run the schema.sql in Supabase SQL Editor first!")
        return
    
    # Run migrations
    migrate_festival_waste_data()
    migrate_shops_data()
    
    print("\n" + "=" * 50)
    print("Migration complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
