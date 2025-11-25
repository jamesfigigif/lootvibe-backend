/// <reference types="vite/client" />
import { ClerkProvider, SignedIn, SignedOut, UserButton, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { ReactNode } from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk Publishable Key');
}

interface ClerkAuthWrapperProps {
    children: ReactNode;
}

export function ClerkAuthWrapper({ children }: ClerkAuthWrapperProps) {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            {children}
        </ClerkProvider>
    );
}

export { SignedIn, SignedOut, UserButton, useUser, SignInButton, SignUpButton };
