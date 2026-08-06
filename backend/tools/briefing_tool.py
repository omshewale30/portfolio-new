from langchain_core.tools import tool
from prompts.briefing import BRIEFING_SYSTEM_PROMPT
from llm.clients import specialist_llm


@tool
def generate_morning_briefing(planning_result: str) -> str:
    """
    Generate a morning briefing based on the planning result.
    Use this tool to generate a morning briefing after the planning is done.
    Args:
        planning_result: The planning result in JSON format.
    Returns:
        The morning briefing in text format.
    """

    response = specialist_llm.invoke(BRIEFING_SYSTEM_PROMPT + "\n\n" + planning_result)
    return response.content