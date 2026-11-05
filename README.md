# Custom Links web part for SharePoint Online

This repository holds a ready-to-deploy SharePoint Framework (SPFx) package built from the PnP community sample [`react-custom-links`](https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-custom-links) by João Mendes. The web part renders a set of links whose background colour, foreground colour, font size, width and height can each be customised in the property pane.

## Contents

| Path | Purpose |
|------|---------|
| `package/custom-links.sppkg` | Production package, ready to upload to the App Catalog |
| `react-custom-links/` | Unmodified sample source, for rebuilding or adapting |
| `LICENSE-PnP` | MIT licence covering the upstream sample |

## Deploying the package

The solution is configured with `includeClientSideAssets: true`, so all JavaScript is shipped inside the `.sppkg` and served from the tenant's Office 365 CDN or the App Catalog; no external CDN is needed. It also sets `skipFeatureDeployment: true`, which allows tenant-wide deployment, and it requests no Microsoft Graph or other API permissions.

1. Download `package/custom-links.sppkg`.
2. Open the SharePoint admin centre, then **More features → Apps → App Catalog** (or the site-collection App Catalog, if you prefer a narrower scope).
3. Upload the file to **Apps for SharePoint**.
4. In the dialogue that follows, tick **Make this solution available to all sites in the organisation** if you want it everywhere, then select **Deploy**.
5. On any modern page, edit the page, add the **Custom Links** web part, and configure the links in the property pane.

Uploading to the tenant App Catalog requires the SharePoint Administrator role, or ownership of the App Catalog site.

## Build provenance

| Item | Value |
|------|-------|
| Upstream commit | `pnp/sp-dev-fx-webparts@41b8d71609ba34d3dd5c41de76ebdd1cfdf00a7c` |
| Solution ID | `1774407c-58b4-4d81-98a2-5f228c1dcdd8` |
| Version | `1.0.0.0` |
| SHA-256 | `8a2cf8ef28abfee1a47a0999e1fe5f9d36be7eacec034ffa6b1a364fd17b0c85` |

The package was built with `gulp bundle --ship` and `gulp package-solution --ship` on Node.js 16.20.2, which matches the sample's `@microsoft/sp-build-web` 1.16.1 build toolchain. Dependencies were installed with `npm ci --legacy-peer-deps --ignore-scripts`, because the sample's `@microsoft/sp-webpart-workbench` 1.12.1 dev dependency pulls in `node-sass` 4.12, which does not compile on Node 16. That module only serves the local workbench and is not used by the production bundle.

## Rebuilding

```bash
cd react-custom-links
npm ci --legacy-peer-deps --ignore-scripts
BROWSERSLIST_IGNORE_OLD_DATA=1 npx gulp bundle --ship
BROWSERSLIST_IGNORE_OLD_DATA=1 npx gulp package-solution --ship
```

The output appears at `react-custom-links/sharepoint/solution/custom-links.sppkg`. The `BROWSERSLIST_IGNORE_OLD_DATA` variable suppresses an outdated-data notice that the SPFx build otherwise treats as a failure.

## Caveats

The sample targets SPFx 1.11 runtime libraries (October 2020) and is a community sample, not a Microsoft-supported product. It works on SharePoint Online but not on SharePoint Server 2016 or 2019. Before using it in production, consider testing it on a non-critical site first.

---

# Global Navigation Header extension for SharePoint Online

This repository also holds a ready-to-deploy package built from the PnP community sample [`react-application-navigation-header`](https://github.com/pnp/sp-dev-fx-extensions/tree/main/samples/react-application-navigation-header) by Nicolas Kheirallah. It is an SPFx Application Customizer that renders a responsive global header (mega-menu, mobile drawer, search, bookmarks, accessibility tools) in the `Top` placeholder of every modern page, and an optional HTML footer in the `Bottom` placeholder. Navigation is read from the SharePoint Term Store or from a `navigation.json` file in Site Assets.

## Contents

| Path | Purpose |
|------|---------|
| `package/navigation-header.sppkg` | Production package, ready to upload to the App Catalog |
| `react-application-navigation-header/` | Sample source with one dependency patch (see below) |

## Change from upstream

The upstream lockfile pinned `dompurify` 3.4.13, which is affected by critical cross-site scripting advisories ([GHSA-p98j-92pf-mc4p](https://github.com/advisories/GHSA-p98j-92pf-mc4p), [GHSA-mrv2-3pqr-j5jr](https://github.com/advisories/GHSA-mrv2-3pqr-j5jr) and related). DOMPurify is the library that sanitises the admin-authored footer HTML, so it was raised to `^3.4.17`; `npm audit fix` also moved the transitive build-time dependency `fast-uri` to 3.1.9. `npm audit --omit=dev` now reports no vulnerabilities. The remaining audit findings sit in the SPFx build toolchain, and resolving them would require `--force` upgrades that break the pinned SPFx 1.23.2 versions; they do not reach the shipped bundle. No source code was changed.

## Deploying the package

The solution sets `includeClientSideAssets: true` and `skipFeatureDeployment: true`, and requests no Microsoft Graph or other API permissions. Upload `package/navigation-header.sppkg` to the App Catalog as described above. The package includes `ClientSideInstance.xml`, so ticking **Make this solution available to all sites** registers the header in the App Catalog's **Tenant Wide Extensions** list and activates it on every modern site at once. To limit its reach, leave that box unticked and add the app to individual sites instead, or edit the list entry afterwards to target specific site templates or disable it.

The default component properties in `ClientSideInstance.xml` contain literal placeholders (`{homeUrl}`, `{logoUrl}`, `{logoAltText}`) and set `navigationSource` to `jsonFile`. Replace these, either in the Tenant Wide Extensions list entry or in a `settings.json` file, before relying on the header in production; otherwise the logo link will point to the placeholder text. Configuration options (`navigationSource`, `termSetId`, colours, feature flags) are documented in `react-application-navigation-header/README.md`.

## Build provenance

| Item | Value |
|------|-------|
| Upstream commit | `pnp/sp-dev-fx-extensions@9e9ce76eebc90b3c998af4a6e933720bfc068190` |
| Solution ID | `f22b86bd-bfd8-4fa3-9c74-d15efc925bc6` |
| Version | `1.0.0.0` |
| SHA-256 | `eb0aa7717d4c146e3b41783198961c34bb22467df88bbb6b75c64181f2b0f5b2` |

Built with `npm ci` and `npm run build` (Heft, `--production`) on Node.js 22.23.4. ESLint passed with `--max-warnings 0` and all 45 Jest tests passed.

## Rebuilding

```bash
cd react-application-navigation-header
npm ci
npm run build
```

The output appears at `react-application-navigation-header/sharepoint/solution/header.sppkg`.

## Caveats

This is a community sample, not a Microsoft-supported product, and it runs on SharePoint Online only. Because it injects into every page, test it on a non-critical site before tenant-wide activation.
