import type { TokenPayload } from "@/types/api";
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        userId: string;
        email: string;
        name?: string | undefined;
    } | null, TokenPayload | {
        userId: string;
        email: string;
        name?: string | undefined;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isTokenValid: import("vue").ComputedRef<boolean>;
    setTokens: (newAccessToken: string, newRefreshToken: string) => void;
    setUser: (userData: TokenPayload) => void;
    clearAuth: () => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}, "refreshToken" | "accessToken" | "user" | "loading" | "error">, Pick<{
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        userId: string;
        email: string;
        name?: string | undefined;
    } | null, TokenPayload | {
        userId: string;
        email: string;
        name?: string | undefined;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isTokenValid: import("vue").ComputedRef<boolean>;
    setTokens: (newAccessToken: string, newRefreshToken: string) => void;
    setUser: (userData: TokenPayload) => void;
    clearAuth: () => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}, "isAuthenticated" | "isTokenValid">, Pick<{
    accessToken: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    user: import("vue").Ref<{
        userId: string;
        email: string;
        name?: string | undefined;
    } | null, TokenPayload | {
        userId: string;
        email: string;
        name?: string | undefined;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isTokenValid: import("vue").ComputedRef<boolean>;
    setTokens: (newAccessToken: string, newRefreshToken: string) => void;
    setUser: (userData: TokenPayload) => void;
    clearAuth: () => void;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}, "setTokens" | "setUser" | "clearAuth" | "login" | "logout">>;
