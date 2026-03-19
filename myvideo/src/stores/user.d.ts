import type { User } from "@/types/api";
export declare const useUserStore: import("pinia").StoreDefinition<"user", Pick<{
    profile: import("vue").Ref<{
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null, User | {
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    setProfile: (userData: User) => void;
    clearProfile: () => void;
    updateProfile: (updates: Partial<User>) => void;
}, "loading" | "error" | "profile">, Pick<{
    profile: import("vue").Ref<{
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null, User | {
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    setProfile: (userData: User) => void;
    clearProfile: () => void;
    updateProfile: (updates: Partial<User>) => void;
}, never>, Pick<{
    profile: import("vue").Ref<{
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null, User | {
        userId: string;
        email: string;
        name: string;
        avatar?: string | undefined;
        createdAt: string;
    } | null>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string | null, string | null>;
    setProfile: (userData: User) => void;
    clearProfile: () => void;
    updateProfile: (updates: Partial<User>) => void;
}, "setProfile" | "clearProfile" | "updateProfile">>;
