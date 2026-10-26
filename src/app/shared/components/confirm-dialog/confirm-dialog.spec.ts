import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.azure-modal');
    expect(modal).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', 'Delete Test');
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.azure-modal');
    const title = fixture.nativeElement.querySelector('.modal-title');
    expect(modal).toBeTruthy();
    expect(title.textContent).toContain('Delete Test');
  });

  it('should enable confirm button immediately when requireConfirmationText is not set', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(component.isConfirmEnabled()).toBeTrue();
    const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
    expect(confirmBtn.disabled).toBeFalse();
  });

  it('should enforce typing matching text when requireConfirmationText is set', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('requireConfirmationText', 'john_doe');
    fixture.detectChanges();

    expect(component.isConfirmEnabled()).toBeFalse();

    component.onInputChange('wrong_user');
    fixture.detectChanges();
    expect(component.isConfirmEnabled()).toBeFalse();

    component.onInputChange('john_doe');
    fixture.detectChanges();
    expect(component.isConfirmEnabled()).toBeTrue();
  });

  it('should emit close event when cancel button or overlay is clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    spyOn(component.close, 'emit');

    const cancelBtn = fixture.nativeElement.querySelector('.btn-secondary');
    cancelBtn.click();
    expect(component.close.emit).toHaveBeenCalledTimes(1);

    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    overlay.click();
    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });

  it('should emit confirm event when confirm button is clicked and enabled', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    spyOn(component.confirm, 'emit');

    const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
    confirmBtn.click();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should disable buttons and show processing state when isProcessing is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('isProcessing', true);
    fixture.componentRef.setInput('processingText', 'Deleting...');
    fixture.detectChanges();

    expect(component.isConfirmEnabled()).toBeFalse();
    const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
    const cancelBtn = fixture.nativeElement.querySelector('.btn-secondary');
    expect(confirmBtn.disabled).toBeTrue();
    expect(cancelBtn.disabled).toBeTrue();
    expect(confirmBtn.textContent).toContain('Deleting...');
  });
});
