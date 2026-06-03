-- Elimina les polítiques duplicades i les recrea correctament
-- Executa a Supabase → SQL Editor → New query → Run

-- ── ai_folders ──────────────────────────────────────────────
drop policy if exists "ai_folders_select" on ai_folders;
drop policy if exists "ai_folders_insert" on ai_folders;
drop policy if exists "ai_folders_update" on ai_folders;
drop policy if exists "ai_folders_delete" on ai_folders;

alter table ai_folders enable row level security;

create policy "ai_folders_select" on ai_folders for select using (auth.uid() = user_id);
create policy "ai_folders_insert" on ai_folders for insert with check (auth.uid() = user_id);
create policy "ai_folders_update" on ai_folders for update using (auth.uid() = user_id);
create policy "ai_folders_delete" on ai_folders for delete using (auth.uid() = user_id);

-- ── ai_chats ─────────────────────────────────────────────────
drop policy if exists "ai_chats_select" on ai_chats;
drop policy if exists "ai_chats_insert" on ai_chats;
drop policy if exists "ai_chats_update" on ai_chats;
drop policy if exists "ai_chats_delete" on ai_chats;

alter table ai_chats enable row level security;

create policy "ai_chats_select" on ai_chats for select using (auth.uid() = user_id);
create policy "ai_chats_insert" on ai_chats for insert with check (auth.uid() = user_id);
create policy "ai_chats_update" on ai_chats for update using (auth.uid() = user_id);
create policy "ai_chats_delete" on ai_chats for delete using (auth.uid() = user_id);

-- ── ai_messages ───────────────────────────────────────────────
drop policy if exists "ai_messages_select" on ai_messages;
drop policy if exists "ai_messages_insert" on ai_messages;
drop policy if exists "ai_messages_delete" on ai_messages;

alter table ai_messages enable row level security;

create policy "ai_messages_select" on ai_messages for select using (auth.uid() = user_id);
create policy "ai_messages_insert" on ai_messages for insert with check (auth.uid() = user_id);
create policy "ai_messages_delete" on ai_messages for delete using (auth.uid() = user_id);