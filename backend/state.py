from typing import Annotated, Sequence, Literal
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class JarvisState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    chat_id: str


class PlanningState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    retry_count: int  # enforces one-retry limit on verifier failure