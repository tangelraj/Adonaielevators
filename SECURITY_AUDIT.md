# Security Audit — Adonai Elevators (Django + React)

Date: 2026-09-07
Scope: `adonai_backend` (Django 4.2 / DRF), `adonai_frontend` (React 19 / CRA)
Method: dependency scanning (pip-audit, npm audit), static analysis (bandit, semgrep), Django deployment checks (`manage.py check --deploy`), manual code review, and live black-box testing against dev servers bound to `127.0.0.1`.

## Summary

| # | Finding | Severity |
|---|---|---|
| 1 | ~~CAPTCHA is enforced only in the browser — never validated server-side~~ — **Fixed** | **Critical** |
| 2 | ~~No rate limiting on any API endpoint (spam/email-relay/DB flood)~~ — **Fixed** | **High** |
| 3 | `DEBUG` defaults to `True` and hardcoded fallback `SECRET_KEY` is committed to source | **High** |
| 4 | `CORS_ALLOW_ALL_ORIGINS` is forced to `True` whenever `DEBUG` is `True`, silently overriding `CORS_ALLOWED_ORIGINS` | **Medium** |
| 5 | Outdated Django / DRF / Pillow with many known CVEs | **Medium–High** |
| 6 | No `SECURE_HSTS_*`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` enabled by default | **Medium** |
| 7 | Unbounded request body size / no max length on `Enquiry.message` | **Low** |
| 8 | `Enquiry` data not exposed anywhere in admin/UI yet, but stored unsanitized — latent stored-XSS risk if a future admin view renders it unescaped | **Low (informational)** |
| 9 | npm audit: 31 advisories, all in `react-scripts` build/dev tooling (webpack-dev-server, postcss, jest, etc.) — not shipped to the production bundle | **Low** |

Confirmed **not vulnerable**: mass assignment on `Enquiry` (DRF auto-marks `id`/`created_at` read-only despite `fields = '__all__'`), SQL injection (ORM used throughout, no raw SQL), email header injection (Django's `EmailMessage` + `EmailField` validation reject CRLF), bandit/semgrep found 0 issues in first-party code.

---

## 1. CAPTCHA is client-side only (Critical) — FIXED

**Status: fixed.** Implemented a server-issued, single-use CAPTCHA:
- `website/captcha.py`: `GET /api/captcha/` (`CaptchaAPIView`) generates a math challenge, stores the answer server-side in Django's cache under a random opaque token (`uuid4`), and returns only `{question, token}` — the answer is never sent to the client in any form (not even encoded).
- `EnquirySerializer.validate()` now requires `captcha_token` + `captcha_answer` on every submission and calls `verify_and_consume_captcha()`, which deletes the cache entry on first use (whether the answer was right or wrong) so a captured token/answer pair can't be replayed.
- `EnquiryForm.js` now fetches the challenge from `/api/captcha/` instead of generating it client-side, and forwards `captcha_token`/`captcha_answer` with the submission; a fresh token is fetched after every attempt.

**Verified live:**
```
$ curl -i -X POST http://127.0.0.1:18800/api/enquiry/ -H "Content-Type: application/json" \
    -d '{"name":"test","email":"a@a.com","mobile":"1","message":"x"}'
HTTP/1.1 400 Bad Request
{"captcha_token":["This field is required."],"captcha_answer":["This field is required."]}
```
Full round trip with a correctly solved challenge succeeds, and replaying the same token/answer pair is rejected:
```
$ curl -s http://127.0.0.1:18800/api/captcha/
{"question":"7 - 2","token":"24e2d942421d4831836f3c0fa470e6d6"}
$ curl -i -X POST .../enquiry/ -d '{... "captcha_token":"24e2...","captcha_answer":"5"}'
HTTP/1.1 201 Created
$ curl -i -X POST .../enquiry/ -d '{... same token/answer again}'
HTTP/1.1 400 Bad Request
{"captcha":["CAPTCHA is invalid, expired, or already used."]}
```
**Caveats / follow-ups:** a math CAPTCHA is trivially solvable by a script (it's not meant to stop a targeted bot — it stops the previous "no server check at all" hole and, combined with rate limiting below, bounds abuse volume). For real bot resistance, swap this for Google reCAPTCHA/Cloudflare Turnstile verified server-side, following the same "never trust the client" pattern. Also note the token store uses Django's default in-process `LocMemCache`, which is per-process — if this is ever deployed behind multiple Gunicorn/uWSGI workers, switch `CACHES` to a shared backend (Redis/Memcached) so a token issued by one worker validates on another.

### (original finding, superseded by the fix above)

**File:** `adonai_frontend/src/components/EnquiryForm.js` (lines 17–30, 41–54), `adonai_backend/website/views.py` (`EnquiryAPIView.post`), `adonai_backend/website/serializers.py` (`EnquirySerializer`)

The math CAPTCHA is generated and checked entirely in the browser (`generateCaptcha`/`handleSubmit`). The `captcha` field is explicitly **stripped out** before the fetch call (`enquiryData` omits it), and the backend `EnquirySerializer`/`EnquiryAPIView` never validates a captcha at all.

**Verified live:** a raw POST to `/api/enquiry/` with no captcha field whatsoever succeeds:
```
POST /api/enquiry/  {"name":"Test User","email":"test@example.com","mobile":"1234567890","message":"..."}
→ 201 Created
```
Anyone can script arbitrary submissions with zero interaction with the UI. The CAPTCHA provides no real protection — it's decorative.

**Fix:**
- Use a real server-verified CAPTCHA (Google reCAPTCHA v3/Turnstile/hCaptcha). Frontend submits the token; backend verifies it server-side via the provider's verify API **before** saving the enquiry.
- If keeping a lightweight scheme, at minimum move validation server-side: e.g. generate a signed, time-limited challenge from the backend, return it to the client, and verify the signed answer on submit. Never trust anything computed only in JS.

## 2. No rate limiting on any endpoint (High) — FIXED

**Status: fixed.** Added `REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']` (`settings.py`, configurable via `ENQUIRY_THROTTLE_RATE`/`CAPTCHA_THROTTLE_RATE` env vars, defaulting to `5/min` and `20/min`) and attached `ScopedRateThrottle` with `throttle_scope = 'enquiry'` / `'captcha'` to `EnquiryAPIView` and `CaptchaAPIView` respectively.

**Verified live** — 6 rapid POSTs (after 1 prior request in the same window) to `/api/enquiry/`:
```
$ for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w "%{http_code} " -X POST http://127.0.0.1:18800/api/enquiry/ \
    -H "Content-Type: application/json" -d "{...}"; done
400 400 400 400 429 429
```
The throttle counts every request that reaches the view (regardless of whether the body later fails CAPTCHA/validation), so it caps request *volume* independent of payload — confirmed the 6th request in the window returns `429 Too Many Requests` as expected.

**Follow-up:** `ScopedRateThrottle`'s cache is also `LocMemCache` by default — same multi-worker caveat as above applies; use a shared cache backend in production so the limit is enforced across all app server processes, and consider an additional IP-based rate limit at the reverse proxy (nginx `limit_req`) as defense in depth.

### (original finding, superseded by the fix above)

**Files:** `adonai_backend/adonai_backend/settings.py` (no `REST_FRAMEWORK` throttle config anywhere), `website/views.py`

`settings.py` has no `REST_FRAMEWORK` block, so DRF's default throttle classes (`AnonRateThrottle`/`UserRateThrottle`) are inactive. Combined with finding #1 (no captcha) this makes `/api/enquiry/` fully open to abuse.

**Verified live:** 20 back-to-back POSTs to `/api/enquiry/` from a single client, no delay, all returned `201`:
```
201 201 201 201 201 201 201 201 201 201 201 201 201 201 201 201 201 201 201 201
```
Each success also triggers an outbound email send (`EmailMessage(...).send()` in `EnquiryAPIView.post`), so this endpoint doubles as an unthrottled mechanism to spam the business's inbox / exhaust SMTP quota, and to bloat the `Enquiry` table (no size cap on `message`, see #7).

**Fix:**
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'anon': '5/hour'},
}
```
Apply a stricter, endpoint-specific throttle class to `EnquiryAPIView` specifically (e.g. `ScopedRateThrottle` with `throttle_scope = 'enquiry'`), and consider IP+email combined throttling at the reverse proxy (nginx `limit_req`) as defense in depth.

## 3. `DEBUG` defaults to `True`; hardcoded fallback `SECRET_KEY` committed (High)

**File:** `adonai_backend/adonai_backend/settings.py:24,27`
```python
SECRET_KEY = config('SECRET_KEY', default='django-insecure-1m)-vscyvwkjj#h^3v6tpaxm8_86&(%6_k@i-99*1)ao(7eqsv)')
DEBUG = config('DEBUG', default=True, cast=bool)
```
Two problems:
- **The fallback secret key is committed to git** (visible to anyone with repo access) and used automatically if the `SECRET_KEY` env var is ever missing in a deployment — e.g. a misconfigured server or a `.env` that fails to load. A leaked/default `SECRET_KEY` allows forging session cookies, password-reset tokens, and other signed data.
- **`DEBUG` defaults to `True`** — the opposite of the safe default. If an operator forgets to set `DEBUG=False` in production, Django serves full tracebacks (source, local variables, settings) on any unhandled exception, and verbose 404 debug pages that leak the URLconf.

**Verified live** (server run with no `.env`, i.e. defaults in effect): hitting an unmapped path returned Django's full HTML debug page (`Page not found at /api/nonexistent/`, robots `NONE,NOARCHIVE`, internal Django styling/URLconf details) rather than a plain 404 — confirming `DEBUG=True` is what actually ships if the env var is unset. `manage.py check --deploy` also flagged this:
```
security.W009 Your SECRET_KEY ... it's prefixed with 'django-insecure-' ...
security.W018 You should not have DEBUG set to True in deployment.
```

**Fix:**
- `DEBUG = config('DEBUG', default=False, cast=bool)` — fail closed.
- Remove the hardcoded fallback secret entirely; require `SECRET_KEY` from the environment and let startup fail loudly if it's missing: `SECRET_KEY = config('SECRET_KEY')`.
- Rotate the currently-committed secret key immediately since it's exposed in git history.

## 4. CORS forced open whenever `DEBUG=True` (Medium)

**File:** `adonai_backend/adonai_backend/settings.py:119-125`
```python
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
```
Because `DEBUG` defaults to `True` (finding #3), `CORS_ALLOW_ALL_ORIGINS` is also `True` by default, and this line unconditionally **overrides** any explicit `CORS_ALLOWED_ORIGINS` an operator configured, as long as `DEBUG` wasn't also explicitly turned off.

**Verified live:** with default settings, a preflight and an actual POST from `Origin: http://evil-attacker.example` were both accepted and reflected:
```
access-control-allow-origin: *
```
Impact today is limited — the only state-changing endpoint (`/api/enquiry/`) requires no auth/cookies, so cross-origin POSTs from any site don't expose privileged data. But this is a foot-gun: if an authenticated/cookie-based endpoint (e.g. an admin API) is added later without revisiting this logic, it would be wide open to CSRF/data theft from any origin.

**Fix:** Decouple the two settings — never let `DEBUG` silently widen CORS:
```python
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000', cast=Csv())
```
Set `CORS_ALLOW_ALL_ORIGINS=True` explicitly (only) in local dev via `.env`, never as a code-level side effect of `DEBUG`.

## 5. Outdated dependencies with known CVEs (Medium–High)

`pip-audit -r requirements.txt` reported **108 known advisories** across 3 pinned packages:

| Package | Pinned | Fix to |
|---|---|---|
| `Django` | 4.2 | ≥ 4.2.28 (4.2 LTS line) — dozens of CVEs since 4.2.0 including SQL injection, DoS, and header-injection issues in `django.utils.http`/forms/ORM internals |
| `djangorestframework` | 3.14.0 | ≥ 3.15.2 |
| `Pillow` | 12.1.1 | ≥ 12.3.0 |

Django 4.2 was pinned at the exact `.0` release, so it carries every security fix issued for the 4.2 line since. `Pillow` is used only via admin-uploaded `HeroSection.image`, so exploitation requires staff-level access, but should still be patched.

**Fix:**
```
Django==4.2.28
djangorestframework==3.15.2
Pillow==12.3.0
```
Re-run `pip-audit` after bumping, then `python manage.py test` / smoke-test the app (Django 4.2.x patch releases are backward compatible within the LTS line).

## 6. Missing transport/cookie security hardening (Medium)

**File:** `adonai_backend/adonai_backend/settings.py:154-162`

All of these are present but default to insecure values and are never forced on:
```
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
CSRF_COOKIE_SECURE   = config('CSRF_COOKIE_SECURE', default=False, cast=bool)
SECURE_SSL_REDIRECT  = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SECURE_HSTS_SECONDS  = config('SECURE_HSTS_SECONDS', default=0, cast=int)
```
`manage.py check --deploy` confirms: `security.W004`, `W008`, `W012`, `W016`.

**Fix:** Set these to secure defaults and require the deployment to explicitly opt out (rather than opt in), since this app will only ever run over HTTPS in production:
```python
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=not DEBUG, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=not DEBUG, cast=bool)
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=not DEBUG, cast=bool)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=31536000 if not DEBUG else 0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=not DEBUG, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=not DEBUG, cast=bool)
```

## 7. Unbounded input size on `Enquiry.message` (Low)

**File:** `adonai_backend/website/models.py:14`, `serializers.py:9-12`

`message = models.TextField()` has no `max_length`/serializer-level cap, and there's no request body size limit beyond Django's global `DATA_UPLOAD_MAX_MEMORY_SIZE` (2.5 MB default). **Verified live:** a ~2 MB `message` value was accepted and stored (`201 Created`). Combined with the missing rate limit (#2), this allows fast SQLite bloat and larger outbound emails.

**Fix:** Add a serializer-level `max_length` (e.g. 5000 chars) to `message`, `name`, and `mobile` validation, and set `DATA_UPLOAD_MAX_MEMORY_SIZE` explicitly to a small value (e.g. `262144`) since this API never needs large payloads.

## 8. Stored data not currently rendered anywhere unescaped (informational)

`Enquiry` is **not** registered in `website/admin.py` (only `HeroSection` is), and there is no frontend view that lists/renders submitted enquiries. **Verified live:** payloads like `<script>alert(1)</script>` / `<img src=x onerror=...>` are stored as-is in the `name`/`message` columns (confirmed via `manage.py shell`), but there is currently no sink that would execute them — Django admin auto-escapes template output by default, and the notification email is sent as plain text (not HTML), so there's no active XSS today.

**Fix (forward-looking):** if an admin dashboard or enquiries list view is ever added, ensure any template renders these fields with Django's default auto-escaping intact (do not use `mark_safe`/`|safe` on user-supplied fields), and if a rich HTML email template is ever introduced, HTML-escape the fields before interpolating.

## 9. Frontend dependency audit (Low)

`npm audit` reports 31 advisories (9 low / 8 moderate / 14 high), but every affected package (`postcss`, `nth-check`, `serialize-javascript`, `webpack-dev-server`, `qs` via `express`/`body-parser`, `underscore` via `jsonpath`/`bfj`, `@tootallnate/once` via `jest`) is a transitive dependency of `react-scripts` (CRA's build/test tooling) — none of them ship into the production `build/` bundle or run in the browser at runtime.

**Fix:** Low priority since it doesn't affect runtime security, but worth tracking. Options: `npm audit fix` (non-breaking fixes only, addresses the `qs`/`underscore` moderate issues), or plan a migration off Create React App (unmaintained since 2023) to Vite in a future iteration to eliminate this whole dependency tree.

---

## Tooling output summary

- **bandit** (`-r adonai_backend -x migrations`): 0 issues, 284 LOC scanned.
- **pip-audit** (`requirements.txt`): 108 advisories across `Django`, `djangorestframework`, `Pillow` (see #5).
- **`manage.py check --deploy`**: 6 warnings — `security.W004`, `W008`, `W009`, `W012`, `W016`, `W018` (see #3, #6).
- **semgrep** (`p/security-audit`, `p/django`, `p/react`, 130 rules / 47 files): 0 findings.
- **npm audit** (`adonai_frontend`): 31 advisories, all in CRA dev/build tooling (see #9).
- **Live testing** against `127.0.0.1`-only dev servers: confirmed findings #1, #2, #4, #7; confirmed **not** vulnerable to mass assignment, SQL injection, or email header injection (see per-finding detail above).

## Priority remediation order

1. Server-side CAPTCHA verification + rate limiting on `/api/enquiry/` (#1, #2) — the actively exploitable issues right now.
2. Flip `DEBUG` and `SECRET_KEY` to fail-closed defaults, rotate the committed secret key (#3).
3. Decouple CORS from `DEBUG` (#4).
4. Bump `Django`, `djangorestframework`, `Pillow` to patched versions (#5).
5. Turn on the remaining `SECURE_*`/cookie hardening flags for production (#6).
6. Add input length caps (#7); keep #8/#9 in mind for future work.
