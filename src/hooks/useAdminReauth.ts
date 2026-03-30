// src/hooks/useAdminReauth.ts


import { useState, useCallback } from 'react';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    getAuth,
} from 'firebase/auth';

export interface ReauthState {
    isOpen: boolean;
    loading: boolean;
    error: string | null;
}


export const useAdminReauth = () => {
    const [state, setState] = useState<ReauthState>({
        isOpen: false,
        loading: false,
        error: null,
    });

    const open = useCallback(() => setState(s => ({ ...s, isOpen: true, error: null })), []);
    const close = useCallback(() => setState(s => ({ ...s, isOpen: false, error: null, loading: false })), []);

    /**
     * Attempt reauthentication with the supplied password.
     * Returns `true` on success, `false` on failure.
     * Never signs the user out or changes the current session.
     */
    const reauth = useCallback(async (password: string): Promise<boolean> => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser?.email) {
            setState(s => ({ ...s, error: 'No authenticated user found.' }));
            return false;
        }

        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(currentUser, credential);


            setState({ isOpen: false, loading: false, error: null });
            return true;
        } catch (err) {
            // Firebase error codes come back in err.code, not err.message
            const code = (err as { code?: string }).code ?? '';
            const msg =
                code.includes('wrong-password') || code.includes('invalid-credential')
                    ? 'Incorrect password. Please try again.'
                    : code.includes('too-many-requests')
                        ? 'Too many attempts — please wait a moment.'
                        : code.includes('user-mismatch')
                            ? 'Credential does not match the signed-in account.'
                            : 'Authentication failed. Please check your password.';

            setState(s => ({ ...s, loading: false, error: msg }));
            return false;
        }
    }, []);

    return { reauth, state, open, close };
};