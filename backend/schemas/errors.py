
from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    code: str
    message: str

def error_detail(code: str, message: str) -> dict[str, str]:
    """
    Helper function to create a consistent error detail dictionary.
    """
    return ErrorResponse(code=code, message=message).model_dump()
