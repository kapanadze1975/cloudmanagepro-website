---
title: "Configure Zebra Android Devices for Workspace ONE Launcher and Kiosk (Android Enterprise)"
seo_title: "Configure Zebra Android Devices for Workspace ONE Launcher & Kiosk — Android Enterprise Guide"
slug: "workspace-one-zebra-secure-launcher-kiosk"
description: "Guide to configure Zebra Android devices with Workspace ONE Launcher, StageNow enrollment, OEMConfig, Wi-Fi/certs, verification, and kiosk workflows."
canonical: "https://www.cloudmanagepro.com/articles/workspace-one-zebra-secure-launcher-kiosk/"
category: "Workspace ONE"
platform: "Android"
level: "Intermediate"
author: "CloudManagePro"
verified_date: "2026-09-05"

hero:
  kicker: "Workspace ONE · Android"
  dek: "This guide shows Workspace ONE administrators and device management engineers how to configure Zebra Android devices for managed launcher and kiosk workflows using Workspace ONE Launcher and Zebra OEMConfig, including enrollment, OEMConfig delivery, Wi-Fi and certificate prerequisites, verification, and troubleshooting."
  screen_label: "Zebra Android"
  cloud_label: "Workspace ONE"

tags:
  - zebra
  - workspace-one
  - android
  - oemconfig

references:
  - "https://docs.omnissa.com/bundle/WorkspaceONE-UEM-Product-ProvisioningVSaaS/page/CreateanOSUpgradeforZebraDevicesAndroid8.html"
  - "https://docs.omnissa.com/bundle/ApplicationManagementforAndroidV2402/page/OEMConfigonAndroidEnterpriseDevices.html"
  - "https://techdocs.zebra.com/oemconfig/latest/mc2/"
  - "https://techdocs.zebra.com/oemconfig/latest/setup/"
  - "https://support.zebra.com/article/000026824"
  - "https://support.zebra.com/article/000026037"
  - "https://docs.omnissa.com/bundle/WorkspaceONE-UEM-Product-ProvisioningVSaaS/page/EnrollZebraDeviceswithStageNowBarcodeAndroid.html"
  - "https://docs.omnissa.com/bundle/workspaceonelauncherV2306/page/AWLAUNCHERINTRO.html"
  - "https://docs.omnissa.com/bundle/SingleAppKioskVSaaS/page/UEMKiosksDigitalSignage.html"
  - "https://kb.omnissa.com/s/article/50107301"
  - "https://techdocs.zebra.com/ehs/2-4/guide/setup/"
  - "https://www.zebra.com/us/en/support-downloads/software/mobile-computer-software/enterprise-home-screen.html"
---

## Introduction

This guide shows Workspace ONE administrators and device management engineers how to configure Zebra Android devices for managed launcher and kiosk workflows using Workspace ONE Launcher and Zebra OEMConfig. It covers enrollment options (StageNow, QR/Android Enterprise), deploying Workspace ONE Launcher as the managed launcher, using OEMConfig to manage device-specific features (scanning, buttons, OS updates), Wi‑Fi and certificate prerequisites, and practical troubleshooting steps for common issues.

## What this article does not cover

This article uses only Zebra and Workspace ONE UEM–related guidance from the verified sources listed in References. It omits any unverified or unrelated topics.

## Audience

Workspace ONE administrators, device management engineers, and technicians responsible for deploying Zebra mobile computers on Android Enterprise.

## Prerequisites

- Workspace ONE UEM console at a version consistent with OEMConfig delivery requirements described by Zebra/Omnissa.
- Zebra mobile computers running Android 8.0+ for OEMConfig and OS upgrade support; MX 9.1+ requirements apply for certain OEMConfig OS‑upgrade capabilities.
- Access to managed Google Play to assign apps including Workspace ONE Launcher and required OEMConfig apps.
- StageNow tooling and access to generate StageNow barcodes/profiles if using StageNow‑based provisioning.
- Network/Wi‑Fi SSID credentials and any required client certificates for enterprise Wi‑Fi.

## Key concepts

**Workspace ONE Launcher:** a managed launcher/payload that can be pushed to devices to provide kiosk and home‑screen experiences and integrate with kiosk lock‑task flows.

**OEMConfig:** an EMM‑managed configuration mechanism where Zebra publishes vendor‑specific configuration schema that EMMs, including Workspace ONE UEM, deliver through managed apps from managed Google Play. OEMConfig enables device‑specific settings such as scanner behavior, function keys, and OS update control on Zebra devices.

**StageNow:** Zebra’s provisioning tool that can be used to pre‑stage devices or enroll devices into Workspace ONE UEM using barcodes or configuration packages.

## Enrollment options (StageNow, QR, Android Enterprise)

Choose the method that fits your operational model. The verified sources provide StageNow workflows and Android Enterprise enrollment guidance.

### StageNow barcode provisioning (recommended for out‑of‑box or kiosk devices)

1. Create a StageNow provisioning profile on the Zebra StageNow console or tool with Workspace ONE enrollment parameters. Include network and enrollment details per Zebra’s guidance and your Workspace ONE UEM settings.
2. Generate and print or display the StageNow barcode for scanning during device setup.
3. On the device, scan the StageNow barcode during the initial setup flow to apply the profile and enroll the device into Workspace ONE UEM. See the Zebra Support KB and the Omnissa StageNow enrollment documentation for exact parameters and prerequisites.

### QR or Android Enterprise (work‑managed) enrollment

1. Use Workspace ONE UEM Android Enterprise work‑managed enrollment for managed Google Play app assignments and OEMConfig delivery.
2. Create the Android Enterprise enrollment profile in Workspace ONE UEM and generate the QR or provisioning token according to your UEM console workflow.
3. Complete device provisioning using the Android Setup Wizard and the QR or token to bind the device to the organization’s Android Enterprise tenant.

## Deploying Workspace ONE Launcher as a managed launcher

Workspace ONE Launcher functions as a managed launcher to provide a home‑screen and kiosk experience when assigned as the device launcher.

### Install and assign Workspace ONE Launcher

1. Add Workspace ONE Launcher to managed Google Play and sync it to Workspace ONE UEM using your managed Google Play integration.
2. In Workspace ONE UEM, create an application assignment for Workspace ONE Launcher and target the relevant device groups.
3. Configure launcher payload settings and permitted apps or web resources per your kiosk or home‑screen design.
4. For kiosk or lock‑task scenarios, use Workspace ONE UEM kiosk settings (single‑app or multi‑app kiosk) to lock the device to Workspace ONE Launcher or to specified allowed apps.

### Verification

After assignment and device sync, confirm devices present Workspace ONE Launcher as the home screen and that kiosk lock‑task behavior applies according to your assignment.

## Using Zebra OEMConfig for device‑specific features

Zebra provides OEMConfig apps and schema that Workspace ONE UEM can push to deliver device‑specific settings such as barcode scanner behavior, button mapping, and OS update controls.

### OEMConfig delivery requirements

- To push OEMConfig via managed Google Play, ensure your Workspace ONE UEM console supports the managed Google Play delivery method described by Omnissa.
- For internal app uploads of OEMConfig packages, follow the Workspace ONE UEM console requirements documented in Omnissa’s OEMConfig guidance.

### Deploy and configure OEMConfig

1. From managed Google Play, approve and assign the Zebra OEMConfig application(s) that correspond to your device model and Android version.
2. Sync the app into Workspace ONE UEM and create assignment profiles to deliver the managed configuration.
3. Create an OEMConfig profile in Workspace ONE UEM targeting the Zebra OEMConfig app you imported.
4. Configure scanner rules, key mappings, power‑management settings, and other device features exposed by the OEMConfig schema appropriate for your Android level and device model. Consult the Zebra TechDocs OEMConfig schema pages for exact options and compatibility notes.
5. Save and assign the profile to the appropriate device groups.

### OS updates via OEMConfig

Zebra documents using OEMConfig to perform Android system updates on supported OEMConfig versions. Follow the procedure in the Zebra Support KB titled “Perform Android System Update Using OEMConfig 11.5.x.x in Workspace ONE UEM.” Ensure devices meet MX and OS‑level prerequisites noted by Zebra and Omnissa, for example MX 9.1+ where applicable.

## Wi‑Fi and certificate prerequisites

### Wi‑Fi

Provision reliable Wi‑Fi connectivity during enrollment. StageNow profiles should include SSID and authentication details so StageNow‑enrolled devices can reach Workspace ONE enrollment endpoints and managed Google Play.

### Certificates

If your Wi‑Fi or network requires client certificates (EAP‑TLS), ensure your Workspace ONE UEM deployment includes the necessary certificate profiles and that StageNow or Android Enterprise enrollment delivers them before attempting managed Google Play app installs or OEMConfig assignments.

### Managed Google Play reachability

Devices need access to managed Google Play to install Workspace ONE Launcher and Zebra OEMConfig apps; ensure network rules permit access.

## Verification and test checklist

- Enrollment: Device successfully enrolled via StageNow or Android Enterprise QR and appears in the Workspace ONE UEM console.
- Workspace ONE Launcher: App installed and set as launcher or allowed/required as kiosk per policy.
- OEMConfig: OEMConfig app installed; managed configurations applied. Verify scanner, button, or OS update settings are present.
- OS Update: If performing OEMConfig OS updates, verify device receipt of the update command and progression per Zebra KB instructions.
- Network: Device can reach managed Google Play and Workspace ONE endpoints; certificates applied as required.

## Troubleshooting common issues

### StageNow enrollment mismatch or failures

**Symptom:** Barcode scan completes but the device is not enrolled or binds to an incorrect tenant.

#### Checks:

1. Revalidate the StageNow profile contents and Workspace ONE enrollment server details.
2. Confirm the barcode/profile was generated for the same device model and Android version. Consult Zebra Support KB and Omnissa StageNow enrollment documentation for correct StageNow parameter usage.

### OEMConfig or OS update failures

**Symptom:** OEMConfig profile is sent but settings are not applied; OS update commands fail or do not start.

#### Checks:

1. Confirm the correct Zebra OEMConfig app/schema version was imported from managed Google Play and is compatible with the device’s Android version.
2. Verify the Workspace ONE UEM console version supports the OEMConfig delivery method in use, managed Google Play versus internal upload.
3. For OS updates via OEMConfig, validate the device meets MX requirements and OS prerequisites referenced in Omnissa and Zebra KBs. Check device logs if available per Zebra troubleshooting guidance.

### Kiosk exit or lock‑task issues

**Symptom:** Device exits kiosk mode or allows unwanted apps.

#### Checks:

1. Confirm the kiosk profile, single‑app or multi‑app, is assigned and enforced in Workspace ONE UEM.
2. Ensure Workspace ONE Launcher and any kiosk app are included in the allowed apps list and that the launcher is assigned as the managed launcher where needed.
3. If using EHS (Zebra Enterprise Home Screen) instead of Workspace ONE Launcher, ensure the chosen launcher and its settings are compatible with your kiosk policy.

## Best practices

- Test on a small set of devices before wide‑scale rollout: verify StageNow profiles, OEMConfig settings, and kiosk behavior on representative Zebra models.
- Keep managed Google Play and Workspace ONE UEM app approvals in sync to ensure OEMConfig and Workspace ONE Launcher are available for assignment.
- Observe Zebra OEMConfig schema compatibility with your device Android level.
- Document and version StageNow profiles and OEMConfig profiles so they can be audited and reproduced.
