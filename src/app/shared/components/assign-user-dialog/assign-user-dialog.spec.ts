import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AssignUserDialogComponent, AssignableMember } from './assign-user-dialog';
import { WorkspaceMemberResult } from '../../../core/models/workspace.models';

describe('AssignUserDialogComponent', () => {
  let component: AssignUserDialogComponent;
  let fixture: ComponentFixture<AssignUserDialogComponent>;

  const mockUsers: WorkspaceMemberResult[] = [
    {
      id: 'u1',
      email: 'alice@test.com',
      userName: 'alice',
      fullName: 'Alice Johnson',
      isOwner: true,
    },
    { id: 'u2', email: 'bob@test.com', userName: 'bob', fullName: 'Bob Smith', isOwner: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignUserDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignUserDialogComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.users = mockUsers;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSelect_Should_EmitUserSelected_When_UserClicked', () => {
    spyOn(component.userSelected, 'emit');

    component['onSelect'](mockUsers[0]);

    expect(component.userSelected.emit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('onClose_Should_EmitCloseDialog_When_Called', () => {
    spyOn(component.closeDialog, 'emit');

    component['onClose']();

    expect(component.closeDialog.emit).toHaveBeenCalled();
  });

  it('onSearchInput_Should_UpdateSearchTermAndEmitSearchChangeAfterDebounce', fakeAsync(() => {
    spyOn(component.searchChange, 'emit');

    component['onSearchInput']('alice');

    expect(component.searchTerm).toBe('alice');
    expect(component.searchChange.emit).not.toHaveBeenCalled();

    tick(400);

    expect(component.searchChange.emit).toHaveBeenCalledWith('alice');
  }));

  it('onSearchEnter_Should_EmitSearchChangeImmediately_When_EnterPressed', () => {
    spyOn(component.searchChange, 'emit');
    component.searchTerm = 'bob';

    component['onSearchEnter']();

    expect(component.searchChange.emit).toHaveBeenCalledWith('bob');
  });

  it('onClearSearch_Should_ResetSearchTermAndEmitEmptyString', () => {
    spyOn(component.searchChange, 'emit');
    component.searchTerm = 'something';

    component['onClearSearch']();

    expect(component.searchTerm).toBe('');
    expect(component.searchChange.emit).toHaveBeenCalledWith('');
  });

  it('isOwner_Should_DetectOwnerStatusAccurately', () => {
    expect(component['isOwner'](mockUsers[0])).toBeTrue();
    expect(component['isOwner'](mockUsers[1])).toBeFalse();
    expect(
      component['isOwner']({ id: 'u3', email: 'c@c.com', userName: 'c', fullName: null }),
    ).toBeFalse();
  });

  it('totalPages_Should_CalculateCorrectlyBasedOnTotalCountAndPageSize', () => {
    component.totalCount = 7;
    component.pageSize = 3;
    expect(component.totalPages).toBe(3);

    component.totalCount = 3;
    expect(component.totalPages).toBe(1);

    component.totalCount = 0;
    expect(component.totalPages).toBe(1);
  });

  it('onPageChange_Should_EmitPageChange_When_PageIsValid', () => {
    spyOn(component.pageChange, 'emit');
    component.totalCount = 6;
    component.pageSize = 3;
    component.page = 1;

    component['onPageChange'](2);

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('onPageChange_Should_NotEmit_When_PageIsSameOrOutOfRange', () => {
    spyOn(component.pageChange, 'emit');
    component.totalCount = 6;
    component.pageSize = 3;
    component.page = 1;

    component['onPageChange'](1);
    component['onPageChange'](0);
    component['onPageChange'](3);

    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('DOM_Should_EmitUserSelected_When_ListItemClicked', () => {
    spyOn(component.userSelected, 'emit');
    fixture.detectChanges();

    const firstItem = fixture.nativeElement.querySelector('#btn-assign-user-u1');
    expect(firstItem).toBeTruthy();
    firstItem.click();

    expect(component.userSelected.emit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('DOM_Should_RenderPaginationAndEmitNextPage_When_TotalCountExceedsPageSize', () => {
    spyOn(component.pageChange, 'emit');
    fixture.componentRef.setInput('totalCount', 6);
    fixture.componentRef.setInput('pageSize', 3);
    fixture.componentRef.setInput('page', 1);
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector(
      '#btn-assign-next-page',
    ) as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('anchorPosition_Should_BindToPanelStyles_When_Provided', () => {
    fixture.componentRef.setInput('anchorPosition', { top: 120, left: 240 });
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.azure-dropdown-panel');
    expect(panel.style.top).toBe('120px');
    expect(panel.style.left).toBe('240px');
  });

  it('customInputs_Should_RenderCustomTitleAndPlaceholder_When_Provided', () => {
    fixture.componentRef.setInput('title', 'Add Member');
    fixture.componentRef.setInput('searchPlaceholder', 'Search potential member...');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.dialog-title');
    const inputEl = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;

    expect(titleEl.textContent.trim()).toBe('Add Member');
    expect(inputEl.placeholder).toBe('Search potential member...');
  });

  it('customInputs_Should_RenderCustomEmptyAndLoadingText_When_Provided', () => {
    fixture.componentRef.setInput('users', []);
    fixture.componentRef.setInput('emptyText', 'No potential users available.');
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.empty-users');
    expect(emptyEl.textContent.trim()).toBe('No potential users available.');

    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('loadingText', 'Fetching users...');
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingEl.textContent).toContain('Fetching users...');
  });
});
