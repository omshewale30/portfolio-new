from fastapi import HTTPException
from supabase import Client, create_client

from schemas import error_detail
from settings import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    global _supabase_client
    if not settings.supabase_url or not settings.supabase_key:
        raise HTTPException(
            status_code=503,
            detail=error_detail("configuration_error", "Notes backend is not configured."),
        )
    if _supabase_client is None:
        _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
    return _supabase_client
