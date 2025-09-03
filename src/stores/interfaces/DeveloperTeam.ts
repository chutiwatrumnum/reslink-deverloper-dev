export interface DeveloperTeamType {
    id: string;
    key?: string;
    userId?: string;
    name?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    givenName?: string;
    familyName?: string;
    role: string | { id: string; name: string };
    roleId?: string | number;
    email: string;
    phone?: string;
    contact?: string;
    createdAt: string;
    createdBy?: string;
    invitedExpired?: string;
    expireDate?: string;
    verifiedDate?: string;
    activateDate?: string;
    activateBy?: {
        givenName: string;
        familyName: string;
        contact?: string;
    };
    activate?: boolean;
    failReason?: string;
}

export interface DeveloperTeamAddNew {
    roleId: string | number;
    firstName: string;
    middleName?: string;
    lastName: string;
    contact: string;
    email: string;
    image?: string;
}

export interface DeveloperTeamEditPayload {
    givenName: string;
    familyName: string;
    middleName?: string;
    contact: string;
    roleId: string | number;
    image?: string;
}

export interface GetDeveloperTeamInvitationsType {
    activate: boolean;
    curPage: number;
    search?: string;
}

export interface DeveloperTeamInvitationsResponse {
    rows: DeveloperTeamType[];
    total: number;
}

export interface DeveloperTeamState {
    tableData: DeveloperTeamType[];
    loading: boolean;
    total: number;
    qrCode: string;
}

export interface DeveloperTeamListParams {
    perPage: number;
    curPage: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    sortBy?: string;
}