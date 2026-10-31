import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
 validateSearch: (search:Record<string,unknown>):{create?:'direct'|'group'}=>search['create']==='direct'||search['create']==='group'?{create:search['create']}:{},
 head: () => ({meta: [
 { title: "Chat · Egg Arcade" },
 { name: "description", content: "Egg Arcade — o teu espaço para jogos, conversas e comunidade." },
 { property: "og:title", content: "Chat · Egg Arcade" },
 { property: "og:description", content: "Egg Arcade — o teu espaço para jogos, conversas e comunidade." },
 { property: "og:type", content: "website" },
 { name: "twitter:card", content: "summary_large_image" },
 ]}),
 component: () => null,
});
