// Database Types (matching Supabase schema)

export interface Service {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    join_code: string;
    locked: boolean;
    created_by: string;
    created_at: string;
}

export interface Intern {
    id: string;
    service_id: string;
    name: string;
    group_id: string | null;
    is_admin: boolean;
    joined_at: string;
}

export interface Group {
    id: string;
    service_id: string;
    name: string;
    emoji: string | null;
    created_by: string;
    max_size: number | null;
    is_open: boolean;
    created_at: string;
    // Virtual fields (joined)
    member_count?: number;
    members?: Intern[];
}

export interface JoinRequest {
    id: string;
    group_id: string;
    intern_id: string;
    status: 'pending' | 'approved' | 'declined';
    requested_at: string;
    responded_at: string | null;
    // Virtual fields
    intern?: Intern;
    group?: Group;
}

export interface Assignment {
    id: string;
    service_id: string;
    group_id: string;
    date: string;
    created_at: string;
    // Virtual fields
    group?: Group;
}

// API Response Types
export interface ApiError {
    message: string;
    code?: string;
}

// UI State Types
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
