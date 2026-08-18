from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ReactionRequest(BaseModel):
    anon_id: str = Field(min_length=1, max_length=128)
    reaction: Literal["like", "dislike"]

    @field_validator("anon_id")
    @classmethod
    def reject_blank_anon_id(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class ReactionSummary(BaseModel):
    like_count: int
    dislike_count: int
    your_reaction: Literal["like", "dislike"] | None = None


class CommentRequest(BaseModel):
    anon_id: str = Field(min_length=1, max_length=128)
    author_name: str | None = Field(default=None, max_length=60)
    body: str = Field(min_length=1, max_length=1000)

    @field_validator("anon_id", "body")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("author_name")
    @classmethod
    def normalize_blank_author_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class CommentOut(BaseModel):
    id: str
    author_name: str | None = None
    body: str
    created_at: datetime


class CommentListResponse(BaseModel):
    comments: list[CommentOut] = Field(default_factory=list)
