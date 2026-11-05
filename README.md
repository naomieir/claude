# SharePoint Framework web part packages

This repository holds ready-to-deploy SharePoint Framework (SPFx) solution packages (`.sppkg`) built from community samples in the PnP repository [`pnp/sp-dev-fx-webparts`](https://github.com/pnp/sp-dev-fx-webparts). Each package sits in `package/`, and the source it was built from sits beside it, so that any package can be audited or rebuilt.

Twenty-six packages are included: the original Custom Links web part and 25 further samples. Two requested samples were not packaged, for reasons given under [Samples not packaged](#samples-not-packaged).

## Contents

| Path | Purpose |
|------|---------|
| `package/*.sppkg` | Production packages, one per sample, named after the upstream sample folder |
| `samples/<sample>/` | Sample source as built, including the small build patches described below |
| `samples/PATCHES.diff` | Every change made to upstream source, as a single reviewable diff (lockfiles excluded) |
| `react-custom-links/` | Unmodified source of the original Custom Links package |
| `LICENSE-PnP` | MIT licence covering the upstream samples |

## Package catalogue

All packages were built from `pnp/sp-dev-fx-webparts@41b8d71609ba34d3dd5c41de76ebdd1cfdf00a7c` with `includeClientSideAssets: true`, so every JavaScript bundle is shipped inside the `.sppkg` and no external CDN is required. I checked that each package contains its `ClientSideAssets/*.js` bundles and no `localhost` debug URLs.

"Tenant-wide" means the solution sets `skipFeatureDeployment: true`, which lets an administrator make it available on every site at upload time (Microsoft, 2021). The three solutions without it must be added to each site individually from **Site contents → New → App**.

| Package | Solution ID | Version | Build toolchain / Node | Tenant-wide | Graph permissions |
|---|---|---|---|---|---|
| `custom-links.sppkg` | `1774407c-58b4-4d81-98a2-5f228c1dcdd8` | 1.0.0.0 | SPFx 1.16.1 / Node 16 | Yes | None |
| `react-directory.sppkg` | `5b62bc16-3a71-461d-be2f-16bfcb011e8a` | 5.0.0.0 | SPFx 1.22.1 (Heft) / Node 22 | Yes | None |
| `react-document-links-accordion.sppkg` | `f7134ff1-6e97-430c-9a73-5dc4902c75e3` | 1.0.0.0 | SPFx 1.22.2 (gulp) / Node 22 | Yes | None |
| `react-enhanced-button.sppkg` | `84804705-0fca-4c5b-8b6f-e9b01c02d820` | 1.0.0.0 | SPFx 1.20.1 / Node 18 | Yes | None |
| `react-enhanced-list-formatting.sppkg` | `af9a29d7-413a-4763-8ae0-926101bd010a` | 1.0.0.0 | SPFx 1.10.0 / Node 10 | No | None |
| `react-feedback-sidebar.sppkg` | `a526cb38-54b1-4704-bb86-295189772026` | 0.0.0.3 | SPFx 1.20.1 / Node 18 | Yes | None |
| `react-group-members-webpart.sppkg` | `7cdc593f-2944-47b9-88b3-3c30dd7faf42` | 1.0.0.0 | SPFx 1.20.2 / Node 18 | Yes | `User.Read.All`, `User.ReadBasic.All`, `Group.Read.All`, `GroupMember.Read.All`, `Presence.Read.All` |
| `react-holidays-calendar.sppkg` | `c85f1137-142e-4570-b3c9-3cdc47580452` | 1.1.0.0 | SPFx 1.21.1 / Node 22 | Yes | `Calendars.ReadWrite`, `User.Read`, `MailboxSettings.Read` |
| `react-hub-site-navigator.sppkg` | `7bbcc1e4-4948-4162-95c6-cfca4e4cbbeb` | 1.0.0.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-json-form.sppkg` | `a2797e03-2117-49f4-8b08-15bdf177d07b` | 1.0.0.0 | SPFx 1.17.1 / Node 16 | Yes | None |
| `react-list-form.sppkg` | `373a20ef-dfc6-456a-95ec-171de3c94581` | 1.0.10.0 | SPFx 1.10.0 / Node 10 | Yes | None |
| `react-modern-carousel.sppkg` | `45e061b8-13f5-423f-bedb-12fc2a44fa89` | 2.0.0.0 | SPFx 1.21.0 / Node 22 | Yes | None |
| `react-modern-glossary.sppkg` | `ebfdb41b-a1d4-42b4-900e-ceea1df878ff` | 1.0.0.0 | SPFx 1.23.0 (Heft) / Node 22 | Yes | None |
| `react-modern-link-presenter.sppkg` | `cee514eb-1de8-4fdb-8de0-40dcb03dcdfe` | 1.0.0.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-modern-organization-chart.sppkg` | `d28b8c44-5df1-4315-a6eb-a5be13ba4b88` | 1.1.0.0 | SPFx 1.20.2 / Node 18 | Yes | `Presence.Read.All` |
| `react-multiscreen-webpart.sppkg` | `8aae1dc4-d74b-4ec4-ae2f-ebfd1e9ee7d0` | 1.1.0.0 | SPFx 1.22.2 (gulp) / Node 22 | Yes | None |
| `react-news.sppkg` | `2977aa46-bf61-4068-b5a3-95a5b3119720` | 1.0.0.0 | SPFx 1.22.1 (gulp) / Node 22 | Yes | `Groups.Read.All` |
| `react-organization-chart.sppkg` | `0b4a3e5d-123f-41ea-96c4-538c6a19932b` | 1.4.0.0 | SPFx 1.22.1 (Heft) / Node 22 | Yes | None |
| `react-page-navigator.sppkg` | `065ee566-e00d-4058-bbfd-356c8d9a8005` | 1.13.0.0 | SPFx 1.20.2 / Node 18 | No | None |
| `react-public-holidays-global.sppkg` | `a713c73b-9961-4e84-bbfb-54e3cceae8b9` | 1.0.0.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-quick-links-grid.sppkg` | `676f926c-fcfa-4921-a624-a6e16aaa511a` | 1.0.1.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-quick-links-pro.sppkg` | `897a2013-dfb6-4979-9e5e-028ff98cbe6d` | 1.0.0.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-rss-reader.sppkg` | `fcb53167-e0d5-4ed1-9648-149146649aa1` | 1.1.0.0 | SPFx 1.22.2 (Heft) / Node 22 | Yes | None |
| `react-sp-countdown-timer.sppkg` | `57a9d455-30bd-4a4f-9b50-92ccc8f4506e` | 1.0.0.0 | SPFx 1.21.1 / Node 22 | Yes | None |
| `react-taxonomy-file-explorer.sppkg` | `5697a573-1bd1-4ff3-96f1-82263c8eb008` | 1.0.0.0 | SPFx 1.22.1 (gulp) / Node 22 | No | None |
| `spfx-news.sppkg` | `1cdf8b67-50c3-460a-a478-36e6be760ba2` | 1.2.0.0 (enhanced) | SPFx 1.22.2 (Heft) / Node 22 | Yes | `Sites.Read.All` |

The "build toolchain" column gives the version of `@microsoft/sp-build-web` (or the Heft rig), not the version recorded in each sample's `.yo-rc.json`. The two often disagree, because many samples have had their build tools upgraded without their scaffold metadata being updated. `react-news`, for example, declares SPFx 1.10 but builds with the 1.22.1 toolchain. Node versions follow Microsoft's compatibility matrix for the toolchain in use (Microsoft, 2026a).

## Deploying a package

1. Download the `.sppkg` from `package/`.
2. Open the SharePoint admin centre, then **More features → Apps → App Catalog**, or use a site-collection App Catalog for a narrower scope.
3. Upload the file to **Apps for SharePoint**.
4. For tenant-wide packages, leave **Enable this app and add it to all sites** ticked if you want the web part available everywhere, then select **Deploy** (Microsoft, 2021). Otherwise add the app to each site from **Site contents**.
5. Edit a modern page and add the web part from the toolbox.

Uploading to the tenant App Catalog requires the SharePoint Administrator role or ownership of the App Catalog site.

### Packages that request Microsoft Graph permissions

Five packages declare `webApiPermissionRequests`: Group Members, Holidays Calendar, Modern Organization Chart, React News and SPFx News. Uploading one of them creates pending requests that an administrator must approve on the **API access** page of the SharePoint admin centre before the web part can call Graph (Microsoft, 2026b). Until then, the web part loads but its Graph-backed features fail.

These grants deserve care. In the shared SPFx permission model, approved delegated permissions are granted to the *SharePoint Online Client Extensibility Web Application Principal*, not to the requesting solution. Every SPFx solution in the tenant therefore inherits them (Microsoft, 2026b). Approving `Calendars.ReadWrite` for the Holidays Calendar, for example, would let any other SPFx code running in the tenant write to the signed-in user's calendar. Approve only the requests you need, and consider testing these five packages in a non-production tenant first.

## Build provenance

| Item | Value |
|------|-------|
| Upstream commit | `pnp/sp-dev-fx-webparts@41b8d71609ba34d3dd5c41de76ebdd1cfdf00a7c` |
| Build commands (gulp) | `gulp bundle --ship` then `gulp package-solution --ship` |
| Build commands (Heft) | `heft build --clean --production` then `heft package-solution --production` |
| Install | `npm ci --legacy-peer-deps --ignore-scripts`, against each sample's committed lockfile where one exists |
| Node runtimes | 10.24.1, 16.20.2, 18.20.8, 22.23.4, selected by toolchain version |
| Build date | 4 November 2026 |

### SHA-256 checksums

```
8a2cf8ef28abfee1a47a0999e1fe5f9d36be7eacec034ffa6b1a364fd17b0c85  custom-links.sppkg
8e85a113f120d866b1611aa8c1c30715e1c15e79ebd92df5c1b098df6ab62e56  react-directory.sppkg
b74583c59ffcc224ae3bc5b7d5213142f5b0f5395eb95b186d89dbd1e9720705  react-document-links-accordion.sppkg
168a2f5caa93c95eb7a1ca6ebe78c9fafd33adfebf82fc5bf096f49cbd653856  react-enhanced-button.sppkg
98ca4465741bbeacaaf8eebaa73c5ffaaf749b5a085ff06c0c12234ed20653c0  react-enhanced-list-formatting.sppkg
5f0bea56751f120aeea1f41ad8e8ef76e2d6f64c58997895d0b45914bbc4a7da  react-feedback-sidebar.sppkg
56039f8ec3ae09b0712bdd96b21b7a41afd5edf30e96c58b31cbeb6a30827c21  react-group-members-webpart.sppkg
48575312c449d994017f2afdf74b3dcfcba6fdbe38852a33e3b3886ad65d959d  react-holidays-calendar.sppkg
0121c7a9efdbaa908538200aeb89142335819b54fbf9397c07637090bda4a2cc  react-hub-site-navigator.sppkg
230e830b2eacdb33bac55f2e4dca1ef9ff5e44f3342b8a3b6c2d6293a2f20fa8  react-json-form.sppkg
256376509601389943e957f850be1c39ba6dc68b7da2ccc47b7836e68f96a207  react-list-form.sppkg
8847c7e0b3311c287a6c781ec5c52670bebbc60ac9690a4a55a535359ce17f18  react-modern-carousel.sppkg
d5cc367efa795d6d9587fc43219e6a165c47b571795f617e1ad66237031a9072  react-modern-glossary.sppkg
8f44105abc873c37b7fb20e871974549e30ae7575ad015c38835ab5d17cf70a4  react-modern-link-presenter.sppkg
6930fe0422b1dec9cd572dbc558b2ede515cb808dc463fbaba99b9225f1042d9  react-modern-organization-chart.sppkg
9b8296c38030a94e17782f4c0fb306259618b642d01abec03501c34a5dbb93c1  react-multiscreen-webpart.sppkg
cb1e5f9b6e4aaa8223edd67e93d653a5b7b71caea111fe6d609c75aa3650daea  react-news.sppkg
ecbbe379e7e946263cb417190a7d9ec7675d98083d72a6007096a1173e19ebe9  react-organization-chart.sppkg
3ac5cafce1067f0767e181397e9731684ed197d9f5095e4a940d33182328b911  react-page-navigator.sppkg
ccb66d473d4587a1806785c891df2190d13655fa0221dc538078b0961b1310e5  react-public-holidays-global.sppkg
3df262e067e813f3b3a8863cc62a300c36052652e10419f96183639ba68a2112  react-quick-links-grid.sppkg
927a2811fa05f3b555b32dede3d40d2e080e8fef6ba65b6066f1049b24325a10  react-quick-links-pro.sppkg
dcc3bb59f0e6bcc63f42f4ccf7a94e26355dbd7d3bd91d5c55ac402751eb821b  react-rss-reader.sppkg
d1bee34802585481064cca19bbb6434145bda1715908ba13cd6e353a102c90b2  react-sp-countdown-timer.sppkg
7823dbf10c07d79a324459669caefa3c578364807daf001164aebdad87fd328c  react-taxonomy-file-explorer.sppkg
00e3108b328cc6955f2712b0548801793865850472a2b5c79acce69efbac9b79  spfx-news.sppkg
```

## Changes made to upstream source

Seventeen samples built unchanged. Eight did not build as published, because the upstream repository mixes toolchain versions, lockfile formats and dependency upgrades that are mutually inconsistent. In each case I made the smallest change that let the sample build, without altering its functional code. `samples/PATCHES.diff` records every change.

| Sample | Problem | Change |
|---|---|---|
| `react-group-members-webpart` | Free-text App Catalog categories fail schema validation | Mapped them to the allowed values "Collaboration", "Social" and "IT/admin" (listing metadata only) |
| `react-modern-carousel` | `--ship` treats SCSS-casing and lint warnings as fatal | Added `build.addSuppression` rules for those two warning classes; type errors still fail the build |
| `react-modern-link-presenter` | Same warnings; also a `SharePoint/` folder that only resolves on case-insensitive file systems | Same suppressions; renamed the folder to the conventional `sharepoint/` |
| `react-multiscreen-webpart` | `react-router-dom` was bumped to 7.12, but the code uses the v4/v5 `<Route>` API and its v4 typings, and TypeScript 3.7 cannot parse v7's declarations | Pinned `react-router-dom` to 5.3.4, the final v5 release |
| `react-news` | gulp 3.9 cannot run on the Node 22 its 1.22.1 toolchain needs; its compiler package predates that toolchain | `gulp` 4.0.2, `rush-stack-compiler-3.3` 0.11.2, and removal of the deprecated `no-use-before-declare` tslint rule |
| `react-document-links-accordion` | Fluent UI 8 typings need TypeScript ≥ 3.8; code uses the PnPjs v2 API but never declared `@pnp/sp`, so only an incompatible transitive 1.x copy was available | `rush-stack-compiler-3.9`; declared `@pnp/sp` 2.15.0; removed the same deprecated tslint rule |
| `react-rss-reader` | No lockfile, and the Heft toolchain needs a strict peer-dependency install | Installed without `--legacy-peer-deps` and committed the resulting `package-lock.json` |
| `react-list-form` | npm 7 hoisted `@types/react` 16.14 over the locked 16.8.8, which TypeScript 3.3 cannot parse | Build-environment fix only: restored the locked 16.8.8; no source change |

Two environment workarounds applied across the older samples. SPFx 1.10–1.12 lockfiles written by npm 7 or later (lockfile v3) were installed with npm 7.24.2, which reads that format and still supports Node 10. The `node-sass` native binary, skipped by `--ignore-scripts`, was fetched explicitly; it is needed only to compile SCSS during the build.

README screenshots and demo GIFs were dropped from `samples/` to keep the repository small (about 76 MB in total, mostly lockfiles). They remain available upstream, so image links in the individual sample READMEs will not resolve here.

## Enhancements to SPFx News (1.2.0.0)

The `spfx-news` package carries features that the upstream sample lacks. They are documented in full in [`samples/spfx-news/README.md`](samples/spfx-news/README.md#additions-in-versions-11-and-12).

- **Show site name** and **Show description** switches in the Display group.
- A **News to show** group with two modes. *Newest news from the data source* can be narrowed by **enterprise keywords** (any or all); the condition is compiled into the Graph search query, so the maximum-items setting still counts only matching posts. *Selected news posts* lets editors search for up to 30 specific posts, put them in order, and show exactly those.
- A fix to the upstream Lithuanian (`lt-lt`) language file, whose unescaped quotation mark stopped it loading, so the web part failed for users with Lithuanian as their display language.

Version 1.1.0.0 also had a page-property filter; 1.2.0.0 removes it, and any page-property conditions saved by 1.1 are ignored. The solution ID is unchanged, so uploading 1.2.0.0 to the App Catalog upgrades the existing app in place. Existing web parts keep their appearance: the new switches default to on and the content to the newest news with no filter. No new permissions are needed, because everything uses the `Sites.Read.All` Graph scope the package already requests.

## Samples not packaged

**`react-list-items-menu-sp2019`.** This sample targets SharePoint Server 2019 and mixes SPFx 1.4.1 runtime libraries with a 1.11.0 build toolchain. Its gulpfile calls a TypeScript-configuration module that the 1.11 toolchain removed, its `tsconfig.json` extends a compiler package it does not declare, and its Terser override cannot resolve webpack internals in the 1.11 tree. Making it build would mean re-engineering the toolchain rather than patching it, so I stopped there. It is also of little use on SharePoint Online.

**`react-side-panel`.** This is an SPFx 1.0 sample from 2017. That version predates `includeClientSideAssets`, so its package cannot carry its own JavaScript, and its `cdnBasePath` is an unfilled placeholder. A built package would therefore not load without separately hosting its bundle on a CDN you control. The sample also has no lockfile, and a present-day install resolves transitive packages that cannot run on the Node 6 runtime SPFx 1.0 requires. The practical route is to port it to a current SPFx version.

## Rebuilding a sample

Use the Node version shown in the catalogue, then from `samples/<sample>/`:

```bash
npm ci --legacy-peer-deps --ignore-scripts
```

For gulp-based samples:

```bash
BROWSERSLIST_IGNORE_OLD_DATA=1 npx gulp bundle --ship && npx gulp package-solution --ship
```

For Heft-based samples (those listing `@rushstack/heft` in `package.json`):

```bash
npx heft build --clean --production && npx heft package-solution --production
```

For SPFx 1.10–1.12 samples, also run `node node_modules/node-sass/scripts/install.js` after installing. The output appears in `sharepoint/solution/`.

## Caveats

These are community samples, not Microsoft-supported products. I built and inspected the packages but did not test them in a SharePoint tenant, so behaviour on a live site, particularly for the patched samples, has not been verified. Test on a non-critical site first. Several samples, notably those on SPFx 1.10–1.12, rely on toolchains and libraries that are no longer maintained (Microsoft, 2026a). They should be regarded as interim solutions rather than long-term dependencies.

## References

Microsoft. (2021, October 25). *Tenant-scoped solution deployment for SharePoint Framework solutions*. Microsoft Learn. https://learn.microsoft.com/en-us/sharepoint/dev/spfx/tenant-scoped-deployment

Microsoft. (2026a, November 2). *SharePoint Framework platform & toolchain compatibility reference*. Microsoft Learn. https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility

Microsoft. (2026b, October 25). *Connect to Microsoft Entra ID-secured APIs in SharePoint Framework solutions*. Microsoft Learn. https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient

PnP Community. (2026). *SharePoint Framework client-side web part samples* [Source code]. GitHub. https://github.com/pnp/sp-dev-fx-webparts
