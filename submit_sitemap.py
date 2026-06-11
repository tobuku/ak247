"""
Submit sitemap to Google Search Console for ak247services.com
Uses shared service account credentials from laptops repo.

Usage: python submit_sitemap.py
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build

KEY_FILE = "../laptops/.gsc-credentials/laptoplane-blogspot-autoposter-c7da82883623.json"
PROPERTY_URL = "sc-domain:ak247services.com"
SITEMAP_URL = "https://ak247services.com/sitemap.xml"
SCOPES = ["https://www.googleapis.com/auth/webmasters"]

def main():
    creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=SCOPES)
    service = build("searchconsole", "v1", credentials=creds)

    # Submit sitemap
    print(f"Submitting sitemap: {SITEMAP_URL}")
    print(f"Property: {PROPERTY_URL}")
    try:
        service.sitemaps().submit(siteUrl=PROPERTY_URL, feedpath=SITEMAP_URL).execute()
        print("Sitemap submitted successfully.")
    except Exception as e:
        print(f"Error: {e}")
        print()
        print("If you get a 403 error, make sure the service account")
        print("(claude-test-sa@laptoplane-blogspot-autoposter.iam.gserviceaccount.com)")
        print("has been added as a user in GSC for ak247services.com.")
        return

    # Verify by listing sitemaps
    print()
    print("Current sitemaps for property:")
    try:
        result = service.sitemaps().list(siteUrl=PROPERTY_URL).execute()
        for sm in result.get("sitemap", []):
            print(f"  {sm['path']} - last submitted: {sm.get('lastSubmitted', 'N/A')}")
    except Exception as e:
        print(f"Could not list sitemaps: {e}")

if __name__ == "__main__":
    main()
