# News Web Part

## Summary

A SharePoint Framework (SPFx) web part that displays SharePoint news in **6 configurable layout modes**, with support for data source selection, auto-refresh, card customization, and full Fluent UI v9 theming. Built with [**@spteck/react-controls-v2**](https://www.npmjs.com/package/@spteck/react-controls-v2) and runs on SharePoint Online, Microsoft Teams, and Microsoft 365 (Office) hosts.

![News animated preview](./src/assets/news-0.gif)
![Feature layout](./src/assets/news-01.png)
![Filmstrip layout](./src/assets/news-02.png)
![Grid layout](./src/assets/news-03.png)
![List layout](./src/assets/news-04.png)
![Masonry layout](./src/assets/news-05.png)

## Features

- **6 layout modes** — Feature, Filmstrip, Grid, List, Marquee, Masonry
- **Data source selection** — All org news, org news only, or pick specific sites
- **Card customization** — Configurable headline lines, body text lines, and card height
- **Auto-refresh** — Configurable refresh interval (minutes)
- **Marquee direction** — Vertical or horizontal scrolling (Marquee layout)
- **Drag-and-drop reordering** — Optionally allow readers to reorder news cards
- **Social signals** — Toggle author/date, views/likes, comments, and share button per deployment
- **Multi-host support** — SharePoint Web Part, SharePoint Full-Page App, Teams Personal App, Teams Tab
- **Theme-aware** — Adapts to SharePoint themes and Teams light/dark/high-contrast themes automatically
- **Localized UI** — Ships with 48 language translations

## Additions in versions 1.1 to 1.3

These versions add two display switches, a choice of which news to show, and automatic scrolling for the Carousel layout. Existing web parts keep their current content after upgrading: the switches default to on, and the content defaults to the newest news with no filter. Carousels start scrolling automatically, which can be turned off.

### Show site name, show description

The **Display** group has two new switches. **Show site name** controls the label above each headline naming the site the news post came from. **Show description** controls the page description under the headline. Turning a switch off removes the element from every layout. Neither switch causes the news to be fetched again.

### Carousel: automatic scrolling

With the **Carousel** layout selected, the **Layout** group shows **Scroll automatically** (on by default) and, while it is on, **Seconds per slide** (2 to 20, default 5). The carousel advances one step at that interval and, after the last slide, scrolls back to the first.

So that moving content stays under the reader's control, in line with WCAG 2.2 success criterion 2.2.2 (*Pause, Stop, Hide*), scrolling pauses while the pointer is over the carousel or keyboard focus is inside it, and while the browser tab is hidden. A pause/play button in the carousel's top-left corner stops and restarts it. When the reader's system asks for reduced motion, the carousel starts paused and the button starts it.

The card library (`@spteck/react-controls-v2`) offers no autoplay option, so the web part presses the carousel's own *Next slide* and *Previous slide* buttons on a timer. This keeps the carousel's look and swipe behaviour unchanged, and it was verified in a browser against version 2.7.7, which the lockfile pins. If a future version of the library renames those buttons, automatic scrolling silently stops while the carousel itself keeps working.

### News to show

The **News to show** group offers two modes.

**Newest news from the data source** (the default) shows the most recent news from the sites chosen under **Data Source**. An optional **enterprise keywords** filter narrows it: type a keyword and press Enter to add it, and with two or more keywords choose whether a page must match *any* or *all* of them. The keywords are added to the Microsoft Graph search query itself, so the web part still returns up to the configured maximum number of *matching* posts, rather than fetching that number and discarding non-matches. Keywords are matched against the search property `TaxKeyword` by default. The **Keyword search property** box lets an administrator point the filter at another managed property if the tenant's search schema differs, and the pane shows the resulting search condition (KQL) for checking.

**Selected news posts** shows exactly the posts the editor picks. Search by title, add up to 30 posts, and arrange them with the up and down arrows; the feed shows them in that order. In this mode the **Data Source** and maximum-items settings do not apply.

**Limitations.**

- Search reflects changes only after the next crawl, so a newly tagged or newly published page can take a while to become available to the keyword filter and the post search.
- Picked posts are stored by page URL. If a page is renamed, moved, deleted or unpublished, or the viewer cannot read it, it is silently left out until it is picked again.
- Each viewer sees only the picked posts they have permission to read, because the posts are retrieved through search with the viewer's own permissions.
- Keyword values are matched as search phrases; double quotes are removed, because KQL cannot escape them.
- The new interface text is in English in every language; translations other than English are still to be done.

## Compatibility

| :warning: Important          |
|:---------------------------|
| Every SPFx version is optimally compatible with specific versions of Node.js. In order to be able to build this sample, you need to ensure that the version of Node on your workstation matches one of the versions listed in this section. This sample will not work on a different version of Node.|
|Refer to <https://aka.ms/spfx-matrix> for more information on SPFx compatibility.   |

This sample is optimally compatible with the following environment configuration:

![SPFx 1.22.2](https://img.shields.io/badge/SPFx-1.22.2-green.svg)
![Node.js v22](https://img.shields.io/badge/Node.js-v22-green.svg)
![Toolchain: Heft](https://img.shields.io/badge/Toolchain-Heft-green.svg)
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible](https://img.shields.io/badge/Hosted%20Workbench-Compatible-green.svg)
![Compatible with Remote Containers](https://img.shields.io/badge/Remote%20Containers-Compatible-green.svg)

## Version history

| Version | Date | Comments |
| ------- | ---- | -------- |
| 0.0.1 | May 17, 2026 | Initial release |
| 1.1.0 | November 5, 2026 | Show site name and Show description switches; enterprise keyword and page-property filter; Lithuanian locale fix |
| 1.2.0 | November 5, 2026 | Page-property filter removed; Selected news posts mode added, with ordering |
| 1.3.0 | November 5, 2026 | Automatic scrolling for the Carousel layout, with adjustable speed and pause control |

## Contributors

- [João Mendes](https://github.com/joaojmendes)

## Supported Hosts

| Host | Supported |
| ---- | --------- |
| SharePoint Web Part | Yes |
| SharePoint Full-Page App | Yes |
| Microsoft Teams Tab | Yes |
| Microsoft Teams Personal App | Yes |

## Graph API Permissions

This web part requires the following Microsoft Graph permission to be approved by a **SharePoint Administrator** in the **API access** page of the SharePoint Admin Center:

| Permission | Type | Reason |
| ---------- | ---- | ------ |
| `Sites.Read.All` | Delegated | Search for news pages across the tenant (Graph Search API) and enumerate sites in the site picker |

> The permission is declared in `config/package-solution.json` under `webApiPermissionRequests`. It is requested once when the `.sppkg` solution is deployed and must be approved before the web part can fetch news from sites other than the current one.

## Prerequisites

- Node.js **>=22.14.0 <23.0.0**
- [Heft CLI](https://www.npmjs.com/package/@rushstack/heft) (installed locally by `npm install`)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/pnp/sp-dev-fx-webparts.git
cd sp-dev-fx-webparts/samples/spfx-news
npm install
```

### 2. Run locally

```bash
npm run start
```

Then open the SharePoint-hosted workbench:
`https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/workbench.aspx`

### 3. Build for production

```bash
npm run build
```

The `.sppkg` package is output to the `release/solution/` folder.

### 4. Deploy

1. Upload the `.sppkg` file to your SharePoint **App Catalog**
2. Trust the solution when prompted
3. Add the **News** web part to any SharePoint page, Teams tab, or Teams personal app

## Configuration

Open the web part property pane by clicking **Edit**. Settings are organized into collapsible groups:

### Layout Options

| Setting | Description |
| ------- | ----------- |
| **Layout** | Choose from 6 visual layouts (see below) |
| **Height** | Controls the card/banner height |
| **Marquee direction** | *(Marquee layout only)* **Vertical** or **Horizontal** scrolling direction |

### Data Source

| Setting | Description |
| ------- | ----------- |
| **Data source mode** | **All** — all org news; **Org** — org-level news only; **Selected** — pick specific sites |
| **Selected sites** | *(Selected mode only)* Site picker to choose which sites supply news |
| **Max news** | Maximum number of news articles to display |

> The background refresh interval is fixed at **5 minutes** and is not configurable via the property pane.

### Card Options

| Setting | Description |
| ------- | ----------- |
| **Headline lines** | Number of lines shown for the card headline before truncating |
| **Body lines** | Number of lines shown for the card body text before truncating |
| **Allow drag** | Let users reorder news cards by drag and drop |
| **Show author & date** | Toggle the author name and publication date on each card |
| **Show views & likes** | Toggle the view count and like count on each card |
| **Show comments** | Toggle the comment count on each card |
| **Show share** | Toggle the share button on each card |

## Layout Reference

| Layout | Description |
| ------ | ----------- |
| **Feature** | One large featured article with full-width image and overlay text |
| **Filmstrip** | Horizontal scrolling strip of equally sized news cards |
| **Grid** | Uniform multi-column grid of news cards |
| **List** | Vertical list of news items with thumbnail on the left |
| **Marquee** | Continuously scrolling news ticker (vertical or horizontal) |
| **Masonry** | Pinterest-style variable-height card grid |

## Localization

The web part ships with full translations for all UI strings across 48 languages, including:

| Language | Locale |
| -------- | ------ |
| English (US) | `en-us.js` |
| Portuguese (Portugal) | `pt-pt.js` |
| Portuguese (Brazil) | `pt-br.js` |
| Spanish (Spain) | `es-es.js` |
| French (France) | `fr-fr.js` |
| German (Germany) | `de-de.js` |
| Danish (Denmark) | `da-dk.js` |
| Finnish (Finland) | `fi-fi.js` |
| Swedish (Sweden) | `sv-se.js` |
| Arabic (Saudi Arabia) | `ar-sa.js` |
| Japanese (Japan) | `ja-jp.js` |
| Korean (Korea) | `ko-kr.js` |
| Chinese (Simplified) | `zh-cn.js` |
| Chinese (Traditional) | `zh-tw.js` |
| + 34 more | see `src/webparts/newsFeed/loc/` |



## Technology Stack

| Technology | Purpose |
| ---------- | ------- |
| [SPFx 1.22.2](https://aka.ms/spfx) | SharePoint Framework |
| [@spteck/react-controls-v2](https://www.npmjs.com/package/@spteck/react-controls-v2) | News feed layout and card rendering |
| [@spteck/react-controls-v2-spfx-adapter](https://www.npmjs.com/package/@spteck/react-controls-v2-spfx-adapter) | SPFx context adapter for react-controls-v2 |
| [@spteck/m365-hooks](https://www.npmjs.com/package/@spteck/m365-hooks) | Microsoft 365 data hooks |
| [@fluentui/react-components 9.x](https://react.fluentui.dev/) | Fluent UI v9 components |
| [@fluentui/react-migration-v8-v9](https://www.npmjs.com/package/@fluentui/react-migration-v8-v9) | SPFx v8 theme → Fluent v9 theme conversion |
| [@emotion/css](https://emotion.sh/) | CSS-in-JS for dynamic theming |
| [jotai](https://jotai.org/) | Lightweight atom-based state management |
| [Heft](https://heft.rushstack.io/) | Build toolchain (replaces Gulp in SPFx 1.22+) |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft Teams](https://docs.microsoft.com/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
- [Heft Documentation](https://heft.rushstack.io/)

<img src="https://m365-visitor-stats.azurewebsites.net/sp-dev-fx-webparts/samples/spfx-news" />