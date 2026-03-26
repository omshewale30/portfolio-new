from agents import Agent
from tools.calendar_tools import get_todays_events
from tools.time_tools import get_current_datetime
from pydantic import BaseModel, Field
from typing import List


class PlannedBlock(BaseModel):
    title: str = Field(description="Planned calendar block title.")
    start_iso: str = Field(description="Planned start datetime in ISO 8601 format.")
    end_iso: str = Field(description="Planned end datetime in ISO 8601 format.")


class PlanningVerifierInput(BaseModel):
    date: str = Field(description="Plan date in YYYY-MM-DD.")
    scheduled_blocks: List[PlannedBlock] = Field(
        description="Blocks that the planner attempted to schedule."
    )


planning_verifier = Agent(
    name="PlanningVerifier",
    instructions="""
    You are Jarvis's Planning Verifier. You are responsible for verifying the planning result has been scheduled in the calendar.
    
    You will be given a planning result payload with:
    - date (YYYY-MM-DD)
    - scheduled_blocks: list of {title, start_iso, end_iso}
    You must verify that these blocks are represented in today's calendar.
    
    You will need to use the get_current_datetime tool to get the current date and time.
    
    You will need to use the get_todays_events tool to get the list of blocks that were scheduled in the calendar for the current day.
    
    You will need to compare the planning result with the list of blocks that were scheduled in the calendar and return a verification decision.
    
    OUTPUT FORMAT
    Return a compact JSON object with exactly these keys:
    - success: boolean
    - missing_blocks: list[str]
    - notes: str
    """,
    model="gpt-4o-mini",
    tools=[get_current_datetime, get_todays_events]
)


planning_verifier_tool = planning_verifier.as_tool(tool_name="planning_verifier_tool",
tool_description="Verifies the planning result has been scheduled in the calendar.",
 parameters=PlanningVerifierInput,
 include_input_schema=True)