import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  isRealAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth session
  useEffect(() => {
    if (isSupabaseConfigured) {
      // 1. Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // 2. Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 3. Fallback to Mock Auth session loading
      try {
        const storedSession = localStorage.getItem("flavora_mock_session");
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (parsed.user && parsed.user.email?.toLowerCase() === "rethveeknalla@gmail.com" && !parsed.user.user_metadata?.name) {
            parsed.user.user_metadata = {
              ...parsed.user.user_metadata,
              name: "Sathveek Nalla",
              full_name: "Sathveek Nalla",
              display_name: "Sathveek Nalla"
            };
            localStorage.setItem("flavora_mock_session", JSON.stringify(parsed));
          }
          setUser(parsed.user);
          setSession(parsed.session);
        }
      } catch (e) {
        console.warn("Failed to load mock session:", e);
      }
      setLoading(false);
    }
  }, []);

  // Signup method
  const signup = async (email: string, password: string, name: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name,
            full_name: name,
            display_name: name
          },
        },
      });
      if (error) return { error };
      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } else {
      // Mock signup simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const cleanEmail = email.trim().toLowerCase();
            // Retrieve or initialize mock users database in localStorage
            const usersJson = localStorage.getItem("flavora_mock_users") || "[]";
            const mockUsers = JSON.parse(usersJson);
            
            // Check if user already exists
            if (mockUsers.some((u: any) => u.email.trim().toLowerCase() === cleanEmail)) {
              resolve({ error: new Error("User already registered") });
              return;
            }

            const mockUser: User = {
              id: "mock-uid-" + Math.random().toString(36).substring(2, 11),
              app_metadata: {},
              user_metadata: { 
                name,
                full_name: name,
                display_name: name
              },
              aud: "authenticated",
              created_at: new Date().toISOString(),
              email: cleanEmail,
            } as User;

            const mockSession: Session = {
              access_token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
              token_type: "bearer",
              expires_in: 3600,
              user: mockUser,
            } as Session;

            // Save user to mock db
            mockUsers.push({ email: cleanEmail, password, user: mockUser });
            localStorage.setItem("flavora_mock_users", JSON.stringify(mockUsers));

            // Save active session
            localStorage.setItem("flavora_mock_session", JSON.stringify({ user: mockUser, session: mockSession }));

            setUser(mockUser);
            setSession(mockSession);
            resolve({ error: null });
          } catch (e) {
            resolve({ error: e as Error });
          }
        }, 800);
      });
    }
  };

  // Login method
  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } else {
      // Mock login simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            const cleanEmail = email.trim().toLowerCase();
            const usersJson = localStorage.getItem("flavora_mock_users") || "[]";
            const mockUsers = JSON.parse(usersJson);

            const matched = mockUsers.find((u: any) => u.email.trim().toLowerCase() === cleanEmail && u.password === password);
            if (!matched) {
              resolve({ error: new Error("Invalid login credentials") });
              return;
            }

            if (matched.user && matched.email?.toLowerCase() === "rethveeknalla@gmail.com" && !matched.user.user_metadata?.name) {
              matched.user.user_metadata = {
                ...matched.user.user_metadata,
                name: "Sathveek Nalla",
                full_name: "Sathveek Nalla",
                display_name: "Sathveek Nalla"
              };
              // Update mock user list
              localStorage.setItem("flavora_mock_users", JSON.stringify(mockUsers));
            }

            const mockSession: Session = {
              access_token: "mock-jwt-token-" + Math.random().toString(36).substring(2),
              token_type: "bearer",
              expires_in: 3600,
              user: matched.user,
            } as Session;

            localStorage.setItem("flavora_mock_session", JSON.stringify({ user: matched.user, session: mockSession }));
            setUser(matched.user);
            setSession(mockSession);
            resolve({ error: null });
          } catch (e) {
            resolve({ error: e as Error });
          }
        }, 800);
      });
    }
  };

  // Logout method
  const logout = async (): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };
      setSession(null);
      setUser(null);
      return { error: null };
    } else {
      // Mock logout simulation
      return new Promise((resolve) => {
        localStorage.removeItem("flavora_mock_session");
        setUser(null);
        setSession(null);
        resolve({ error: null });
      });
    }
  };

  // Forgot password method
  const forgotPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      return { error };
    } else {
      // Mock forgot password simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ error: null });
        }, 800);
      });
    }
  };

  // Update password method (runs when authenticated or inside reset password route)
  const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } else {
      // Mock password update simulation
      return new Promise((resolve) => {
        setTimeout(() => {
          // If mock session exists, update password for matched user in local db
          try {
            const storedSession = localStorage.getItem("flavora_mock_session");
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              const email = parsed.user?.email;
              if (email) {
                const usersJson = localStorage.getItem("flavora_mock_users") || "[]";
                const mockUsers = JSON.parse(usersJson);
                const matched = mockUsers.find((u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
                if (matched) {
                  matched.password = password;
                  localStorage.setItem("flavora_mock_users", JSON.stringify(mockUsers));
                }
              }
            }
          } catch (e) {
            console.warn("Failed to update mock password:", e);
          }
          resolve({ error: null });
        }, 800);
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signup,
        login,
        logout,
        forgotPassword,
        updatePassword,
        isRealAuth: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
