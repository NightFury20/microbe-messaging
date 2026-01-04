import { Button } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';

export default function LogoutButton() {
    return (
        <Button
            onClick={() => {
                Cookies.remove('token');
                redirect('/sign-in');
            }}
        >
            Signout
        </Button>
    );
}
