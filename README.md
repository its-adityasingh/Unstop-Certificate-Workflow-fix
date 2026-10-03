# Certificate Generator

> A flexible certificate-generation prototype for creating, customizing, and generating certificates at scale.

This project was developed as a proof-of-concept after identifying limitations in existing certificate-generation workflows. It focuses on giving organizers more control over certificate design, recipient management, bulk generation, and delivery.

---

## Overview

The Certificate Generator provides an end-to-end workflow for creating personalized certificates for events, hackathons, competitions, workshops, internships, volunteering programs, and other large-scale activities.

The prototype is designed around a simple four-step process:

```text
Choose / Create Template
          ↓
Customize Certificate
          ↓
Add Recipient Data
          ↓
Generate Certificates
          ↓
Send / Distribute
```

---

# Features

- **Bulk generation** — Generate hundreds or thousands of personalized certificates in one workflow.
- **Custom templates** — Select from platform templates or build your own certificate design.
- **Visual certificate editor** — Edit text, fonts, positioning, dimensions, and dynamic fields.
- **Drag & drop elements** — Upload organization logos and position elements directly on the certificate.
- **Dynamic fields** — Automatically populate recipient-specific information from imported data.
- **Recipient management** — Manage large recipient lists with search and status filters.
- **Generation tracking** — Track pending, generated, sent, and failed certificates.
- **Bulk delivery workflow** — Designed to support bulk email delivery through an external email provider.
- **Dashboard** — View campaigns and overall generation/delivery statistics.
- **Preview workflow** — Review the certificate design before generating the final certificates.

---

# Application Workflow

## 1. Template Selection

The workflow starts with a template gallery containing multiple certificate designs organized by categories such as:

- Hackathon
- Competition
- Participation
- Winner
- Internship
- Job / Career
- Workshop
- Seminar
- Volunteering
- Achievement
- Appreciation

Users can search templates or filter them by category before selecting a design.

![Template Selection](01-template-selection.png)

---

## 2. Certificate Editor

After selecting a template, users can customize the certificate using the visual editor.

### Editor capabilities

- Add dynamic text fields
- Edit field labels and content
- Position elements using coordinates
- Resize fields
- Change fonts and font sizes
- Upload organization logos
- Drag and position visual elements
- Preview certificates with sample recipient values
- Use dynamic placeholders such as `{{name}}`

The editor stores positions as normalized coordinates, allowing the same layout to be reproduced consistently during certificate generation.

![Certificate Editor](02-certificate-editor.png)

---

## 3. Recipient Management

Recipient data can be added in bulk and associated with the dynamic fields configured in the editor.

Example recipient information can include:

| Field | Example |
|---|---|
| Name | Participant 001 |
| Email | participant001@example.com |
| Team | Team 001 |
| Organization | Demo University |
| Certificate ID | BW-000001 |

The recipient management interface supports searching by name, email, team, or certificate ID and provides generation/delivery status for each recipient.

---

## 4. Generate & Send

Once recipients are added, the campaign moves to the **Generate & Send** stage.

The interface provides a campaign overview containing:

- Total recipients
- Generated certificates
- Sent certificates
- Failed generations/deliveries
- Recipient-level status
- Certificate preview

Users can generate all certificates from the campaign and subsequently initiate the sending workflow.

![Generate & Send](03-generate-send.png)

---

## 5. Bulk Certificate Generation

Certificate generation is handled as a bulk process with progress tracking.

The interface displays:

- Number of certificates generated
- Total certificates
- Remaining certificates
- Generation progress percentage
- Individual recipient generation status

This makes large certificate campaigns easier to monitor.

![Generation Progress](04-generation-progress.png)

---

## 6. Send Confirmation

Before distributing certificates, the application provides a confirmation step showing the number of recipients.

The current prototype explicitly identifies this as a **demo simulation**, meaning no real emails are sent from the prototype.

![Send Confirmation](05-send-confirmation.png)

---

# Certificate Dashboard

The dashboard provides a high-level overview of all certificate campaigns.

It displays statistics such as:

- Total campaigns
- Total recipients
- Certificates generated
- Certificates sent
- Draft campaigns

Each campaign also shows its current state, recipient count, generation count, and delivery count.

![Certificate Dashboard](06-certificate-dashboard.png)

### Campaign overview

The dashboard supports multiple campaigns and distinguishes between completed campaigns and drafts.

![Dashboard Overview](07-dashboard-overview.png)

---

# Example Campaign

The prototype demonstrates a **Brainwave 2026** certificate campaign using a custom mosaic-style certificate design.

Example campaign statistics shown in the prototype:

```text
Recipients: 1,000
Generated:  1,000
Sent:       1,000
Failed:     0
```

> These values represent prototype/demo data and do not indicate real certificate deliveries.

---

# Dynamic Fields

Dynamic fields allow the same certificate template to be reused for many recipients.

For example:

```text
{{name}}
{{team_name}}
{{university}}
{{organization}}
{{event_name}}
{{year}}
```

During generation, these placeholders are replaced with recipient-specific values.

Example:

```text
Template:
Certificate proudly presented to {{name}}

Recipient:
ADITYA SINGH

Generated:
Certificate proudly presented to ADITYA SINGH
```

This makes the workflow suitable for large events where hundreds or thousands of certificates need to be personalized.

---

# Email Integration

Email API integration is **not connected in the current prototype**.

The delivery layer is designed so that an email provider can be integrated later, for example:

- SMTP
- Resend
- SendGrid
- Amazon SES
- Another transactional email provider

The current **Send Certificates** flow is a simulated demonstration and does not send real emails.

---

# Tech Stack

- **React**
- **TypeScript**
- **TanStack Start / Router**
- **Tailwind CSS**
- **Vite**
- **Radix UI**
- **Zod**

---

# Getting Started

Clone the repository:

```bash
git clone https://github.com/<your-username>/<repository>.git
cd <repository>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application can then be opened using the local development URL shown by Vite/TanStack Start.

---

# Project Structure

A typical implementation can be organized around the following modules:

```text
src/
├── components/
│   ├── certificate-editor/
│   ├── template-gallery/
│   ├── recipient-management/
│   ├── generation/
│   └── dashboard/
│
├── routes/
│   ├── templates/
│   ├── editor/
│   ├── recipients/
│   └── campaigns/
│
├── lib/
│   ├── certificate/
│   ├── validation/
│   └── data/
│
└── app/
```

The exact structure may vary depending on the implementation.

---

# Future Scope

Potential extensions include:

- **Email API integration**
- **Certificate verification using QR codes**
- **Persistent database storage**
- **Authentication and access control**
- **Campaign analytics**
- **Delivery analytics**
- **Advanced template builder**
- **CSV/XLSX recipient import**
- **Certificate ID validation**
- **Custom branding**
- **Multi-event organization management**
- **Cloud storage for generated certificates**
- **Downloadable ZIP batches**
- **Automated email delivery and retry handling**

---

# Prototype Notice

This repository is a **demo / proof-of-concept**, not a production-ready certificate platform.

It is an independent implementation created to explore a more flexible certificate-generation workflow.

It is **not affiliated with or endorsed by Unstop** and is not intended to exploit, bypass, or interfere with any third-party system.

The screenshots and example campaign data shown in this README are for demonstration purposes.

---

# Contributing

Contributions, improvements, bug fixes, and integrations are welcome.

You can:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Open a pull request

---

# License

Add the project's applicable license here.

---

## Build once. Customize freely. Generate at scale.
