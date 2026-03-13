// Shared domain models aligned with slender-server DTOs

export interface UserModel {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  avatarColor?: string | null;
  lastActiveAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface WorkspaceModel {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export type WorkspaceRole = "Owner" | "Admin" | "Member" | "Guest";

export interface WorkspaceMemberModel {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  invitedByUserId?: string | null;
  joinedAtUtc: string;
  user?: UserModel | null;
}

export type ProjectStatus = "Active" | "OnHold" | "Completed" | "Archived";

export interface ProjectModel {
  id: string;
  workspaceId: string;
  ownerId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  color?: string | null;
  icon?: string | null;
  startDate?: string | null; // DateOnly serialized as ISO string
  targetDate?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  archivedAtUtc?: string | null;
}

export type TaskStatus =
  | "Todo"
  | "InProgress"
  | "InReview"
  | "Done"
  | "Archived";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface TaskModel {
  id: string;
  projectId: string;
  workspaceId: string;
  createdById?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  sortOrder: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  completedAtUtc?: string | null;
}
