import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession();

    if (!session) {
        throw redirect(303, '/');
    }

    const { data: slots, error: slotsError } = await supabase
        .from('agenda_slots')
        .select(`
            *,
            booked_by:shared_sessions(recipient_name, owner_recovery_token, encrypted_blob)
        `)
        .eq('user_id', session.user.id)
        .order('start_time', { ascending: true });

    if (slotsError) {
        console.error('Error fetching agenda slots:', slotsError);
    }

    // Students are encrypted, so we can't sort by name on server.
    // We fetch them and will decrypt on client side.
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });

    if (studentsError) {
        console.error('Error fetching students:', studentsError);
    }

    // Fetch tracking data: detailed shared sessions and their booking status
    const { data: sharedSessions, error: sharedError } = await supabase
        .from('shared_sessions')
        .select(`
            id, recipient_name, created_at, expires_at, owner_recovery_token, encrypted_blob,
            agenda_slots (
                start_time
            )
        `)
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false });

    if (sharedError) {
        console.error('Error fetching shared sessions:', sharedError);
    }

    const trackingData = sharedSessions?.map(session => {
        // agenda_slots is an array because of left join, but logically one-to-one or one-to-many?
        // session.agenda_slots is array.
        // If there's a slot, it's booked.
        const bookedSlot = session.agenda_slots?.[0];

        return {
            id: session.id,
            recipient_name: session.recipient_name,
            created_at: session.created_at,
            expires_at: session.expires_at,
            owner_recovery_token: session.owner_recovery_token,
            encrypted_blob: session.encrypted_blob,
            is_booked: !!bookedSlot,
            booked_slot_date: bookedSlot?.start_time || null
        };
    }) || [];

    return {
        slots:
            slots?.map((slot) => ({
                ...slot,
                studentName: slot.booked_by?.recipient_name
            })) || [],
        students: students || [],
        trackingData
    };
};

export const actions = {
    deleteShareLink: async ({ request, locals: { supabase, getSession } }) => {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return { error: 'Missing ID' };

        const { error } = await supabase
            .from('shared_sessions')
            .delete()
            .eq('id', id)
            .eq('created_by', session.user.id); // Strict ownership check

        if (error) {
            console.error('Error deleting share link:', error);
            return { error: 'Failed to delete' };
        }

        return { success: true };
    },

    updateAgendaSlot: async ({ request, locals: { supabase, getSession } }) => {
        const session = await getSession();
        if (!session) return { error: 'Unauthorized' };

        const formData = await request.formData();
        const id = formData.get('id');
        const notes = formData.get('notes');

        if (!id) return { error: 'Missing ID' };

        const { error } = await supabase
            .from('agenda_slots')
            .update({ notes: notes ? String(notes) : null })
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error updating slot:', error);
            return { error: 'Failed to update' };
        }

        return { success: true };
    }
};
