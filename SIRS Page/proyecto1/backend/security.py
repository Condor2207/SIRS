import hashlib
import hmac
import os
from base64 import b64decode, b64encode
from datetime import datetime

from jose import jwt

from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DELTA


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations_str, salt_b64, digest_b64 = hashed_password.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False

        iterations = int(iterations_str)
        salt = b64decode(salt_b64.encode("ascii"))
        expected_digest = b64decode(digest_b64.encode("ascii"))
        computed_digest = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(expected_digest, computed_digest)
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    iterations = 120_000
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_b64 = b64encode(salt).decode("ascii")
    digest_b64 = b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${iterations}${salt_b64}${digest_b64}"


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.utcnow() + ACCESS_TOKEN_EXPIRE_DELTA
    payload = {
        "sub": subject,
        "rol": role,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
