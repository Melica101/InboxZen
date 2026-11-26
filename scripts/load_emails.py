#!/usr/bin/env python3
"""Load synthetic emails into a user's mailbox (creates the account if it doesn't exist).

    scripts/load_emails.py [--email E] [--password P] [--count N] [--api URL]

Backend must be running. Stdlib only.
"""
import argparse
import json
import sys
import urllib.error
import urllib.request


def call(api, path, body=None, token=None, method="POST"):
    req = urllib.request.Request(
        api + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Content-Type": "application/json", **({"Authorization": f"Bearer {token}"} if token else {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, None


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("--email", default="demo@inboxzen.test")
    a.add_argument("--password", default="test")
    a.add_argument("--count", type=int, default=200, help="1-1000 (default 200)")
    a.add_argument("--api", default="http://localhost:8080")
    args = a.parse_args()

    creds = {"email": args.email, "password": args.password, "name": "Demo User"}
    try:
        status, res = call(args.api, "/api/auth/login", creds)
        if status != 200:
            status, res = call(args.api, "/api/auth/register", creds)
            if status == 201:
                print(f"registered {args.email}")
        if status not in (200, 201):
            sys.exit("login/register failed (wrong password for an existing user?)")

        status, res = call(args.api, f"/api/demo/emails?count={args.count}", token=res["token"])
    except urllib.error.URLError as e:
        sys.exit(f"cannot reach {args.api}: {e.reason}")
    if status != 201:
        sys.exit(f"failed: HTTP {status}")
    print(f"added {res['added']} emails, mailbox now has {res['total']}")


if __name__ == "__main__":
    main()
