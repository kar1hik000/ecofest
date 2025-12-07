"""Gemini AI integration for eco-friendly suggestions and marketing messages."""

import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv('GOOGLE_API_KEY')
if api_key:
    genai.configure(api_key=api_key)


def get_model():
    """Get the Gemini model instance."""
    return genai.GenerativeModel('gemini-2.0-flash')


def generate_eco_suggestions(high_waste_products, shop_name, festival):
    """
    Generate AI-powered eco-friendly product suggestions.
    
    Args:
        high_waste_products: List of products with high waste scores
        shop_name: Name of the shop
        festival: Festival name
    
    Returns:
        dict: AI-generated suggestions and alternatives
    """
    if not api_key:
        return {
            'error': 'GOOGLE_API_KEY not configured',
            'suggestions': []
        }
    
    # Build product list for prompt
    product_list = "\n".join([
        f"- {p.get('Item_Name', p.get('item_name', 'Unknown'))}: "
        f"Waste Score {p.get('Item_Waste_Score', p.get('waste_score', 0))}"
        for p in high_waste_products[:5]  # Limit to top 5
    ])
    
    prompt = f"""You are an eco-friendly shopping advisor for Indian festivals.

Shop: {shop_name}
Festival: {festival}

These products sold by the shop have HIGH waste scores (bad for environment):
{product_list}

Provide eco-friendly alternatives and suggestions in JSON format:
{{
    "alternatives": [
        {{
            "instead_of": "product name",
            "use": "eco-friendly alternative",
            "reason": "brief reason why it's better",
            "waste_reduction": "estimated % reduction"
        }}
    ],
    "general_tips": ["tip1", "tip2", "tip3"],
    "eco_score_improvement": "estimated improvement if alternatives adopted"
}}

Be specific to Indian festivals and practical for shopkeepers. Keep responses concise."""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        
        # Parse JSON from response
        response_text = response.text
        
        # Try to extract JSON from the response
        import json
        import re
        
        # Find JSON in response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            suggestions = json.loads(json_match.group())
            return {'suggestions': suggestions, 'raw_response': response_text}
        else:
            return {'suggestions': None, 'raw_response': response_text}
            
    except Exception as e:
        return {'error': str(e), 'suggestions': None}


def generate_marketing_message(shop_name, festival, eco_products=None):
    """
    Generate AI-powered marketing message for eco-friendly campaigns.
    
    Args:
        shop_name: Name of the shop
        festival: Festival name
        eco_products: List of eco-friendly products to promote
    
    Returns:
        dict: Marketing messages for different channels
    """
    if not api_key:
        return {
            'error': 'GOOGLE_API_KEY not configured',
            'messages': None
        }
    
    products_text = ""
    if eco_products:
        products_text = f"\nEco-friendly products available: {', '.join(eco_products[:5])}"
    
    prompt = f"""Create marketing messages for a shop promoting eco-friendly festival shopping.

Shop: {shop_name}
Festival: {festival}{products_text}

Generate messages in JSON format:
{{
    "sms": "Short SMS message (under 160 chars) with emojis",
    "whatsapp": "WhatsApp message (under 300 chars) with emojis and formatting",
    "poster_tagline": "Catchy tagline for poster (under 50 chars)",
    "social_media": "Instagram/Facebook post (under 200 chars)"
}}

Make it festive, appealing, and highlight eco-friendly benefits. Use Indian context."""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        
        response_text = response.text
        
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            messages = json.loads(json_match.group())
            return {'messages': messages, 'raw_response': response_text}
        else:
            return {'messages': None, 'raw_response': response_text}
            
    except Exception as e:
        return {'error': str(e), 'messages': None}


def generate_municipality_insights(hotspots, festival):
    """
    Generate AI insights for municipality waste management planning.
    
    Args:
        hotspots: List of hotspot areas with waste predictions
        festival: Festival name
    
    Returns:
        dict: AI-generated insights and recommendations
    """
    if not api_key:
        return {
            'error': 'GOOGLE_API_KEY not configured',
            'insights': None
        }
    
    # Build hotspot summary
    top_hotspots = hotspots[:5] if len(hotspots) > 5 else hotspots
    hotspot_text = "\n".join([
        f"- {h['area']}: {h['extra_waste_kg']}kg extra waste ({h['priority']} priority)"
        for h in top_hotspots
    ])
    
    prompt = f"""You are a municipal waste management advisor for Indian city festivals.

Festival: {festival}
Top waste hotspots:
{hotspot_text}

Provide actionable insights in JSON format:
{{
    "key_insights": ["insight1", "insight2", "insight3"],
    "immediate_actions": ["action1", "action2", "action3"],
    "awareness_campaign_ideas": ["idea1", "idea2"],
    "long_term_recommendations": ["rec1", "rec2"],
    "estimated_cleanup_timeline": "X days with proper resources"
}}

Be practical and specific to Indian municipal operations."""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        
        response_text = response.text
        
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            insights = json.loads(json_match.group())
            return {'insights': insights, 'raw_response': response_text}
        else:
            return {'insights': None, 'raw_response': response_text}
            
    except Exception as e:
        return {'error': str(e), 'insights': None}


def ai_chat(message, context=None):
    """
    AI chat assistant for waste management and eco-friendly advice.
    
    Args:
        message: User's question or message
        context: Optional context about user role, festival, etc.
    
    Returns:
        dict: AI response
    """
    if not api_key:
        return {
            'error': 'GOOGLE_API_KEY not configured',
            'response': 'I apologize, but AI features are currently unavailable.'
        }
    
    context_text = ""
    if context:
        if context.get('festival'):
            context_text += f"\nCurrent festival context: {context['festival']}"
        if context.get('role'):
            context_text += f"\nUser role: {context['role']}"
        if context.get('area'):
            context_text += f"\nArea of interest: {context['area']}"
    
    prompt = f"""You are EcoBot, an AI assistant for EcoFest - a festival waste prediction and management platform for Indian cities.

Your expertise includes:
- Festival waste management in India
- Eco-friendly product alternatives for festivals (Diwali, Holi, Ganesh Chaturthi, etc.)
- Waste reduction tips for shopkeepers
- Municipal waste management planning
- Sustainable celebration practices
{context_text}

User message: {message}

Respond helpfully and concisely. If discussing products, mention Indian alternatives. 
Keep responses under 150 words unless the question requires detailed explanation.
Be friendly and use occasional emojis. Focus on actionable advice."""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        return {'response': response.text, 'success': True}
    except Exception as e:
        return {'error': str(e), 'response': 'Sorry, I encountered an error. Please try again.'}


def generate_prediction_summary(festival, stats):
    """
    Generate natural language summary of waste predictions.
    
    Args:
        festival: Festival name
        stats: Dictionary with prediction statistics
    
    Returns:
        dict: AI-generated summary in natural language
    """
    if not api_key:
        return {
            'error': 'GOOGLE_API_KEY not configured',
            'summary': None
        }
    
    prompt = f"""Generate a brief, engaging summary of these waste prediction statistics for {festival}:

Statistics:
- Total areas monitored: {stats.get('total_areas', 'N/A')}
- Critical hotspots: {stats.get('critical_areas', 'N/A')}
- Expected waste increase: {stats.get('average_increase_percent', 'N/A')}%
- Additional trucks needed: {stats.get('total_extra_trucks_needed', 'N/A')}
- Additional workers needed: {stats.get('total_extra_workers_needed', 'N/A')}

Write a 2-3 sentence summary that:
1. Highlights the key concern for this festival
2. Mentions the resource requirements
3. Ends with an actionable recommendation

Be concise and use a professional but accessible tone. Include one relevant emoji."""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        return {'summary': response.text.strip(), 'success': True}
    except Exception as e:
        return {'error': str(e), 'summary': None}

