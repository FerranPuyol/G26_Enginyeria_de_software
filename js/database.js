// ═══════════════════════════════════════════════════════════════════════════
//  BASE DE DADES — Supabase
//  Gestió d'autenticació d'usuaris i guardatge de pressupostos en la núvol.
// ═══════════════════════════════════════════════════════════════════════════

//  ⚠️  PAS 1: Substitueix els valors de sota amb les teves credencials reals.
//  Les trobaràs a: Supabase → el teu projecte → Settings → API
//    · "Project URL"  →  SUPABASE_URL
//    · "anon / public" →  SUPABASE_ANON_KEY

const SUPABASE_URL      = 'https://wbdkshqhptozqgadpegr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_83EqeeS5waVSwJvxrJoBCw_m0G3ebH1';

// ─── Inicialització del client ───────────────────────────────────────────────
const { createClient } = window.supabase;
const dbClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ═══════════════════════════════════════════════════════════════════════════
//  AUTENTICACIÓ
// ═══════════════════════════════════════════════════════════════════════════

async function dbRegister(name, email, password) {
  const { data, error } = await dbClient.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });
  if (error) throw error;
  return data;
}

async function dbLogin(email, password) {
  const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function dbLogout() {
  const { error } = await dbClient.auth.signOut();
  if (error) throw error;
}

async function dbGetSession() {
  const { data: { session } } = await dbClient.auth.getSession();
  return session;
}

async function dbGetUser() {
  const session = await dbGetSession();
  return session ? session.user : null;
}


// ═══════════════════════════════════════════════════════════════════════════
//  PRESSUPOSTOS
// ═══════════════════════════════════════════════════════════════════════════

// Guarda un nou pressupost per a l'usuari autenticat (amb nom, mes i any).
async function dbSavePressupost({ ingressos, metaEstalvi, despeses, totalDespeses, balanc, nom, mes, year }) {
  const user = await dbGetUser();
  if (!user) throw new Error('Cal iniciar sessió per guardar el pressupost.');

  const { data, error } = await dbClient
    .from('pressupostos')
    .insert({
      user_id:        user.id,
      ingressos,
      meta_estalvi:   metaEstalvi,
      despeses,
      total_despeses: totalDespeses,
      balanc,
      nom:            nom || null,
      mes:            mes || null,
      year:           year || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Retorna tots els pressupostos de l'usuari autenticat, del més recent al més antic.
async function dbGetPressupostos() {
  const { data, error } = await dbClient
    .from('pressupostos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Retorna l'últim pressupost guardat (o null si no n'hi ha cap).
async function dbGetLastPressupost() {
  const { data, error } = await dbClient
    .from('pressupostos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}


// Elimina un pressupost de l'usuari autenticat.
async function dbDeletePressupost(id) {
  const { error } = await dbClient
    .from('pressupostos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Retorna estadístiques públiques agregades (sense dades individuals).
async function dbGetPublicStats() {
  const { data, error } = await dbClient.rpc('get_public_stats');
  if (error) throw error;
  return data;
}


// ═══════════════════════════════════════════════════════════════════════════
//  AVALUACIONS
// ═══════════════════════════════════════════════════════════════════════════

async function dbSaveAvaluacio({ pressupostId, haEstalviat, faltaImport, motiu }) {
  const user = await dbGetUser();
  if (!user) throw new Error('Cal iniciar sessió.');

  const { data, error } = await dbClient
    .from('avaluacions')
    .insert({
      pressupost_id: pressupostId,
      user_id:       user.id,
      ha_estalviat:  haEstalviat,
      falta_import:  faltaImport || null,
      motiu:         motiu || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Retorna l'avaluació d'un pressupost concret (o null si no n'hi ha).
async function dbGetAvaluacioByPressupost(pressupostId) {
  const { data, error } = await dbClient
    .from('avaluacions')
    .select('*')
    .eq('pressupost_id', pressupostId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Retorna totes les avaluacions de l'usuari.
async function dbGetAvaluacions() {
  const { data, error } = await dbClient
    .from('avaluacions')
    .select('*');

  if (error) throw error;
  return data || [];
}


// ═══════════════════════════════════════════════════════════════════════════
//  ESTADÍSTIQUES / COMPTE
// ═══════════════════════════════════════════════════════════════════════════

async function dbGetStats() {
  const [pressupostos, avaluacions] = await Promise.all([
    dbGetPressupostos(),
    dbGetAvaluacions(),
  ]);

  const total = pressupostos.length;
  const avgBalanc   = total > 0 ? pressupostos.reduce((s, p) => s + (p.balanc || 0), 0) / total : 0;
  const avgEstalvi  = total > 0 ? pressupostos.reduce((s, p) => s + (p.meta_estalvi || 0), 0) / total : 0;

  return { total, avgBalanc, avgEstalvi, totalAvaluacions: avaluacions.length };
}

// Actualitza el nom de l'usuari a Supabase Auth.
async function dbUpdateUserName(newName) {
  const { data, error } = await dbClient.auth.updateUser({
    data: { full_name: newName }
  });
  if (error) throw error;
  return data;
}

// Guarda les metes a les dades de l'usuari (user_metadata) de Supabase Auth
async function dbSaveMetes(metesArray) {
  const { data, error } = await dbClient.auth.updateUser({
    data: { metes: metesArray }
  });
  if (error) throw error;
  return data;
}

// ── MÒDUL ASSISTENT IA / SUPABASE ─────────────────
// NOTE: The `ai_folders` table should include optional metadata columns:
// icon text default '📁', color text default 'blue', position integer default 0
// Example SQL:
// alter table ai_folders
// add column if not exists icon text default '📁',
// add column if not exists color text default 'blue',
// add column if not exists position integer default 0;
async function dbGetAIFolders(userId) {
  const { data, error } = await dbClient
    .from('ai_folders')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function dbCreateAIFolder({ userId, id, name, icon, color, position, createdAt, updatedAt }) {
  const { data, error } = await dbClient
    .from('ai_folders')
    .insert({ id, user_id: userId, name, icon, color, position, created_at: createdAt, updated_at: updatedAt })
    .single();
  if (error) throw error;
  return data;
}

async function dbUpsertAIFolder({ userId, id, name, icon, color, position, createdAt, updatedAt }) {
  const { data, error } = await dbClient
    .from('ai_folders')
    .upsert({ id, user_id: userId, name, icon, color, position, created_at: createdAt, updated_at: updatedAt }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbUpdateAIFolder(id, name) {
  const { data, error } = await dbClient
    .from('ai_folders')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function dbDeleteAIFolder(id, userId) {
  const query = dbClient.from('ai_folders').delete().eq('id', id);
  if (userId) query.eq('user_id', userId);
  const { error } = await query;
  if (error) throw error;
}

async function dbGetAIChats(userId) {
  const { data, error } = await dbClient
    .from('ai_chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function dbCreateAIChat({ userId, id, folderId, title, createdAt, updatedAt }) {
  const { data, error } = await dbClient
    .from('ai_chats')
    .insert({ id, user_id: userId, folder_id: folderId, title, created_at: createdAt, updated_at: updatedAt })
    .single();
  if (error) throw error;
  return data;
}

async function dbUpsertAIChat({ userId, id, folderId, title, createdAt, updatedAt }) {
  const { data, error } = await dbClient
    .from('ai_chats')
    .upsert({ id, user_id: userId, folder_id: folderId, title, created_at: createdAt, updated_at: updatedAt }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbUpdateAIChat(id, updates) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await dbClient
    .from('ai_chats')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function dbDeleteAIChat(id, userId) {
  const query = dbClient.from('ai_chats').delete().eq('id', id);
  if (userId) query.eq('user_id', userId);
  const { error } = await query;
  if (error) throw error;
}

async function dbGetAIMessages(userId) {
  const { data, error } = await dbClient
    .from('ai_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function dbCreateAIMessage({ userId, chatId, role, content, meta }) {
  const { data, error } = await dbClient
    .from('ai_messages')
    .insert({ user_id: userId, chat_id: chatId, role, content, meta })
    .single();
  if (error) throw error;
  return data;
}

async function dbDeleteAIMessages(chatId, userId) {
  const query = dbClient.from('ai_messages').delete().eq('chat_id', chatId);
  if (userId) query.eq('user_id', userId);
  const { error } = await query;
  if (error) throw error;
}
