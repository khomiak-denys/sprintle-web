import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import {
  TaskResult,
  TaskDetailsResult,
  TaskComment,
  PaginationResult,
  CreateTaskRequest,
  UpdateTaskRequest,
  LogTimeRequest,
  AddCommentRequest,
} from '../models/task.models';
import { environment } from '../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/api/v1/tasks`;

  const mockTask: TaskResult = {
    id: 'task-1',
    workspaceId: 'ws-arch-core',
    title: 'Design Dashboard Schema',
    description: 'Create Azure styled dashboard representation for tasks',
    status: 'InProgress',
    priority: 'High',
    deadline: '2026-10-15T00:00:00Z',
    assignee: null,
    tags: ['Frontend', 'Azure', 'UI'],
  };

  const mockTaskDetails: TaskDetailsResult = {
    ...mockTask,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: null,
    createdBy: {
      id: 'user-2',
      email: 'creator@example.com',
      userName: 'creator_user',
      fullName: 'Creator User',
    },
    assignee: {
      id: 'user-1',
      email: 'assignee@example.com',
      userName: 'assignee_user',
      fullName: 'Assignee User',
    },
    timeLogs: [
      {
        id: 'log-1',
        userId: 'user-1',
        minutesSpent: 90,
        description: 'Initial schema layout',
        loggedDate: '2026-10-01',
        createdAt: '2026-10-01T12:00:00Z',
      },
    ],
  };

  const mockPagedTasks: PaginationResult<TaskResult> = {
    items: [mockTask],
    page: 1,
    pageSize: 10,
    totalCount: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('getAll_Should_SendGetRequestWithPaginationParams_When_Called', (done) => {
    service.getAll(2, 20).subscribe((result) => {
      expect(result).toEqual(mockPagedTasks);
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}?page=2&pageSize=20`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockPagedTasks);
  });

  it('getMy_Should_SendGetRequestWithFilters_When_Called', (done) => {
    service.getMy('assigned', 1, 10).subscribe((result) => {
      expect(result).toEqual(mockPagedTasks);
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/my?page=1&pageSize=10&type=assigned`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockPagedTasks);
  });

  it('getById_Should_SendGetRequestToIdEndpoint_When_Called', (done) => {
    service.getById('task-1').subscribe((details) => {
      expect(details).toEqual(mockTaskDetails);
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockTaskDetails);
  });

  it('create_Should_SendPostRequestWithPayload_When_Called', (done) => {
    const payload: CreateTaskRequest = {
      workspaceId: 'ws-arch-core',
      title: 'New Task',
      description: 'Description',
      priority: 'High',
      deadline: '2026-10-20T00:00:00Z',
      tags: ['Backend'],
    };

    service.create(payload).subscribe((id) => {
      expect(id).toBe('new-task-id');
      done();
    });

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();
    req.flush('new-task-id');
  });

  it('update_Should_SendPutRequestWithPayload_When_Called', (done) => {
    const payload: UpdateTaskRequest = {
      title: 'Updated Task',
      priority: 'Critical',
    };

    service.update('task-1', payload).subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('assign_Should_SendPutRequestToAssignEndpoint_When_Called', (done) => {
    service.assign('task-1', 'user-456').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/assign/user-456`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('submitForReview_Should_SendPatchRequestToSubmitForReviewEndpoint_When_Called', (done) => {
    service.submitForReview('task-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/submit-for-review`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('approve_Should_SendPatchRequestToApproveEndpoint_When_Called', (done) => {
    service.approve('task-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/approve`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('close_Should_SendPatchRequestToCloseEndpoint_When_Called', (done) => {
    service.close('task-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/close`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('complete_Should_SendPatchRequestToApproveEndpoint_When_Called', (done) => {
    service.complete('task-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/approve`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('cancel_Should_SendDeleteRequestToIdEndpoint_When_Called', (done) => {
    service.cancel('task-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('getAll_Should_IncludeWorkspaceIdParam_When_WorkspaceIdProvided', (done) => {
    service.getAll(1, 10, 'ws-arch-core').subscribe((result) => {
      expect(result).toEqual(mockPagedTasks);
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}?page=1&pageSize=10&workspaceId=ws-arch-core`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockPagedTasks);
  });

  it('getMy_Should_IncludeWorkspaceIdParam_When_WorkspaceIdProvided', (done) => {
    service.getMy('assigned', 1, 10, 'ws-arch-core').subscribe((result) => {
      expect(result).toEqual(mockPagedTasks);
      done();
    });

    const req = httpTesting.expectOne(
      `${baseUrl}/my?page=1&pageSize=10&type=assigned&workspaceId=ws-arch-core`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockPagedTasks);
  });

  it('getComments_Should_SendGetRequestToCommentsEndpoint_When_Called', (done) => {
    const mockPagedComments: PaginationResult<TaskComment> = {
      items: [
        {
          id: 'c-1',
          taskId: 'task-1',
          authorId: 'u-1',
          author: null,
          content: 'Test comment',
          createdAt: '2026-10-11T12:00:00Z',
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
    };

    service.getComments('task-1', 1, 20).subscribe((result) => {
      expect(result).toEqual(mockPagedComments);
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/comments?page=1&pageSize=20`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockPagedComments);
  });

  it('addComment_Should_SendPostRequestToCommentsEndpoint_When_Called', (done) => {
    const request: AddCommentRequest = { content: 'Nice feature' };

    service.addComment('task-1', request).subscribe((commentId) => {
      expect(commentId).toBe('new-comment-id');
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.withCredentials).toBeTrue();
    req.flush('new-comment-id');
  });

  it('deleteComment_Should_SendDeleteRequestToCommentsEndpoint_When_Called', (done) => {
    service.deleteComment('task-1', 'c-1').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/comments/c-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  it('changePriority_Should_SendPatchRequestWithPriority_When_Called', (done) => {
    service.changePriority('task-1', 'Critical').subscribe(() => {
      done();
    });

    const req = httpTesting.expectOne(`${baseUrl}/task-1/priority`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ priority: 'Critical' });
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });
});
