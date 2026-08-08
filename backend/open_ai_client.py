
from typing import Any

from fastapi import HTTPException
from openai import APIError, AsyncOpenAI, BadRequestError, NotFoundError


class OpenAIClient:
    """
    A wrapper around the AsyncOpenAI client that handles errors and provides a consistent interface.
    """

    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)

    async def request(self, *args, **kwargs) -> Any:
        try:
            return await self.client.request(*args, **kwargs)
        except BadRequestError as e:
            raise HTTPException(
                status_code=400,
                detail={"code": "bad_request", "message": str(e)},
            )
        except NotFoundError as e:
            raise HTTPException(
                status_code=404,
                detail={"code": "not_found", "message": str(e)},
            )
        except APIError as e:
            raise HTTPException(
                status_code=503,
                detail={"code": "api_error", "message": str(e)},
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={"code": "internal_error", "message": str(e)},
            )

