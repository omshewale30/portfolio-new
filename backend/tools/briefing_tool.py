from langchain_core.tools import tool
from prompts.briefing import BRIEFING_SYSTEM_PROMPT


@tool
def generate_morning_briefing(planning_result: str) -> str:
    """
    Generate a morning briefing based on the planning result.
    """
    return planning_result