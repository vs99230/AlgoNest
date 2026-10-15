from datetime import datetime, timezone


def to_epoch_ms(dt: datetime) -> int:
    """The frontend does `new Date(timestamp)` on every date it receives, so all
    dates cross the API as epoch milliseconds (a plain int), not ISO strings."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return int(dt.timestamp() * 1000)


def now_epoch_ms() -> int:
    return to_epoch_ms(datetime.now(timezone.utc))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
