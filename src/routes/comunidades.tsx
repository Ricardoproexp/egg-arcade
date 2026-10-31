import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/comunidades")({
 head: () => ({meta: [
 { title: "Comunidades · Egg Arcade" },
 { name: "description", content: "Egg Arcade — o teu espaço para jogos, conversas e comunidade." },
 { property: "og:title", content: "Comunidades · Egg Arcade" },
 { property: "og:description", content: "Egg Arcade — o teu espaço para jogos, conversas e comunidade." },
 { property: "og:type", content: "website" },
 { name: "twitter:card", content: "summary_large_image" },
 ]}),
 component: () => null,
});
