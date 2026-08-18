from pydantic import BaseModel, Field, field_validator


class PageViewRequest(BaseModel):
    path: str = Field(min_length=1, max_length=200)
    note_slug: str | None = Field(default=None, max_length=80)

    @field_validator("path")
    @classmethod
    def reject_blank_path(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("note_slug")
    @classmethod
    def normalize_blank_note_slug(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class ViewCountResponse(BaseModel):
    view_count: int
