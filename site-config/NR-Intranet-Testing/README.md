# Header configuration: NR-Intranet-Testing

Starter configuration for the Global Navigation Header on `https://grescomau.sharepoint.com/sites/NR-Intranet-Testing`.

| File | Where it goes |
|------|---------------|
| `component-properties.json` | Paste into **Component Properties** of the `HeaderApp` entry in the App Catalog's Tenant Wide Extensions list (or the site's custom action properties). |
| `settings.json` | Upload to the site's **Site Assets** library. |
| `navigation.json` | Upload to the site's **Site Assets** library. |
| `logo.png` (not included) | Upload your own logo to **Site Assets**, or change `logoUrl`. |

Pages under `SitePages/` other than `Home.aspx` (News, About, Teams, Policies, Forms, Contact) are placeholders: create them, or edit the URLs. `navigation.json` was checked with the extension's own validator (11 of 11 items accepted).

`adminSettingsEnabled` is on so the gear icon appears in page edit mode; switch it off before production. Changes can take up to five minutes to appear because of the navigation cache.
