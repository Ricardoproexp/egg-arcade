<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the persistent interactive Arcade shell in the root layout and use leaf routes for URL navigation and unique page metadata; this preserves local session and modal state across navigation.
- Store all recreation data on this device through the versioned, guarded local store; no server services or real delivery are involved.
- Keep media mappings and recorder functionality in separate Arcade modules so feed rendering does not own media lifecycle logic.
