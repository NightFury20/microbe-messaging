import { redirect } from 'next/navigation';
import { getToken } from '../lib/auth-helpers';
import AuthedView from './AuthedView';

export default async function Home() {
    let session: string | null = null;

    try {
        session = await getToken();
    } catch (error) {
        console.error('Failed to get session token:', error);
        redirect('/sign-in');
    }

    if (!session) {
        redirect('/sign-in');
    }

    return <AuthedView />;
}
