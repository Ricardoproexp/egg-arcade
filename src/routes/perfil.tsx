import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/perfil")({
 validateSearch: (search: Record<string, unknown>): {user?: string | undefined} => ({user: typeof search['user'] === 'string' ? search['user'].slice(0,100) : undefined}),
 head: () => ({meta: [
 { title: "O meu perfil · Egg Arcade" },
 { name: "description", content: "O teu perfil gaming, publicações guardadas e comunidades." },
 { property: "og:title", content: "O meu perfil · Egg Arcade" },
 { property: "og:description", content: "O teu perfil gaming, publicações guardadas e comunidades." },
 { property: "og:type", content: "website" },
 { name: "twitter:card", content: "summary_large_image" },
 ]}),
 component: () => null,
});
