import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
    const { id } = params;

    // 1. Verify Session validity
    const { data: session, error: sessionError } = await supabase
        .from('shared_sessions')
        .select('*')
        .eq('id', id)
        .single();

    if (sessionError || !session) {
        throw error(404, 'Lien invalide ou expiré');
    }

    if (session.expires_at && new Date(session.expires_at) < new Date()) {
        throw error(410, 'Lien expiré');
    }

    // 2. Fetch Slots securely via RPC
    const { data: slots, error: rpcError } = await supabase.rpc('get_agenda_slots', {
        p_session_id: id
    });

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw error(500, 'Erreur lors du chargement des créneaux');
    }

    return {
        session, // Contains encrytped_blob to decode student name client-side
        slots: slots || []
    };
};

export const actions = {
    book: async ({ request, locals: { supabase }, params }) => {
        const { id: sessionId } = params;
        const formData = await request.formData();
        const slotId = formData.get('slot_id') as string;
        const recipientName = formData.get('recipient_name') as string;

        if (!slotId) return { error: 'Créneau manquant' };

        const { data, error } = await supabase.rpc('book_agenda_slot', {
            p_slot_id: slotId,
            p_session_id: sessionId,
            p_recipient_name: recipientName
        });

        if (error) {
            console.error('Booking Error:', error);
            return { error: 'Impossible de réserver ce créneau (peut-être déjà pris ?)' };
        }

        return { success: true };
    },
    cancel: async ({ request, locals: { supabase }, params }) => {
        // Optional: Allow cancellation logic
        return { success: true };
    }
} satisfies Actions;
