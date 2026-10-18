import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskResult,
  TaskDetailsResult,
  TaskComment,
  PaginationResult,
  CreateTaskRequest,
  UpdateTaskRequest,
  LogTimeRequest,
  AddCommentRequest,
  Priority,
  TaskStatus,
} from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/v1/tasks`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/v1/tasks?page={page}&pageSize={pageSize}&workspaceId={workspaceId} */
  getAll(
    page: number = 1,
    pageSize: number = 10,
    workspaceId?: string | null,
  ): Observable<PaginationResult<TaskResult>> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (workspaceId) {
      params = params.set('workspaceId', workspaceId);
    }

    return this.http.get<PaginationResult<TaskResult>>(this.apiUrl, {
      params,
      withCredentials: true,
    });
  }

  /** GET /api/v1/tasks/my?type={type}&page={page}&pageSize={pageSize}&workspaceId={workspaceId} */
  getMy(
    type?: string | null,
    page: number = 1,
    pageSize: number = 10,
    workspaceId?: string | null,
  ): Observable<PaginationResult<TaskResult>> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (type) {
      params = params.set('type', type);
    }

    if (workspaceId) {
      params = params.set('workspaceId', workspaceId);
    }

    return this.http.get<PaginationResult<TaskResult>>(`${this.apiUrl}/my`, {
      params,
      withCredentials: true,
    });
  }

  /** GET /api/v1/tasks/{id} */
  getById(id: string): Observable<TaskDetailsResult> {
    return this.http.get<TaskDetailsResult>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /** POST /api/v1/tasks */
  create(request: CreateTaskRequest): Observable<string> {
    return this.http.post<string>(this.apiUrl, request, {
      withCredentials: true,
    });
  }

  /** PUT /api/v1/tasks/{id} */
  update(id: string, request: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request, {
      withCredentials: true,
    });
  }

  /** PUT /api/v1/tasks/{id}/assign/{userId} */
  assign(id: string, userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/assign/${userId}`, null, {
      withCredentials: true,
    });
  }

  /** PATCH /api/v1/tasks/{id}/priority */
  changePriority(id: string, priority: Priority): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/priority`,
      { priority },
      {
        withCredentials: true,
      },
    );
  }

  /** PATCH /api/v1/tasks/{id}/submit-for-review */
  submitForReview(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/submit-for-review`, null, {
      withCredentials: true,
    });
  }

  /** PATCH /api/v1/tasks/{id}/approve */
  approve(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/approve`, null, {
      withCredentials: true,
    });
  }

  /** PATCH /api/v1/tasks/{id}/close */
  close(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/close`, null, {
      withCredentials: true,
    });
  }

  /** POST /api/v1/tasks/{id}/time-logs */
  logTime(id: string, request: LogTimeRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/time-logs`, request, {
      withCredentials: true,
    });
  }

  /** PATCH /api/v1/tasks/{id}/approve */
  complete(id: string): Observable<void> {
    return this.approve(id);
  }

  /** PATCH /api/v1/tasks/{id}/status (deprecated compatibility fallback) */
  changeStatus(id: string, request: { status: TaskStatus }): Observable<void> {
    switch (request.status) {
      case 'InReview':
        return this.submitForReview(id);
      case 'Done':
        return this.approve(id);
      case 'Closed':
        return this.close(id);
      case 'Cancelled':
        return this.cancel(id);
      default:
        return this.http.patch<void>(`${this.apiUrl}/${id}/status`, request, {
          withCredentials: true,
        });
    }
  }

  /** DELETE /api/v1/tasks/{id} */
  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /** GET /api/v1/tasks/{id}/comments?page={page}&pageSize={pageSize} */
  getComments(
    id: string,
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginationResult<TaskComment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginationResult<TaskComment>>(`${this.apiUrl}/${id}/comments`, {
      params,
      withCredentials: true,
    });
  }

  /** POST /api/v1/tasks/{id}/comments */
  addComment(id: string, request: AddCommentRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/comments`, request, {
      withCredentials: true,
    });
  }

  /** DELETE /api/v1/tasks/{id}/comments/{commentId} */
  deleteComment(id: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/comments/${commentId}`, {
      withCredentials: true,
    });
  }
}
