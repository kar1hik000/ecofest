"""
Supabase Database Client Configuration
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_client() -> Client:
    """Returns the Supabase client instance"""
    return supabase


# Database helper functions
def fetch_all(table_name: str):
    """Fetch all records from a table"""
    response = supabase.table(table_name).select("*").execute()
    return response.data


def fetch_by_id(table_name: str, id_value: int):
    """Fetch a single record by ID"""
    response = supabase.table(table_name).select("*").eq("id", id_value).single().execute()
    return response.data


def fetch_where(table_name: str, column: str, value):
    """Fetch records matching a condition"""
    response = supabase.table(table_name).select("*").eq(column, value).execute()
    return response.data


def insert(table_name: str, data: dict):
    """Insert a new record"""
    response = supabase.table(table_name).insert(data).execute()
    return response.data


def update(table_name: str, id_value: int, data: dict):
    """Update a record by ID"""
    response = supabase.table(table_name).update(data).eq("id", id_value).execute()
    return response.data


def delete(table_name: str, id_value: int):
    """Delete a record by ID"""
    response = supabase.table(table_name).delete().eq("id", id_value).execute()
    return response.data
