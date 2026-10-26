import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpandableItemComponent } from './expandable-item';

describe('ExpandableItemComponent', () => {
  let component: ExpandableItemComponent;
  let fixture: ComponentFixture<ExpandableItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and description', () => {
    fixture.componentRef.setInput('title', 'Personal Information');
    fixture.componentRef.setInput('description', 'Update your display name.');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.item-title');
    const descEl = fixture.nativeElement.querySelector('.item-desc');
    expect(titleEl.textContent).toContain('Personal Information');
    expect(descEl.textContent).toContain('Update your display name.');
  });

  it('should reflect expanded state on button and panel', () => {
    fixture.componentRef.setInput('expanded', true);
    fixture.componentRef.setInput('toggleButtonId', 'btn-toggle-test');
    fixture.componentRef.setInput('panelId', 'panel-test');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('#btn-toggle-test');
    const panel = fixture.nativeElement.querySelector('#panel-test');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel.classList).toContain('is-expanded');
  });

  it('should emit toggle event on button click', () => {
    spyOn(component.toggle, 'emit');
    const button = fixture.nativeElement.querySelector('.item-header');
    button.click();
    expect(component.toggle.emit).toHaveBeenCalled();
  });
});
