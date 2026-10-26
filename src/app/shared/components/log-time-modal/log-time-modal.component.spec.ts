import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogTimeModalComponent } from './log-time-modal.component';

describe('LogTimeModalComponent', () => {
  let component: LogTimeModalComponent;
  let fixture: ComponentFixture<LogTimeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogTimeModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogTimeModalComponent);
    component = fixture.componentInstance;
  });

  it('Init_Should_CreateComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Template_Should_NotRender_When_IsOpenIsFalse', () => {
    component.isOpen = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeNull();
  });

  it('Template_Should_Render_When_IsOpenIsTrue', () => {
    component.isOpen = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#modal-time-title').textContent).toContain(
      'Log Time on Work Item',
    );
    expect(fixture.nativeElement.querySelector('#log-minutes')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#log-date')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#log-desc')).toBeTruthy();
  });

  it('onClose_Should_EmitClose_When_Invoked', () => {
    spyOn(component.close, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.modal-close-btn');
    closeBtn.click();

    expect(component.close.emit).toHaveBeenCalledTimes(1);

    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    overlay.click();

    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });

  it('onSubmit_Should_EmitSubmitTimeLog_When_FormIsValid', () => {
    spyOn(component.submitTimeLog, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    component['logTimeForm'].setValue({
      minutesSpent: 120,
      loggedDate: '2026-10-25',
      description: 'Worked on feature refactoring',
    });

    component['onSubmit']();

    expect(component.submitTimeLog.emit).toHaveBeenCalledWith({
      minutesSpent: 120,
      loggedDate: '2026-10-25',
      description: 'Worked on feature refactoring',
    });
  });

  it('onSubmit_Should_NotEmit_When_FormIsInvalid', () => {
    spyOn(component.submitTimeLog, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    component['logTimeForm'].patchValue({
      minutesSpent: null,
    });

    component['onSubmit']();

    expect(component.submitTimeLog.emit).not.toHaveBeenCalled();
    expect(component['logTimeForm'].get('minutesSpent')?.touched).toBeTrue();
  });
});
