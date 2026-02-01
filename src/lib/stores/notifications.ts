import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timeout?: number;
}

function createNotificationStore() {
    const { subscribe, update } = writable<Notification[]>([]);

    return {
        subscribe,
        send: (message: string, type: NotificationType = 'info', timeout: number = 3000) => {
            const id = crypto.randomUUID();
            update((n) => [...n, { id, type, message, timeout }]);

            if (timeout > 0) {
                setTimeout(() => {
                    update((n) => n.filter((i) => i.id !== id));
                }, timeout);
            }
        },
        remove: (id: string) => {
            update((n) => n.filter((i) => i.id !== id));
        }
    };
}

export const notifications = createNotificationStore();
