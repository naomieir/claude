# Custom Links web part for SharePoint Online

This repository holds a ready-to-deploy SharePoint Framework (SPFx) package built from the PnP community sample [`react-custom-links`](https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-custom-links) by João Mendes. The web part renders a set of links whose background colour, foreground colour, font size, width and height can each be customised in the property pane.

## Contents

| Path | Purpose |
|------|---------|
| `package/custom-links.sppkg` | Production package, ready to upload to the App Catalog |
| `react-custom-links/` | Unmodified sample source, for rebuilding or adapting |
| `package/award-recognition.sppkg` | Modern Carousel (Award Recognition) package with auto-scroll, see [below](#modern-carousel-award-recognition-web-part) |
| `react-modern-carousel/` | Modern Carousel source, with the auto-scroll changes |
| `package/image-gallery.sppkg` | Filterable Image Gallery package with auto-scroll, see [below](#filterable-image-gallery-web-part) |
| `react-image-gallery/` | Image Gallery source, with the auto-scroll changes |
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

# Modern Carousel (Award Recognition) web part

`package/award-recognition.sppkg` is built from the PnP sample [`react-modern-carousel`](https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-modern-carousel) by Sandeep P S. It shows people from a SharePoint list as a Swiper carousel with cover-flow or card effects. This build adds **automatic scrolling, horizontally or vertically**.

## What was added

A new **Auto-scroll** group in the property pane:

| Setting | Default | Notes |
|---------|---------|-------|
| Scroll direction | Horizontal | Horizontal or Vertical. The edge fades follow the direction. |
| Scroll automatically | On | Advances the carousel on a timer. |
| Seconds per slide | 3 | 1 to 15 seconds. |
| Pause while the pointer is over the carousel | On | Resumes when the pointer leaves. |
| Carousel height in vertical mode (px) | 520 | 420 to 1000; vertical mode needs a fixed height. |

Auto-scroll keeps running after someone swipes or uses the keyboard. With **Enable carousel animations** set to *Loop* (the new default) it scrolls endlessly; with *Rewind* or *Off* it jumps back to the first slide after the last one.

Changed files: `src/components/Carousel.tsx`, `src/webparts/awardRecognition/AwardRecognitionWebPart.ts` and its manifest, `IAwardRecognitionProps.ts`, `AwardRecognition.module.scss`, and the `loc` strings. The solution version is now `2.1.0.0`.

## Prerequisite: the list

Create a custom list named exactly **Award Recognition** on the site where the web part will be used, with these columns:

| Column | Type |
|--------|------|
| Title | Built-in (the person's name) |
| Designation | Single line of text |
| UserImage | Image |

## Deploying

1. Download `package/award-recognition.sppkg`.
2. Upload it to **Apps for SharePoint** in the tenant (or site-collection) App Catalog and select **Deploy**. It sets `skipFeatureDeployment: true`, so you can make it available to all sites, and it requests no API permissions.
3. Edit a modern page, add **Award Recognition** (in the *Advanced* group), and open its property pane to set the direction and timing.

If an earlier 2.0 version of this solution is already in the App Catalog, uploading this file replaces it.

## Build provenance

| Item | Value |
|------|-------|
| Upstream commit | `pnp/sp-dev-fx-webparts@52e10a165aeaaacd73bd25ebdf0028d047843dc7` |
| Solution ID | `45e061b8-13f5-423f-bedb-12fc2a44fa89` |
| Version | `2.1.0.0` |
| SHA-256 | `217e645cfaee5aa199ed1d5e140e89540818e48a37ee783b516e8367041f743f` |

Built with SPFx 1.21.0 on Node.js 22.23.4:

```bash
cd react-modern-carousel
npm ci
npx gulp bundle --ship
npx gulp package-solution --ship
```

The output appears at `react-modern-carousel/sharepoint/solution/award-recognition.sppkg`. The build prints nine `@typescript-eslint/ban-types` lint warnings that come from the upstream sample's ESLint configuration; they do not affect the bundle.

---

# Filterable Image Gallery web part

`package/image-gallery.sppkg` is built from the PnP sample [`react-image-gallery`](https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-image-gallery) by Ejaz Hussain and Ari Gunawan. It shows images from a picture library with department (taxonomy) filtering, title search and paging, and opens a side panel with the image and its tags on click. This build adds **continuous automatic scrolling, horizontally or vertically**.

## What was added

A new **Auto-scroll** group in the property pane:

| Setting | Default for new web parts | Notes |
|---------|---------------------------|-------|
| Scroll images automatically | On | Off shows the original static grid. Web parts already on a page stay off until switched on. |
| Scroll direction | Horizontal | *Horizontal* is a single row moving left; *Vertical* is a grid moving up. |
| Speed (pixels per second) | 40 | 10 to 200. |
| Pause while the pointer is over the images | On | Resumes when the pointer leaves. |
| Image width | 240 px | Tile width in horizontal mode; minimum column width in vertical mode. |
| Scrolling area height in vertical mode | 500 px | 200 to 1200. |

Behaviour:

- Scrolling loops seamlessly through the current page of images; the **Page Size** slider (now up to 50) sets how many are in the loop, and **Previous/Next** still change page.
- It only moves when the images don't all fit; otherwise they sit still.
- A **Pause/Resume** button sits above the images. Scrolling also stops while the image panel is open or a page is loading.
- People whose device asks for reduced motion start paused and can press Resume.
- Visitors can still scroll by hand (touch, trackpad, wheel); auto-scroll carries on from where they leave it.
- Tiles are cropped to 4:3 so a moving row or grid stays even; the panel shows the full image.

The changes are a new `components/AutoScroller/` component, plus `ImageGallery.tsx`, `IImageGalleryProps.ts`, `ImageGalleryWebPart.ts`, its manifest and the `loc` strings. The solution version is now `1.2.0.0`.

### Fix to the upstream sample

The upstream `buildFilterQuery` had its conditions inverted, so the first load (no department, no search) asked SharePoint for `TaxCatchAll/Term eq 'undefined' and startswith(Title,'undefined')` and showed no images. It now sends no filter when nothing is selected, filters correctly by department, search or both, and escapes apostrophes in search terms.

## Prerequisites

The sample reads a few fixed names; set these up on the site first:

1. In the Term Store, a term set named **Departments** with child terms (for example HR, Sales, Marketing).
2. A picture or document library holding the images.
3. In that library, a **Managed Metadata** column whose internal name is **Department**, bound to the Departments term set (allow multiple values if you like).
4. A **Title** on each image (search matches the start of the title).

## Deploying

1. Download `package/image-gallery.sppkg`.
2. Upload it to **Apps for SharePoint** in the tenant (or site-collection) App Catalog and select **Deploy**. It sets `skipFeatureDeployment: true` and `includeClientSideAssets: true`, so it can be made available to all sites, ships all its JavaScript inside the package, and requests no API permissions.
3. Edit a modern page, add **React Image Gallery** (in the *Other* group), enter the library name, and set the Auto-scroll options. Select **Apply** at the bottom of the property pane to see changes.

If version 1.1 of this solution (ID below) is already in the App Catalog, uploading this file replaces it.

## Build provenance

| Item | Value |
|------|-------|
| Upstream commit | `pnp/sp-dev-fx-webparts@52e10a165aeaaacd73bd25ebdf0028d047843dc7` |
| Solution ID | `876cbbe8-6974-4676-9da3-5c190ac8164f` |
| Version | `1.2.0.0` |
| SHA-256 | `4b4917bfd8fe45416b50743f19b3e7edaccb547f66e549b37895b64a0e0874e4` |

Built with SPFx 1.14 runtime libraries and `@microsoft/sp-build-web` 1.18.0 on Node.js 18.20.8:

```bash
cd react-image-gallery
npm ci --ignore-scripts --legacy-peer-deps
BROWSERSLIST_IGNORE_OLD_DATA=1 npx gulp bundle --ship
BROWSERSLIST_IGNORE_OLD_DATA=1 npx gulp package-solution --ship
```

`--ignore-scripts` skips compiling `node-sass` 4, an unused dependency of `@pnp/spfx-controls-react`'s theme helper that does not build on Node 18; the SPFx 1.18 toolchain compiles the styles with Dart Sass. The output appears at `react-image-gallery/sharepoint/solution/image-gallery.sppkg`.

The auto-scroll component was checked in Chromium: it moves at the set speed in both directions, loops without a visible jump, pauses on hover and with the Pause button, and resumes afterwards. The full web part has not been run against a live SharePoint library.

