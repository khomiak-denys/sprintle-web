import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavigationHistoryService } from './navigation-history.service';

describe('NavigationHistoryService', () => {
  let service: NavigationHistoryService;
  let routerEventsSubject: Subject<any>;
  let mockRouter: any;

  beforeEach(() => {
    routerEventsSubject = new Subject();
    mockRouter = {
      url: '/workspaces',
      events: routerEventsSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [NavigationHistoryService, { provide: Router, useValue: mockRouter }],
    });

    service = TestBed.inject(NavigationHistoryService);
  });

  it('should be created and have initial null previousUrl', () => {
    expect(service).toBeTruthy();
    expect(service.getPreviousUrl()).toBeNull();
  });

  it('should update previousUrl when NavigationEnd is fired', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/profile', '/profile'));

    expect(service.getPreviousUrl()).toBe('/workspaces');
  });

  it('should allow manually setting previousUrl', () => {
    service.setPreviousUrl('/custom');
    expect(service.getPreviousUrl()).toBe('/custom');
  });
});
