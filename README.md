# Mohamed Ragab Creative Studio

Arabic RTL agency site built with Next.js App Router, TypeScript, and Supabase. It uses the supplied IBM Plex Arabic files and light/dark textured backgrounds. The portfolio imagery is art-directed CSS placeholder artwork; replace it with approved project imagery in Supabase Storage.

## Run locally

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `WEB3FORMS_ACCESS_KEY`. Add social account URLs to `NEXT_PUBLIC_SOCIAL_FACEBOOK`, `NEXT_PUBLIC_SOCIAL_INSTAGRAM`, `NEXT_PUBLIC_SOCIAL_WHATSAPP`, `NEXT_PUBLIC_SOCIAL_LINKEDIN`, and `NEXT_PUBLIC_SOCIAL_X` when ready.
2. Run `npm install`, then `npm run dev`.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Create the admin account in Supabase Auth, then set its server-controlled `app_metadata` to `{ "role": "admin" }` in a trusted admin workflow. Never use editable `user_metadata` for authorization.
5. Open `/admin` and log in using the admin user's email and password.

Without Supabase environment variables, public pages use placeholder data. The admin dashboard and stored portfolio content require Supabase configuration. Contact form submissions are delivered through Web3Forms; replace the `#` placeholder in `WEB3FORMS_ACCESS_KEY` with the access key from your Web3Forms account. The dashboard's message panel only shows older messages saved in Supabase. Treat site settings as public content; never store secrets there.

Set the admin user's `app_metadata.role` with the Supabase Dashboard or a trusted server using the service role key. Do not add a service role key to `.env.local` with a `NEXT_PUBLIC_` prefix.
