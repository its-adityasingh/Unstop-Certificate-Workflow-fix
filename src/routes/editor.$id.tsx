import { createFileRoute } from "@tanstack/react-router";
import { CertificateEditor } from "@/components/certificate/Editor";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({
    meta: [
      { title: "Visual Certificate Editor — CertFlow" },
      {
        name: "description",
        content:
          "Drag, resize, rotate and style dynamic certificate fields on your design. Editor positions match generated output exactly.",
      },
      { property: "og:title", content: "Visual Certificate Editor — CertFlow" },
      {
        property: "og:description",
        content: "Place name, team, organization and date fields visually — no keyboard alignment tricks.",
      },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  return <CertificateEditor id={id} />;
}
