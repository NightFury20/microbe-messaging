import { redirect } from 'next/navigation';
import AuthedView from './AuthedView';
import { getToken } from '../lib/auth-helpers';

export default async function Home() {
    const session = await getToken();

    if (!session) {
        redirect('/sign-in');
    }

    return <AuthedView />;
}
