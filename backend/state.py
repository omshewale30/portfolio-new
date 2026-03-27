from typing import Annotated, Sequence, Literal
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
import operator

class JarvisState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    chat_id: str
    active_agent: str


class PlanningState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    retry_count: int  # enforces one-retry limit on verifier failure