import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Missing Supabase environment variables. Check your .env.local file.",
	);
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	}
});

export async function signInWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})
	if (error) throw error
	return data
}

export async function signUpWithEmail(
	email: string,
	password: string,
	displayName?: string
) {
	const{ data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: displayName,
			},
		},
	});
	if (error) throw error 
	return data
}

export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
		}
	});
	if (error) throw error
	return data
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function getSession() {
	const {data: { session }, error} = await supabase.auth.getSession()
	if (error) throw error
	return session
}

export async function getUser() {
	const { data: { user }, error } = await supabase.auth.getUser()
	if (error) throw error
	return user
}

export async function getProfile(userId: string) {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (error) throw error;
	return data;
}

export async function updateProfile(
	userID: string,
	updates: Database['public']['Tables']['profiles']['Update']
) {
	const { data, error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', userID)
		.single();

	if (error) throw error;
	return data;
}

export async function createGameplan(
	gameplan: Database['public']['Tables']['gameplans']['Insert']
) {
	const { data, error } = await supabase
		.from('gameplans')
		.insert(gameplan)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function updateGameplan(
	id: string,
	updates: Database['public']['Tables']['gameplans']['Update']
) {
	const {data, error} = await supabase
		.from('gameplans')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteGameplan(id: string) {
	const { error } = await supabase
		.from('gameplans')
		.delete()
		.eq('id', id);

	if (error) throw error;
}

export async function deleteAccount() {
	const { data: { session } } = await supabase.auth.getSession()
	if (!session) throw new Error('Not authenticated')

	const response = await supabase.functions.invoke('delete-account', { 
		headers: { 
			Authorization: `Bearer ${session.access_token}`,
		 },
	 })

	if (response.error) {
		throw new Error(response.error.message || 'Failed to delete account')
	}

	await supabase.auth.signOut()
}