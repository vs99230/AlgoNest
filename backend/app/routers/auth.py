from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.security import create_access_token, hash_password, verify_password
from app.models.common import now_utc, to_epoch_ms
from app.models.schemas import AuthResponse, LoginRequest, SignupRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_out(user_doc: dict) -> UserOut:
    return UserOut(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc["email"],
        joinedAt=to_epoch_ms(user_doc["joinedAt"]),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    email = payload.email.lower()

    if await db.users.find_one({"email": email}):
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    if await db.users.find_one({"username": {"$regex": f"^{payload.username}$", "$options": "i"}}):
        raise HTTPException(status.HTTP_409_CONFLICT, "That username is taken. Try another one.")

    doc = {
        "username": payload.username,
        "email": email,
        "passwordHash": hash_password(payload.password),
        "joinedAt": now_utc(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token(str(result.inserted_id))
    return AuthResponse(token=token, user=_to_user_out(doc))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})

    if user is None or not verify_password(payload.password, user["passwordHash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    token = create_access_token(str(user["_id"]))
    return AuthResponse(token=token, user=_to_user_out(user))
