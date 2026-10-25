import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatePanelComponent } from './state-panel';

describe('StatePanelComponent', () => {
  let component: StatePanelComponent;
  let fixture: ComponentFixture<StatePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading spinner by default', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render title and message', () => {
    fixture.componentRef.setInput('type', 'empty');
    fixture.componentRef.setInput('title', 'No Items Found');
    fixture.componentRef.setInput('message', 'Try adjusting your filters.');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.state-title');
    const msgEl = fixture.nativeElement.querySelector('.state-message');
    expect(titleEl.textContent.trim()).toBe('No Items Found');
    expect(msgEl.textContent.trim()).toBe('Try adjusting your filters.');
  });

  it('should render error type with error icon', () => {
    fixture.componentRef.setInput('type', 'error');
    fixture.componentRef.setInput('icon', 'alert-circle');
    fixture.componentRef.setInput('title', 'Access Restricted');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.state-panel');
    expect(panel.classList).toContain('state-error');

    const icon = fixture.nativeElement.querySelector('app-icon');
    expect(icon).toBeTruthy();
  });
});
