import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Init_Should_HaveDefaultProperties_When_Created', () => {
    expect(component).toBeTruthy();
    expect(component.text).toBe('');
    expect(component.position).toBe('top');
    expect(component['isVisible']).toBeFalse();
  });

  it('show_Should_SetIsVisibleTrue_When_TextIsPresent', () => {
    component.text = 'Unassigned';
    component.show();
    fixture.detectChanges();

    expect(component['isVisible']).toBeTrue();
    const bubbleEl = fixture.nativeElement.querySelector('.tooltip-bubble');
    expect(bubbleEl).toBeTruthy();
    expect(bubbleEl.textContent.trim()).toBe('Unassigned');
  });

  it('show_Should_NotSetIsVisibleTrue_When_TextIsEmpty', () => {
    component.text = '';
    component.show();
    fixture.detectChanges();

    expect(component['isVisible']).toBeFalse();
    const bubbleEl = fixture.nativeElement.querySelector('.tooltip-bubble');
    expect(bubbleEl).toBeNull();
  });

  it('hide_Should_SetIsVisibleFalse_When_Called', () => {
    component.text = 'denys_khomiak';
    component.show();
    fixture.detectChanges();
    expect(component['isVisible']).toBeTrue();

    component.hide();
    fixture.detectChanges();
    expect(component['isVisible']).toBeFalse();
    const bubbleEl = fixture.nativeElement.querySelector('.tooltip-bubble');
    expect(bubbleEl).toBeNull();
  });

  it('Events_Should_ShowOnMouseEnterAndHideOnMouseLeave', () => {
    component.text = 'sarah_connor';
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.tooltip-wrapper');
    wrapper.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(component['isVisible']).toBeTrue();

    wrapper.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(component['isVisible']).toBeFalse();
  });

  it('Position_Should_ApplyPositionClass_When_Specified', () => {
    component.text = 'Custom Position';
    component.position = 'bottom';
    component.show();
    fixture.detectChanges();

    const bubbleEl = fixture.nativeElement.querySelector('.tooltip-bubble');
    expect(bubbleEl.classList.contains('tooltip-bottom')).toBeTrue();
  });
});
