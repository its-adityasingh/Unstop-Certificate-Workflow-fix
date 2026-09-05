# Certificate Generator

> A flexible certificate generation prototype for creating, customizing, and generating certificates at scale.

This project was developed as a proof-of-concept after identifying limitations in existing certificate-generation workflows. It focuses on giving organizers more control over certificate design and bulk generation.

## Features

- **Bulk generation** — Generate multiple personalized certificates in one workflow.
- **Custom templates** — Use multiple templates or create your own.
- **Visual editor** — Edit text, fonts, positioning, and other certificate elements.
- **Drag & drop** — Upload and position logos and other elements freely.
- **Dynamic fields** — Automatically populate recipient details from data.
- **Recipient management** — Support bulk recipient data for large events.
- **Extensible delivery** — Designed to support bulk email delivery.


## Workflow

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

## Email Integration

Email API integration is **not connected in the current prototype**. Developers can integrate an email provider such as SMTP, Resend, SendGrid, SES, or another service as required.

## Tech Stack

- React
- TypeScript
- TanStack Start / Router
- Tailwind CSS
- Vite
- Radix UI
- Zod

## Getting Started

```bash
git clone https://github.com/<your-username>/<repository>.git
cd <repository>
npm install
npm run dev
```

## Prototype Notice

This repository is a **demo / proof-of-concept**, not a production-ready certificate platform.

It is an independent implementation created to explore a more flexible certificate-generation workflow. It is **not affiliated with or endorsed by Unstop** and is not intended to exploit, bypass, or interfere with any third-party system.

## Future Scope

- Email API integration
- Certificate verification with QR codes
- Persistent database
- Authentication and access control
- Generation and delivery analytics
- Advanced template builder

## Contributing

Contributions, improvements, and integrations are welcome. Feel free to open an issue or submit a pull request.

---

**Build once. Customize freely. Generate at scale.**
