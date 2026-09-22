import re
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.throttling import SimpleRateThrottle

from .captcha import CAPTCHA_CACHE_PREFIX, generate_captcha
from .models import Enquiry, HeroSection

# DRF freezes SimpleRateThrottle.THROTTLE_RATES as a class attribute the
# first time rest_framework.throttling is imported (see its source), so
# @override_settings(REST_FRAMEWORK=...) never reaches it - api_settings.reload()
# runs but nothing re-reads the class attribute. Tests that need a specific
# rate patch SimpleRateThrottle.THROTTLE_RATES directly instead (see
# EnquiryThrottleTests below). Everything else here relies on the real
# configured defaults (5/min, 20/min) being generous enough for a handful of
# requests per test, combined with clearing the cache in setUp so counts
# never leak between tests.


def _solve(question):
    """Evaluate a "N op N" captcha question the same way the challenge was built."""
    match = re.match(r"(\d+) ([+\-*]) (\d+)", question)
    a, op, b = int(match.group(1)), match.group(2), int(match.group(3))
    return str({"+": a + b, "-": a - b, "*": a * b}[op])


class HeroAPIViewTests(APITestCase):
    def setUp(self):
        cache.clear()

    def test_returns_hero_data_when_present(self):
        HeroSection.objects.create(
            title="Adonai Elevators", subtitle="Moving you up", image="hero/banner.jpg"
        )
        response = self.client.get("/api/hero/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Adonai Elevators")
        self.assertEqual(response.data["subtitle"], "Moving you up")

    def test_returns_200_when_no_hero_exists(self):
        response = self.client.get("/api/hero/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_only_get_allowed(self):
        response = self.client.post("/api/hero/", {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class CaptchaAPIViewTests(APITestCase):
    def setUp(self):
        cache.clear()

    def test_returns_question_and_token(self):
        response = self.client.get("/api/captcha/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("question", response.data)
        self.assertTrue(response.data["token"])
        # the numeric answer must never be present anywhere in the response
        self.assertNotIn("answer", response.data)

    def test_each_request_returns_a_fresh_token(self):
        first = self.client.get("/api/captcha/").data["token"]
        second = self.client.get("/api/captcha/").data["token"]
        self.assertNotEqual(first, second)


@override_settings(
    EMAIL_HOST_USER="enquiries@adonai.test",
    DEFAULT_FROM_EMAIL="enquiries@adonai.test",
)
class EnquiryAPIViewTests(APITestCase):
    def setUp(self):
        cache.clear()

    def _valid_payload(self, **overrides):
        question, token = generate_captcha()
        payload = {
            "name": "Test User",
            "email": "test@example.com",
            "mobile": "9876543210",
            "message": "Interested in a home elevator",
            "captcha_token": token,
            "captcha_answer": _solve(question),
        }
        payload.update(overrides)
        return payload

    def test_successful_submission_creates_enquiry_and_sends_email(self):
        response = self.client.post("/api/enquiry/", self._valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 1)

        enquiry = Enquiry.objects.first()
        self.assertEqual(enquiry.name, "Test User")
        self.assertEqual(enquiry.email, "test@example.com")

        self.assertEqual(len(mail.outbox), 1)
        sent = mail.outbox[0]
        self.assertIn("Test User", sent.subject)
        self.assertEqual(sent.reply_to, ["test@example.com"])
        self.assertEqual(sent.to, ["enquiries@adonai.test"])

    def test_missing_required_fields_returns_400(self):
        response = self.client.post("/api/enquiry/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ("name", "email", "mobile", "captcha_token", "captcha_answer"):
            self.assertIn(field, response.data)
        self.assertEqual(Enquiry.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_invalid_email_returns_400(self):
        response = self.client.post(
            "/api/enquiry/", self._valid_payload(email="not-an-email"), format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertEqual(Enquiry.objects.count(), 0)

    def test_missing_captcha_fields_returns_400(self):
        payload = self._valid_payload()
        del payload["captcha_token"]
        del payload["captcha_answer"]

        response = self.client.post("/api/enquiry/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("captcha_token", response.data)
        self.assertIn("captcha_answer", response.data)
        self.assertEqual(Enquiry.objects.count(), 0)

    def test_wrong_captcha_answer_returns_400(self):
        question, token = generate_captcha()
        wrong_answer = str(int(_solve(question)) + 1)

        response = self.client.post(
            "/api/enquiry/",
            self._valid_payload(captcha_token=token, captcha_answer=wrong_answer),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("captcha", response.data)
        self.assertEqual(Enquiry.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_expired_captcha_token_returns_400(self):
        question, token = generate_captcha()
        answer = _solve(question)
        # simulate the cache entry having expired (or never having existed)
        cache.delete(CAPTCHA_CACHE_PREFIX + token)

        response = self.client.post(
            "/api/enquiry/",
            self._valid_payload(captcha_token=token, captcha_answer=answer),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("captcha", response.data)
        self.assertEqual(Enquiry.objects.count(), 0)

    def test_unknown_captcha_token_returns_400(self):
        response = self.client.post(
            "/api/enquiry/",
            self._valid_payload(captcha_token="not-a-real-token", captcha_answer="5"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("captcha", response.data)

    def test_reused_captcha_token_is_rejected(self):
        payload = self._valid_payload()

        first = self.client.post("/api/enquiry/", payload, format="json")
        second = self.client.post("/api/enquiry/", payload, format="json")

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("captcha", second.data)
        self.assertEqual(Enquiry.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_only_post_allowed(self):
        response = self.client.get("/api/enquiry/")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_mass_assignment_of_id_and_created_at_is_ignored(self):
        payload = self._valid_payload(id=99999, created_at="2000-01-01T00:00:00Z")

        response = self.client.post("/api/enquiry/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        enquiry = Enquiry.objects.get()
        self.assertNotEqual(enquiry.id, 99999)
        self.assertNotEqual(enquiry.created_at.year, 2000)

    def test_email_send_failure_does_not_block_submission(self):
        with mock.patch("website.views.EmailMessage.send", side_effect=Exception("smtp down")):
            response = self.client.post("/api/enquiry/", self._valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enquiry.objects.count(), 1)


@mock.patch.object(
    SimpleRateThrottle, "THROTTLE_RATES", {"enquiry": "3/min", "captcha": "1000/min"}
)
class EnquiryThrottleTests(APITestCase):
    def setUp(self):
        cache.clear()

    def _payload(self):
        question, token = generate_captcha()
        return {
            "name": "Throttle Test",
            "email": "throttle@example.com",
            "mobile": "1",
            "message": "x",
            "captcha_token": token,
            "captcha_answer": _solve(question),
        }

    def test_requests_beyond_rate_limit_return_429(self):
        statuses = [
            self.client.post("/api/enquiry/", self._payload(), format="json").status_code
            for _ in range(4)
        ]

        self.assertEqual(statuses[:3], [status.HTTP_201_CREATED] * 3)
        self.assertEqual(statuses[3], status.HTTP_429_TOO_MANY_REQUESTS)

    def test_throttle_is_scoped_separately_from_captcha_endpoint(self):
        for _ in range(3):
            self.client.post("/api/enquiry/", self._payload(), format="json")

        # enquiry scope is exhausted, but captcha scope (1000/min) is untouched
        response = self.client.get("/api/captcha/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
