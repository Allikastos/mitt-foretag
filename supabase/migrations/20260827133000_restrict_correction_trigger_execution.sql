-- Trigger functions run through their trigger and must not be callable directly.
revoke all on function public.link_posted_correction()
  from public, anon, authenticated;
