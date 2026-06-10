# CloudManagePro Static Web App

This is a simple no-framework static website for CloudManagePro.

## Files

- `index.html` - website content
- `styles.css` - responsive modern design
- `script.js` - mobile menu and dynamic year
- `assets/` - SVG logo and custom illustrations
- `staticwebapp.config.json` - Static Web Apps routing/security headers
- `.github/workflows/azure-static-web-apps.yml` - optional template workflow

## Azure Static Web Apps settings

When creating the Static Web App in Azure Portal:

- Plan type: **Free**
- Source: **GitHub**
- Build preset: **Custom**
- App location: `/`
- Api location: leave blank
- Output location: leave blank

## Custom domain

Recommended setup:

1. Add `www.cloudmanagepro.com` in Azure Static Web Apps > Custom domains.
2. Azure gives you DNS records.
3. In your DNS provider, create the required TXT validation record.
4. Create a CNAME:
   - Name/Host: `www`
   - Value/Target: your Azure Static Web Apps default hostname, for example `blue-water-12345.azurestaticapps.net`
5. Wait for DNS validation and Azure SSL certificate creation.
6. Optional: redirect root domain `cloudmanagepro.com` to `www.cloudmanagepro.com` using your registrar/DNS provider forwarding feature, or configure an apex domain in Azure.

## Editing content

Open `index.html` and update text, services, phone number, email, or sections as needed.
