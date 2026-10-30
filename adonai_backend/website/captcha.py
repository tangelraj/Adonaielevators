import random
import uuid

from django.core.cache import cache

CAPTCHA_CACHE_PREFIX = "enquiry-captcha:"
CAPTCHA_TIMEOUT = 300  # seconds a challenge stays valid


class CaptchaError(Exception):
    pass


def generate_captcha():
    """Create a challenge, store the answer server-side, and return (question, token).

    The answer is never sent to the client in any form - only an opaque
    random token is returned. The client must send the token back together
    with its answer so the server can look up and compare the real answer.
    """
    num1 = random.randint(1, 10)
    num2 = random.randint(1, 10)
    operator = random.choice(["+", "-", "*"])
    answer = {"+": num1 + num2, "-": num1 - num2, "*": num1 * num2}[operator]

    question = f"{num1} {operator} {num2}"
    token = uuid.uuid4().hex
    cache.set(CAPTCHA_CACHE_PREFIX + token, str(answer), timeout=CAPTCHA_TIMEOUT)
    return question, token


def verify_and_consume_captcha(token, answer):
    """Validate a (token, answer) pair against the stored challenge.

    Raises CaptchaError on any failure. Tokens are single-use: they are
    deleted as soon as they are checked, whether the answer was right or
    wrong, so a captured token/answer pair cannot be replayed.
    """
    if not token:
        raise CaptchaError("Missing CAPTCHA token.")

    cache_key = CAPTCHA_CACHE_PREFIX + token
    expected = cache.get(cache_key)
    cache.delete(cache_key)

    if expected is None:
        raise CaptchaError("CAPTCHA is invalid, expired, or already used.")

    if answer is None or str(answer).strip() != expected:
        raise CaptchaError("Incorrect CAPTCHA answer.")
