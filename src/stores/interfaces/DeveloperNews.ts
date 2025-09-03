// src/stores/interfaces/DeveloperNews.ts
export interface DeveloperNewsType {
    id: number; // เปลี่ยนจาก string เป็น number
    key?: string;
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    active: boolean;
    isPublish: boolean;
    projects?: Array<{
        projectId: string;
        projectName?: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string | {
        givenName: string;
        familyName: string;
        sub?: string;
    };
    // เพิ่ม fields ใหม่ตาม API response
    createBy?: {
        sub: string;
        familyName: string;
        givenName: string;
    };
    newsToProjects?: Array<{
        projectId: string;
        project: {
            stepSetup: string;
            name: string;
        };
    }>;
}

export interface DeveloperNewsAddNew {
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    projects: Array<{
        projectId: string;
    }>;
}

export interface DeveloperNewsEditPayload {
    title: string;
    description?: string;
    url?: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    projects: Array<{
        projectId: string;
    }>;
}

export interface GetDeveloperNewsParams {
    curPage: number;
    perPage?: number;
    search?: string;
    startMonth?: string;
    endMonth?: string;
}

export interface DeveloperNewsResponse {
    rows: DeveloperNewsType[];
    total: number;
}

export interface DeveloperNewsState {
    tableData: DeveloperNewsType[];
    loading: boolean;
    total: number;
}

export interface ProjectSelectOption {
    projectId: string;
    projectName: string;
    label: string;
    value: string;
}