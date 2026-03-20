import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from config import settings

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler(timezone=pytz.timezone(settings.timezone))

def start_scheduler():
    from briefing.runner import send_morning_briefing

    scheduler.add_job(
        send_morning_briefing,
        trigger=CronTrigger(
            hour=settings.briefing_hour,
            minute=settings.briefing_minute,
            timezone=pytz.timezone(settings.timezone)
        ),
        id="morning_briefing",
        name="Daily Morning Briefing",
        replace_existing=True,
        misfire_grace_time=300  # Allow up to 5 min late if server was restarting
    )

    scheduler.start()
    logger.info(
        f"Scheduler started. Briefing at "
        f"{settings.briefing_hour:02d}:{settings.briefing_minute:02d} {settings.timezone}"
    )