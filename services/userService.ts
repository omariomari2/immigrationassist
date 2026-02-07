import { User, LoginCredentials, SignupData } from '../userTypes';

const USERS_STORAGE_KEY = 'quantro_users';
const CURRENT_USER_KEY = 'quantro_current_user';

function generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getAllUsers(): User[] {
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
    try {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function setCurrentUser(user: User | null): void {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

export function signupUser(data: SignupData): { success: boolean; user?: User; error?: string } {
    const users = getAllUsers();

    const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
    }

    const now = new Date().toISOString();
    const newUser: User = {
        id: generateId(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
        visaStatus: data.visaStatus,
        location: data.location,
        visaExpirationDate: data.visaExpirationDate,
        immigrationDocuments: data.immigrationDocuments || [],
        createdAt: now,
        updatedAt: now
    };

    users.push(newUser);
    saveAllUsers(users);
    setCurrentUser(newUser);

    return { success: true, user: newUser };
}

export function loginUser(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
    const users = getAllUsers();

    const user = users.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
    );

    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    setCurrentUser(user);
    return { success: true, user };
}

export function logoutUser(): void {
    setCurrentUser(null);
}

export function updateUser(userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, error: 'User not found' };
    }

    const updatedUser: User = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    saveAllUsers(users);

    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
    }

    return { success: true, user: updatedUser };
}

export function exportUsersAsJSON(): string {
    const users = getAllUsers();
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    return JSON.stringify(sanitizedUsers, null, 2);
}
