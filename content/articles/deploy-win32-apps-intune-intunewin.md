---
title: "How to Package and Deploy Win32 Apps with Microsoft Intune (.intunewin)"
seo_title: "Deploy Win32 Apps with Microsoft Intune (.intunewin) — Packaging, Detection, Delivery"
slug: "deploy-win32-apps-intune-intunewin"
description: "Step-by-step guide to package Win32 apps as .intunewin, create detection rules, define dependencies and supersedence, optimize Delivery Optimization, and troubleshoot Intune deployments."
canonical: "https://www.cloudmanagepro.com/articles/deploy-win32-apps-intune-intunewin/"
category: "Microsoft Intune"
platform: "Windows"
level: "Intermediate"
author: "CloudManagePro"
verified_date: "2026-09-05"

hero:
  kicker: "Microsoft Intune · Win32 Apps"
  dek: "A practical guide for packaging Win32 applications into the .intunewin format, creating reliable detection rules, declaring dependencies and supersedence, optimizing Delivery Optimization for distribution, and troubleshooting common Intune deployment failures."
  screen_label: "Intune"
  cloud_label: "Intune"

tags:
  - "intune"
  - "windows"
  - "win32-apps"
  - "intunewin"
  - "app-deployment"

references:
  - "https://learn.microsoft.com/en-us/intune/app-management/deployment/create-win32-package"
  - "https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool"
  - "https://learn.microsoft.com/en-us/intune/app-management/deployment/add-win32"
  - "https://learn.microsoft.com/en-us/intune/app-management/deployment/win32"
  - "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/troubleshoot-win32-app-install"
  - "https://learn.microsoft.com/en-us/intune/device-configuration/templates/configure-delivery-optimization-windows"
  - "https://learn.microsoft.com/en-us/intune/device-management/tools/management-extension-windows"
  - "https://learn.microsoft.com/en-us/intune/app-management/deployment/add-win32#step-6-supersedence"
  - "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/app-install-error-codes"
  - "https://learn.microsoft.com/en-us/graph/api/resources/intune-apps-win32lobappreturncode?view=graph-rest-1.0"
---

## Introduction

This article shows how to package Win32 applications into the .intunewin format, upload them to Microsoft Intune, create detection rules, configure dependencies and supersedence, optimize Delivery Optimization for distribution, and troubleshoot common installation issues. It assumes basic familiarity with Intune and Windows administration.

## What the .intunewin format is

.intunewin is a packaging format created to deliver Win32 applications through Microsoft Intune. The Microsoft Win32 Content Prep Tool wraps application files and metadata into a single .intunewin file that Intune can upload, distribute, and manage.

## Why an administrator would use it

- To deploy classic Win32 applications (MSI, EXE, scripts, or multi-file installers) to managed Windows devices.
- To use Intune detection rules, dependencies, and supersedence features for controlled rollouts and app lifecycle management.
- To take advantage of Intune’s distribution, monitoring, and reporting for legacy and third-party apps.

## Requirements and prerequisites

- Microsoft Intune tenant with permissions to add and assign apps.
- A Windows machine to run the Win32 Content Prep Tool and create .intunewin packages.
- The app installation files and any required scripts.
- Appropriate administrator roles in Entra ID/Intune for app creation and assignment (e.g., Intune Administrator or Application Manager).

## Package size limit

Microsoft Learn currently states that Windows application size is capped at 30 GB per app. Plan packaging and file composition accordingly.

## Tools and downloads (verified)

- Microsoft Win32 Content Prep Tool (packaging tool).
- Intune admin center for app upload and configuration.
- Optionally: PowerShell or Win32 app installer scripts used during packaging.

## Step-by-step packaging with the Microsoft Win32 Content Prep Tool

### Step 1 — Prepare your source files

1. Create a folder on your packaging machine and copy all required installer files, scripts, and support files into it.
2. Ensure your main installer and any silent/quiet install switches are tested locally.

### Step 2 — Download the Win32 Content Prep Tool

1. Download the tool from the official Microsoft GitHub repository.
2. Extract the tool to a working folder.

### Step 3 — Create the .intunewin file

1. Open an elevated PowerShell or Command Prompt in the folder containing the Content Prep Tool.
2. Run the tool and follow prompts. Example usage:
   - Provide the source folder path (the folder you prepared).
   - Specify the setup file name (the main installer or script).
   - Set the output folder path (where the .intunewin will be created).
3. The tool packages files, generates encryption metadata, and creates the .intunewin output.

### What the creation step does

- Gathers all files.
- Compresses and encrypts them.
- Produces a single .intunewin file ready to upload to Intune.

## Uploading and configuring the app in Intune

### Step 4 — Add the Win32 app in the Intune admin center

1. Sign in to the Microsoft Intune admin center.
2. Navigate: Apps → All apps → Add.
3. Select App type: Windows app (Win32) and upload the .intunewin file.
4. Complete the required fields: Name, Description, Publisher. Program commands: Enter install and uninstall commands (include silent switches).
5. Detection rules: Create rules that determine whether the app is already installed. Detection methods include MSI product code, file or folder existence, or registry key/value.

### Step 5 — Configure dependencies, requirements, and return codes

- Dependencies: Add other apps that must be installed before this app (for example, a runtime or framework).
- Requirements: Define OS architecture, minimum OS version, or other device conditions.
- Return codes: Map installer exit codes to success/failure or to retry behavior. Include any vendor-specific return codes your installer uses.

### Step 6 — Supersedence (supersedence)

To replace older versions, configure supersedence settings to specify which existing apps should be superseded. Define the rules so Intune can uninstall older versions and install the new app in a managed fashion.

## Testing and assignment

### Step 7 — Assign the app to groups

1. Assign the app to device groups or user groups as Required, Available for enrolled devices, or Uninstall as needed.
2. For testing, assign to a limited pilot group first.

### Step 8 — Monitor installation and verification

- Use the Intune admin center monitoring pages to view install status, errors, and device reports.
- On target devices, verify installation by checking the detection criteria (file, registry, or MSI presence).

## Delivery Optimization considerations

- Use Delivery Optimization to reduce bandwidth consumption when distributing large Win32 apps across your network.
- Configure Delivery Optimization policies via Intune device configuration templates and assign them to device groups to control peer caching, bandwidth settings, and group IDs for content sharing.

## Troubleshooting Win32 app deployments

### Common checks

1. Detection rule mismatch: Confirm rules match post-install state (correct file path, registry key, or MSI product code).
2. Install command errors: Test the install command locally and ensure silent switches work.
3. Dependency failures: Verify dependencies installed successfully before the main app.
4. Return code handling: Ensure return codes from the installer are correctly mapped in the app configuration.

### Where to look for detailed troubleshooting

- Intune app monitoring in the admin center provides status and error codes.
- Device-side logs from the Intune Management Extension help identify client-side problems.
- Consult Microsoft troubleshooting documentation that lists common installation error codes and diagnostics: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-management/troubleshoot-win32-app-install

## Best practices

- Keep packaging environments consistent and use documented build steps to reproduce packages.
- Use precise detection rules to avoid false reinstallations.
- Test install and uninstall commands on a clean test VM matching target devices.
- Use Delivery Optimization for large apps and peer caching to reduce WAN usage.
- Use pilot groups for staged rollouts and validate supersedence/uninstall behavior before broad deployment.

## Practical example

App: ExampleAppInstaller.exe with silent switch /quiet

Content Prep Tool inputs:

- Source folder: C:\Package\ExampleApp\
- Setup file: ExampleAppInstaller.exe
- Output folder: C:\Package\Output\

Intune program commands:

- Install command: ExampleAppInstaller.exe /quiet
- Uninstall command: msiexec /x {PRODUCT-CODE} /quiet (if MSI) or script that removes app

Detection rule: Registry exists HKLM\\SOFTWARE\\ExampleCompany\\ExampleApp\\Version with value >= 4.0

Dependencies: Microsoft Visual C++ Redistributable (configured as dependency)

Supersedence: Configure to supersede ExampleApp v3.x applications

## Verification / testing checklist

- Package created successfully and uploaded to Intune.
- Install/uninstall commands tested on a clean VM.
- Detection rules correctly identify installed app.
- Dependencies install first and succeed.
- Supersedence correctly removes older app versions.
- Delivery Optimization policy applied and content distributed as expected.

## Important limitations and warnings

- The verified maximum application size per app is 30 GB. Plan packaging strategy when distributing very large installers.
- Ensure detection rules are accurate; an incorrect rule can cause unnecessary reinstalls or failure to report success.
- Avoid packaging sensitive secrets or certificates in plaintext inside the .intunewin file.

## Summary

Packaging Win32 applications as .intunewin files and deploying them with Intune lets administrators manage legacy applications alongside modern management workflows. Using validated detection rules, dependencies, supersedence, and Delivery Optimization improves reliability and reduces bandwidth impact. Always test thoroughly in a controlled pilot before broader rollouts.
