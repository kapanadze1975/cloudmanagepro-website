---
title: "How to Require Intune-Compliant Devices for Microsoft 365"
seo_title: "Require Intune-Compliant Devices for Microsoft 365 | CloudManagePro"
slug: "intune-compliant-devices-microsoft-365"
description: "CloudManagePro technical guide for requiring Intune-compliant devices when accessing Microsoft 365 with Microsoft Entra Conditional Access."
canonical: "https://www.cloudmanagepro.com/articles/intune-compliant-devices-microsoft-365/"
category: "Microsoft Intune"
platform: "Cross-platform"
level: "Intermediate"
author: "CloudManagePro"
verified_date: "2026-09-01"

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
  - label: "Intune licensing"
    url: "https://learn.microsoft.com/en-us/intune/fundamentals/licensing"
  - label: "Assign Intune licenses"
    url: "https://learn.microsoft.com/en-us/intune/fundamentals/assign-licenses"
  - label: "Microsoft Entra licensing"
    url: "https://learn.microsoft.com/en-us/entra/fundamentals/licensing"
  - label: "Intune device compliance overview"
    url: "https://learn.microsoft.com/en-us/intune/device-security/compliance/overview"
  - label: "Create Intune compliance policies"
    url: "https://learn.microsoft.com/en-us/intune/device-security/compliance/create-policy"
  - label: "Intune built-in RBAC roles"
    url: "https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/ref-built-in-roles"
  - label: "Intune governance and administration"
    url: "https://learn.microsoft.com/en-us/intune/govern-administer"
  - label: "Conditional Access overview and role guidance"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/"
  - label: "Conditional Access managed policies"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/managed-policies"
  - label: "Conditional Access report-only mode"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only"
  - label: "Conditional Access What If tool"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/what-if-tool"
  - label: "Policy guidance for blocking legacy authentication"
    url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication"
  - label: "Monitoring legacy authentication workbook"
    url: "https://learn.microsoft.com/en-us/entra/identity/monitoring-health/workbook-legacy-authentication"
---

## Overview

This article explains how to require devices managed by Microsoft Intune to be evaluated as compliant before granting access to Microsoft 365 resources using Microsoft Entra Conditional Access. It covers what the configuration accomplishes, prerequisites and licensing, guidance for administrator roles, testing options (report-only and What If), rollout recommendations, legacy authentication considerations, troubleshooting, and best practices. All technical claims below are limited to the verified facts provided.

### What this configuration accomplishes

When you require Intune-compliant devices for Microsoft 365 access, Microsoft Entra Conditional Access evaluates the device compliance state reported by Microsoft Intune and enforces a grant control that requires the device to be marked as compliant before access is allowed. This integrates device compliance telemetry with access control to conditionally allow or block user sign-ins to Microsoft 365 services.

## Prerequisites

- Devices must be enrolled in Microsoft Intune and subject to Intune device compliance policies so they can be evaluated as compliant or noncompliant. See Microsoft Intune device compliance documentation for details: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview.
- Conditional Access policies that use device compliance rely on Microsoft Entra Conditional Access. Ensure Conditional Access is available under your Microsoft Entra licensing. See licensing details: https://learn.microsoft.com/en-us/entra/fundamentals/licensing.
- Users who receive Intune policies must have the required Intune licensing assigned. See Intune licensing guidance: https://learn.microsoft.com/en-us/intune/fundamentals/licensing and https://learn.microsoft.com/en-us/intune/fundamentals/assign-licenses.
- Administrators who create and manage Intune compliance policies must have the appropriate Intune RBAC roles. Intune uses role-based access control to govern who can create and manage policies: https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/ref-built-in-roles and https://learn.microsoft.com/en-us/intune/govern-administer.

## Licensing

Verify two licensing aspects before enforcing device compliance:

- Users who receive Intune policies must be licensed for Intune. See: https://learn.microsoft.com/en-us/intune/fundamentals/licensing.
- Conditional Access availability and features depend on Microsoft Entra licensing for your tenant. See: https://learn.microsoft.com/en-us/entra/fundamentals/licensing.

## Administrator role guidance

Use least-privilege principles when assigning administrative roles:

- Intune RBAC controls who can create and manage Intune device compliance policies. Review Intune built-in roles and governance guidance: https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/ref-built-in-roles and https://learn.microsoft.com/en-us/intune/govern-administer.
- For Conditional Access policy management, Microsoft documents the Conditional Access Administrator role as the least-privileged built-in role for managing Conditional Access policies. See Microsoft guidance: https://learn.microsoft.com/en-us/entra/identity/conditional-access/ and https://learn.microsoft.com/en-us/entra/identity/conditional-access/managed-policies.
- The exact minimum custom Intune RBAC permission mapping is UNVERIFIED; do not assume or create custom permission mappings without verification.

## Configure Intune device compliance

Intune device compliance policies evaluate enrolled devices and report each device as compliant or noncompliant. Create and assign compliance policies appropriate for your environment so Intune can determine device compliance state. For an overview and instructions on creating compliance policies, see: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview and https://learn.microsoft.com/en-us/intune/device-security/compliance/create-policy.

## Configure Microsoft Entra Conditional Access

Microsoft Entra Conditional Access can use Intune device compliance state as a signal for access decisions. Conditional Access includes a grant control named "Require device to be marked as compliant," which enforces that a device must be evaluated as compliant by Intune before access is granted. See Conditional Access grant controls and policy examples: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant and https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-all-users-device-compliance.

## Require device to be marked as compliant

The Conditional Access grant control "Require device to be marked as compliant" relies on the device compliance state sent by Intune. When you include this grant control in a Conditional Access policy, sign-in requests that match the policy require that the device is marked compliant by Intune before access is permitted. Refer to Microsoft documentation for the grant control and policy guidance: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant.

## Report-only testing

Before enforcement, consider using Conditional Access Report-only mode to understand the impact of a policy without affecting user sign-ins. Conditional Access supports a report-only mode so you can evaluate what would happen if a policy were enforced. See: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only.

## What If testing

Microsoft provides a Conditional Access What If tool to simulate policy evaluation for a given user, application, and conditions so you can predict policy outcomes. Use the What If tool to validate that a policy will behave as expected before enabling enforcement: https://learn.microsoft.com/en-us/entra/identity/conditional-access/what-if-tool.

## Rollout recommendations

- Start with report-only analysis and What If tool validation to identify potential impact on users and applications.
- Gradually scope enforcement (for example, pilot groups) to reduce risk before broad rollout.
- Ensure Intune compliance policies are in place and that devices in pilot groups are enrolled and receiving compliance evaluations.

## Legacy authentication considerations

Microsoft recommends identifying and blocking legacy authentication because it bypasses modern authentication methods and Conditional Access protections. Review Microsoft guidance on blocking legacy authentication and monitoring legacy auth activity as part of your deployment planning: https://learn.microsoft.com/en-us/entra/identity/conditional-access/policy-block-legacy-authentication and https://learn.microsoft.com/en-us/entra/identity/monitoring-health/workbook-legacy-authentication.

## Troubleshooting

- Confirm devices are enrolled in Intune and receiving compliance policy evaluation. Refer to Intune compliance policy documentation: https://learn.microsoft.com/en-us/intune/device-security/compliance/overview.
- Verify applicable users are assigned the required Intune licenses. See Intune licensing: https://learn.microsoft.com/en-us/intune/fundamentals/licensing.
- Confirm Conditional Access is available and licensed for your tenant. See Microsoft Entra licensing: https://learn.microsoft.com/en-us/entra/fundamentals/licensing.
- Use Conditional Access report-only mode and the What If tool to analyze policy effects and diagnose unexpected behavior: https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-report-only and https://learn.microsoft.com/en-us/entra/identity/conditional-access/what-if-tool.

---
