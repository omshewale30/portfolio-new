
from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=128)
    user_input: str = Field(min_length=1, max_length=2000)
    previous_response_id: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("user_id", "user_input")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class ChatResponse(BaseModel):
    response: str
    response_id: str

