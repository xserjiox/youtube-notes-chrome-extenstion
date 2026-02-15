# Privacy Policy for YouTube Notes

**Last updated:** February 15, 2026

## Introduction

YouTube Notes ("the Extension") is a Chrome browser extension developed by **xserjiox** that allows users to add timestamped notes to YouTube videos. This Privacy Policy describes how the Extension handles user data.

## Data Collection and Use

**YouTube Notes does not collect, transmit, or share any personal or sensitive user data.** All data created by the user stays entirely on the user's device.

### Data Stored Locally

The Extension stores the following data locally in your browser using `chrome.storage.local`:

- **Notes content** — text notes you create for YouTube videos
- **Timestamps** — video timestamps associated with your notes
- **Video metadata** — title, URL, and video ID of YouTube videos you add notes to
- **Language preference** — your selected UI language (if manually changed)

This data is stored exclusively on your device and is never transmitted to any external server, third party, or analytics service.

### Website Content Accessed

The Extension reads the following information from YouTube pages solely to provide its core functionality:

- **Video URL** — to uniquely identify the video and associate your notes with it
- **Video title** — to display the video name in the notes list
- **Video playback position** — to create timestamped notes

This information is used only within the Extension on your device and is never sent to any external server.

## Data Sharing

YouTube Notes does **not** share any data with third parties. No data leaves your browser.

## Network Requests

The Extension does not make any network requests to external servers. The only external resources loaded are YouTube video thumbnail images (`img.youtube.com`) for display purposes within the Extension's UI. No user data is sent in these requests.

## Permissions

The Extension requests the following browser permissions:

| Permission | Purpose |
|---|---|
| `storage` | To save your notes locally in the browser |
| `activeTab` | To identify the current YouTube video and interact with the page |
| Content script access to `youtube.com` | To inject the notes UI on YouTube pages |

These permissions are used solely for the Extension's core functionality and are not used to collect or transmit any data.

## Third-Party Services

YouTube Notes does **not** use any third-party services, including:

- No analytics or tracking tools
- No advertising networks
- No cloud storage or synchronization services
- No user authentication services
- No crash reporting services

## Data Retention and Deletion

All data is stored locally in your browser. You can delete your data at any time by:

- Deleting individual notes within the Extension
- Uninstalling the Extension (this removes all stored data)
- Clearing browser extension data through Chrome settings

## Data Security

All user data is stored locally on your device using Chrome's built-in `chrome.storage.local` API. No data is transmitted over the network, which eliminates risks associated with data interception or server breaches. Since no data leaves your browser, there are no external servers or databases that could be compromised.

## Chrome Web Store User Data Policy Compliance

The use of information received from Chrome APIs adheres to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/), including the [Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use) requirements. Specifically:

- Data obtained through Chrome APIs is used solely to provide the note-taking functionality described in this policy
- No data is transferred to third parties except as necessary to provide the Extension's features (currently, no transfers occur)
- Data is not used for advertising, analytics, or any purpose unrelated to the Extension's core functionality
- No human can read your data — it remains entirely on your device under your control

## Children's Privacy

YouTube Notes does not knowingly collect any personal information from children or any other users. The Extension does not collect personal information from anyone.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be reflected by updating the "Last updated" date at the top of this document. Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Contact

If you have any questions about this Privacy Policy, please contact us at:

- **Email:** contact.serhiihrushun@gmail.com
- **GitHub:** [https://github.com/xserjiox](https://github.com/xserjiox)
