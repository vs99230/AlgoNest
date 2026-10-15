"""Streak math — ported from the frontend's utils/streak.js so current/longest
streak values agree whether computed client-side (mock mode) or here."""

from __future__ import annotations

from datetime import date, datetime, timezone


def to_date_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def _day_diff(from_key: str, to_key: str) -> int:
    f = date.fromisoformat(from_key)
    t = date.fromisoformat(to_key)
    return (t - f).days


def calculate_streaks(date_keys: list[str]) -> dict:
    """Current and longest streak from a list of 'YYYY-MM-DD' active day keys.
    The current streak survives until the end of the day after the last activity."""
    days = sorted(set(date_keys))
    if not days:
        return {"current": 0, "longest": 0}

    longest = 1
    run = 1
    for i in range(1, len(days)):
        run = run + 1 if _day_diff(days[i - 1], days[i]) == 1 else 1
        longest = max(longest, run)

    today_key = to_date_key(datetime.now(timezone.utc))
    current = 0
    if _day_diff(days[-1], today_key) <= 1:
        current = 1
        for i in range(len(days) - 1, 0, -1):
            if _day_diff(days[i - 1], days[i]) != 1:
                break
            current += 1

    return {"current": current, "longest": longest}
