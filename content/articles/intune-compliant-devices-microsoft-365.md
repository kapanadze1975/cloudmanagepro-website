---
title: "How to Require Intune‑Compliant Devices for Microsoft 365"
seo_title: "Require Intune‑Compliant Devices for Microsoft 365 | CloudManagePro"
slug: "intune-compliant-devices-microsoft-365"
description: "CloudManagePro technical guide for requiring Intune-compliant devices when accessing Microsoft 365 with Microsoft Entra Conditional Access."
canonical: "https://www.cloudmanagepro.com/articles/intune-compliant-devices-microsoft-365/"
category: "Microsoft Intune"
platform: "Cross-platform"
level: "Intermediate"
author: "CloudManagePro"
verified_date: "2026-09-24"

hero:
  kicker: "Microsoft Intune · Microsoft Entra · Microsoft 365"
  dek: "A practical CloudManagePro guide for understanding how Intune device compliance and Microsoft Entra Conditional Access can work together to protect access to Microsoft 365."
  screen_label: "Microsoft 365"
  cloud_label: "Microsoft Entra"

tags:
  - "intune"
  - "microsoft-entra"
  - "microsoft-365"
  - "conditional-access"
  - "device-compliance"

references:
  - label: "Intune device compliance and Conditional Access integration"
    url: "https://learn.microsoft.com/en-us/intune/device-security/conditional-access-integration/overview"
  - label: "Conditional Access grant controls (Require device to be marked as compliant)"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant"
  - label: "Conditional Access policy examples using device compliance"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-all-users-device-compliance"
  - label: "Intune device compliance overview"
    url: "https://learn.microsoft.com/en-us/intune/device-security/compliance/overview"
  - label: "Create Intune compliance policies"
    url: "https://learn.microsoft.com/en-us/intune/device-security/compliance/create-policy"
  - label: "Conditional Access report-only mode"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only"
  - label: "Conditional Access What If tool"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/what-if-tool"
  - label: "Policy guidance for blocking legacy authentication"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication"
  - label: "Resilience with device states"
    url: "https://learn.microsoft.com/en-us/entra/architecture/resilience-with-device-states"
  - label: "Intune whats new"
    url: "https://learn.microsoft.com/en-us/intune/whats-new/"

faq:
  - question: "What is a compliant device in Microsoft Intune?"
    answer: "A compliant device is a device that meets the compliance checks you define in an Intune compliance policy (for example, minimum OS version, device encryption, passcode). Intune evaluates enrolled devices against these checks and reports a compliant or noncompliant state that Conditional Access can use. Reference: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview"
  - question: "How does Conditional Access use Intune device compliance for Microsoft 365 access?"
    answer: "Conditional Access consumes the compliance state from Intune as a grant control. You create a Conditional Access policy in Microsoft Entra that targets users and Microsoft 365 cloud apps and set the grant control to “Require device to be marked as compliant.” When a user signs in, Entra evaluates the compliance signal and allows or blocks access according to the policy. Reference: https://learn.microsoft.com/en-us/intune/device-security/conditional-access-integration/overview and https://learn.microsoft.com/en-us/entra/identity/conditional-access/"
  - question: "Can non-managed devices access Microsoft 365 if a compliant device policy is enforced?"
    answer: "If your Conditional Access policy requires a device to be marked as compliant, non-managed or unenrolled devices will not present a compliance state and will be blocked (or blocked until remediated) by that control. Ensure pilot/testing and consider access alternatives (e.g., Browser only, limited guest access) only where appropriate."
  - question: "How do I test that my Conditional Access policy is working for Intune compliant devices?"
    answer: "Test with both a device that meets compliance and one that fails. Use Microsoft Entra sign-in logs to view Conditional Access evaluation details, and set the policy to Report-only initially. Ensure devices are properly enrolled and have recent Intune check-ins."
  - question: "What common causes make a compliant device appear noncompliant?"
    answer: "Common causes include failed device check-ins, misconfigured policy settings, unsupported OS versions, missing required security features, or temporary state changes during updates. Check Intune device compliance details and force a sync on the device."
---

# How to Require Intune‑Compliant Devices for Microsoft 365

This article explains how Microsoft Intune device compliance works with Conditional Access to protect Microsoft 365 resources. It provides an overview of compliance signals, step‑by‑step configuration for a compliance policy in Intune, and a Conditional Access policy that requires devices to be compliant before accessing Microsoft 365. Practical troubleshooting and an FAQ follow.

## Overview — What “device compliance” means in Intune

Device compliance in Microsoft Intune is the set of device health, configuration, and state checks you define so that only devices that meet your organization’s requirements are considered “compliant.” Compliance checks can include OS version, encryption (BitLocker/FileVault), presence of required security features, passcode requirements, and more. Intune evaluates devices against compliance policies and reports a compliant/non‑compliant signal that other Azure AD/Entra Conditional Access policies can use to allow, block, or restrict access to Microsoft 365 and other resources.

Authoritative guidance: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview

## How Conditional Access uses compliance signals

Conditional Access in Microsoft Entra (Azure AD) consumes device compliance signals from Intune as one of many signals (user, location, application, sign-in risk). When you build a Conditional Access policy, you can require a “compliant device” as the grant control. If a user attempts to access a Microsoft 365 service (Exchange Online, SharePoint, Teams, etc.) from a device that Intune has marked non‑compliant, the Conditional Access policy can block access or require a compliant device before allowing access.

Authoritative guidance: https://learn.microsoft.com/en-us/intune/device-security/conditional-access-integration/overview
Additional conditional access details: https://learn.microsoft.com/en-us/entra/identity/conditional-access/

## Requirements and prerequisites (summary)

- Intune subscription and devices enrolled in Intune.
- Devices must be managed and reporting to Intune so compliance state is available to Entra ID.
- Appropriate administrator roles (Intune admin and Conditional Access / Security admin) to create policies.
- Ensure device platforms you intend to protect are supported by Intune compliance policies and Conditional Access.

See Intune compliance overview: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview

## Step-by-step — Create an Intune device compliance policy

The following example creates a basic compliance policy for Windows and iOS/Android that checks minimum OS and requires device encryption. Adjust settings to match your organization’s security posture.

### Step 1 — Open Intune compliance policy designer

- Microsoft Intune admin center
→ Devices
→ Compliance policies
→ Policies
→ Create policy.

(Reference: https://learn.microsoft.com/en-us/intune/device-security/compliance/create-policy)

### Step 2 — Choose platform and baseline settings

- Platform: select Windows 10 and later (or iOS/iPadOS or Android).
- Name: enter a descriptive name (example: “Corporate baseline — compliant devices”).
- Device restrictions: configure required settings:
  - Minimum OS version (e.g., Windows 10 1909 or later) — set according to your support matrix.
  - Require device encryption (BitLocker/FileVault).
  - Require a password/PIN with complexity rules.
  - Require latest security patch level where applicable.

### Step 3 — Configure compliance actions

- Configure actions for noncompliance (e.g., Mark device noncompliant immediately, send notification email after X days).
- Save and create the policy.

### Step 4 — Assign the policy

- Assign the policy to device groups (Azure AD groups) that include your managed devices.
- Monitor deployment and device status from Devices > Monitor > Device compliance.

(Ensure you review the full create-policy guidance: https://learn.microsoft.com/en-us/intune/device-security/compliance/create-policy)

## Step-by-step — Conditional Access policy requiring compliant devices for Microsoft 365

This example enforces that only compliant devices can access Microsoft 365 services.

### Step 1 — Open Conditional Access in Microsoft Entra

- Microsoft Entra admin center
→ Security
→ Conditional Access
→ Policies
→ New policy.

(Reference: https://learn.microsoft.com/en-us/entra/identity/conditional-access/)

### Step 2 — Assign users and groups

- Users and groups: select the users or groups the policy will apply to (for example, All users or a specific production group). Avoid applying to emergency break‑glass accounts.

### Step 3 — Select cloud apps or actions

- Cloud apps or actions: choose Microsoft 365 apps (e.g., Office 365 Exchange Online, SharePoint Online, Microsoft Teams) or select “All cloud apps” if you want a broader enforcement.

### Step 4 — Configure conditions (optional)

- You may refine by platform, locations (trusted IPs), or sign-in risk.

### Step 5 — Grant controls — require device to be compliant

- Under Access controls → Grant, choose “Require device to be marked as compliant.”
- Select “Grant access” with this control (or add supplementary controls like require MFA if desired).
- Do not set the policy to “Block” unless intentionally blocking all access except compliant devices.

### Step 6 — Enable policy safely

- Set Enable policy to “Report-only” first or test with a limited pilot group. When ready, set policy to “On.”

Guidance on device-based policies and integration: https://learn.microsoft.com/en-us/intune/device-security/conditional-access-integration/device-based-policies

## Verification and testing

- From a test device that meets the compliance policy, sign in to a targeted Microsoft 365 app — access should be allowed.
- From a non‑compliant device (e.g., disable encryption or use unsupported OS), sign in — Conditional Access should block or require remediation.
- Use Sign-in logs in Microsoft Entra → Monitoring → Sign-ins to review conditional access evaluation results and the reason for allow/deny.

(See Conditional Access troubleshooting and logs: https://learn.microsoft.com/en-us/entra/identity/conditional-access/)

## Troubleshooting common issues

1. Device shows “Not compliant” even though settings match policy
- Confirm device sync with Intune (Force sync from the Company Portal or Settings app).
- Check device check-in time and Intune MDM connectivity.
- Review device compliance details in the Intune admin center to see which setting failed.

2. Conditional Access still allows access for non‑compliant device
- Ensure Conditional Access policy is targeted at the user/device group.
- Confirm the Conditional Access grant control is set to “Require device to be marked as compliant.”
- Verify that the device is actually enrolled and reporting to Intune and that the compliance state is visible in Entra sign‑in logs.

3. Legacy authentication bypasses Conditional Access
- Legacy authentication (basic auth) does not support modern Conditional Access controls. Block legacy authentication using Conditional Access or tenant settings. Guidance: https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication

4. Users complain about frequent noncompliant states after updates
- Examine whether OS updates temporarily reset compliance checks (review supported OS versions and timing). See resilience with device states: https://learn.microsoft.com/en-us/entra/architecture/resilience-with-device-states

## Best practices

- Pilot policies in report-only mode or with a small user group before a full rollout.
- Exclude emergency break‑glass accounts from Conditional Access policies.
- Combine “Require compliant device” with MFA for higher assurance.
- Monitor Intune’s What’s new and product notices: https://learn.microsoft.com/en-us/intune/whats-new/

## FAQ (full Q&A)

Q1: What is a compliant device in Microsoft Intune?
A1: A compliant device is a device that meets the compliance checks you define in an Intune compliance policy (for example, minimum OS version, device encryption, passcode). Intune evaluates enrolled devices against these checks and reports a compliant or noncompliant state that Conditional Access can use. Reference: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview

Q2: How does Conditional Access use Intune device compliance for Microsoft 365 access?
A2: Conditional Access consumes the compliance state from Intune as a grant control. You create a Conditional Access policy in Microsoft Entra that targets users and Microsoft 365 cloud apps and set the grant control to “Require device to be marked as compliant.” When a user signs in, Entra evaluates the compliance signal and allows or blocks access according to the policy. Reference: https://learn.microsoft.com/en-us/intune/device-security/conditional-access-integration/overview and https://learn.microsoft.com/en-us/entra/identity/conditional-access/

Q3: Can non‑managed devices access Microsoft 365 if a compliant device policy is enforced?
A3: If your Conditional Access policy requires a device to be marked as compliant, non‑managed or unenrolled devices will not present a compliance state and will be blocked (or blocked until remediated) by that control. Ensure pilot/testing and consider access alternatives (e.g., Browser only, limited guest access) only where appropriate.

Q4: How do I test that my Conditional Access policy is working for Intune compliant devices?
A4: Test with both a device that meets compliance and one that fails. Use Microsoft Entra sign‑in logs to view Conditional Access evaluation details, and set the policy to Report‑only initially. Ensure devices are properly enrolled and have recent Intune check‑ins.

Q5: What common causes make a compliant device appear noncompliant?
A5: Common causes include failed device check‑ins, misconfigured policy settings, unsupported OS versions, missing required security features, or temporary state changes during updates. Check Intune device compliance details and force a sync on the device.
