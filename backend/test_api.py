"""Test script to verify all API endpoints are working."""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(name, endpoint, expected_keys=None):
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            data = response.json()
            if expected_keys:
                missing = [k for k in expected_keys if k not in data]
                if missing:
                    print(f"❌ {name}: Missing keys {missing}")
                else:
                    print(f"✅ {name}: OK")
            else:
                print(f"✅ {name}: OK")
            return data
        else:
            print(f"❌ {name}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return None

print("=" * 50)
print("Testing Festival Waste Prediction API")
print("=" * 50)

# Test health
test_endpoint("Health Check", "/api/health", ["status", "sales_records"])

# Test festivals
data = test_endpoint("List Festivals", "/api/festivals", ["festivals"])
if data:
    print(f"   Festivals: {data.get('festivals')}")

# Test shops
data = test_endpoint("List Shops", "/api/shops")
if data:
    print(f"   Total shops: {data.get('count')}")

# Test specific shop
data = test_endpoint("Shop S0208 Analysis", "/api/shops/S0208?festival=Diwali", 
                     ["shop_name", "waste_level", "total_waste_kg"])
if data:
    print(f"   Shop: {data.get('shop_name')}")
    print(f"   Waste Level: {data.get('waste_level')}")
    print(f"   Total Waste: {data.get('total_waste_kg')} kg")
    print(f"   High-waste products: {len(data.get('high_waste_products', []))}")

# Test hotspots
data = test_endpoint("Diwali Hotspots", "/api/hotspots/Diwali", ["festival", "hotspots"])
if data:
    print(f"   Total hotspots: {len(data.get('hotspots', []))}")
    if data.get('hotspots'):
        top = data['hotspots'][0]
        print(f"   Top hotspot: {top['area']} - {top['priority']}")

# Test dashboard
data = test_endpoint("Dashboard Stats", "/api/dashboard/stats?festival=Diwali",
                     ["festival", "summary"])
if data:
    summary = data.get('summary', {})
    print(f"   Critical areas: {summary.get('critical_areas')}")
    print(f"   Extra trucks needed: {summary.get('total_extra_trucks_needed')}")

# Test AI suggestions (will work with API key)
print("\n--- AI Endpoints (require GOOGLE_API_KEY) ---")
data = test_endpoint("Shop Suggestions", "/api/shops/S0208/suggestions?festival=Diwali")
if data:
    if data.get('ai_suggestions', {}).get('error'):
        print(f"   ⚠️ AI: {data['ai_suggestions']['error']}")
    else:
        print(f"   AI suggestions loaded")

print("\n" + "=" * 50)
print("API Testing Complete!")
print("=" * 50)
