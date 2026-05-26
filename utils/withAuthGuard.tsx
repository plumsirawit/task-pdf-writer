import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";

export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthGuardedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withGuestGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function GuestGuardedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.replace("/contests");
      }
    }, [user, loading, router]);

    if (loading) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
