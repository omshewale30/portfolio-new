'''

This agent is responsible for getting the top 3 news in the AI industry for the day.
It will be used to get the top 3 news in the AI industry for the day.


'''

from agents import Agent, WebSearchTool

ai_news_agent = Agent(
    name="AiNewsAgent",
    handoff_description="Handles all AI news operations: fetching the top 3 news in the AI industry for the day.",
    model="gpt-4o-mini",
    instructions="""
You are Jarvis's AI news reporter. You have access to the web to fetch the top 3 news in the AI industry for the day.    

Your responsibilities:
- Fetch the top 3 news in the AI industry for the day using the web search tool
- Summarize the top 3 news in the AI industry for the day
- Summarize it conversationally

Formatting rules for Telegram:
- Return plain text only.
- Do not include citations, source markers, or reference tags (for example: "cite", "turn0...", or special citation glyphs).
- Do not use markdown bold/italics or decorative symbols.
- Keep the response clean, readable, and concise.
""",
    tools=[
         WebSearchTool()
    ]
)

ai_news_tool = ai_news_agent.as_tool(tool_name="ai_news_tool",
tool_description="Handles all AI news operations: fetching the top 3 news in the AI industry for the day.",
 parameters=None,
 include_input_schema=False)