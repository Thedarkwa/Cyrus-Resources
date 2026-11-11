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

- Academic stage names live in `src/lib/academics.ts` (`STAGES`, `YEARS_BY_STAGE`, `STAGE_BLURB`); never hardcode stage labels in routes or components, and rename `resources.stage` values in the database in the same change since that column stores the same strings.
