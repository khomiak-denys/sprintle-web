import { Priority, TaskType } from '../models/task.models';
import { IconName } from '../../shared/icons/icon-registry';
import { DropdownOption } from '../../shared/components/dropdown/dropdown';

export interface TaskTypeOption extends DropdownOption {
  value: TaskType;
  label: string;
  icon: IconName;
}

export interface PriorityOption extends DropdownOption {
  value: Priority;
  label: string;
  icon: IconName;
}

export const TASK_TYPES: TaskTypeOption[] = [
  { value: 'Task', label: 'Task', icon: 'task-item' },
  { value: 'Epic', label: 'Epic', icon: 'epic-item' },
  { value: 'Feature', label: 'Feature', icon: 'feature-item' },
  { value: 'UserStory', label: 'User Story', icon: 'story-item' },
  { value: 'Bug', label: 'Bug', icon: 'bug-item' },
];

export const PRIORITIES: PriorityOption[] = [
  { value: 'Low', label: 'Low', icon: 'priority-low' },
  { value: 'Medium', label: 'Medium', icon: 'priority-medium' },
  { value: 'High', label: 'High', icon: 'priority-high' },
  { value: 'Critical', label: 'Critical', icon: 'priority-critical' },
];

export const TASK_TYPE_MAP: Record<TaskType, TaskTypeOption> = Object.fromEntries(
  TASK_TYPES.map((opt) => [opt.value, opt]),
) as Record<TaskType, TaskTypeOption>;

export const PRIORITY_MAP: Record<Priority, PriorityOption> = Object.fromEntries(
  PRIORITIES.map((opt) => [opt.value, opt]),
) as Record<Priority, PriorityOption>;

export function getTaskTypeIcon(type?: TaskType | null): IconName {
  return (type && TASK_TYPE_MAP[type]?.icon) || 'task-item';
}

export function getTaskTypeLabel(type?: TaskType | null): string {
  return (type && TASK_TYPE_MAP[type]?.label) || 'Task';
}

export function getPriorityIcon(priority?: Priority | null): IconName {
  return (priority && PRIORITY_MAP[priority]?.icon) || 'priority-medium';
}

export function getPriorityLabel(priority?: Priority | null): string {
  return (priority && PRIORITY_MAP[priority]?.label) || 'Medium';
}
