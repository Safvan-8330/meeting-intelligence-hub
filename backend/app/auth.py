from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import supabase # 👈 Use your existing Supabase connection!

security = HTTPBearer()

def verify_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verifies the token using the official Supabase client."""
    token = credentials.credentials
    
    try:
        # Let Supabase automatically handle the ES256 decoding and validation
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not getattr(user_response, 'user', None):
            raise HTTPException(status_code=401, detail="Invalid token.")
            
        return user_response.user.id # Returns the verified user_id
        
    except Exception as e:
        print(f"❌ Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Token has expired or is invalid. Please log in again.")