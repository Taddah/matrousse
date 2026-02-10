
export interface EmailRecipient {
    email: string;
    name: string;
    data?: Record<string, string>;
}

export interface EmailOptions {
    subject: string;
    body: string;
}

function replaceVariables(text: string, data: Record<string, string>) {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

/**
 * Mocks sending emails to a list of recipients.
 * In a real application, this would call a backend API.
 */
export async function sendEmails(
    recipients: EmailRecipient[],
    options: EmailOptions
): Promise<number> {
    console.log('--- Sending Emails (Service) ---');

    for (const target of recipients) {
        const finalBody = replaceVariables(options.body, { name: target.name, ...target.data });
        const finalSubject = replaceVariables(options.subject, { name: target.name, ...target.data });

        // Simulate network delay per email or batch
        console.log(`To: ${target.email} | Subject: ${finalSubject}`);
        // In a real app, we might limit logging body content for privacy
        // console.log(finalBody); 
    }
    console.log('--------------------------------');

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return recipients.length;
}
