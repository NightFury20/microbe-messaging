import { Button } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';
import { disconnectSocket } from './socket';

export default function LogoutButton() {
    return (
        <Button
            onClick={() => {
                disconnectSocket();
                Cookies.remove('token');
                redirect('/sign-in');
            }}
        >
            Signout
        </Button>
    );
}
