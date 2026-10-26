import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render svg when valid icon name is provided', () => {
    component.name = 'user';
    component.ngOnChanges({
      name: {
        currentValue: 'user',
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();

    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement).toBeTruthy();
    expect(svgElement.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svgElement.getAttribute('width')).toBe('20');
    expect(svgElement.getAttribute('height')).toBe('20');
    expect(svgElement.innerHTML).toContain('circle');
  });

  it('should apply custom size and strokeWidth', () => {
    component.name = 'arrow-left';
    component.size = 32;
    component.strokeWidth = 3;
    component.ngOnChanges({
      name: {
        currentValue: 'arrow-left',
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();

    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement.getAttribute('width')).toBe('32');
    expect(svgElement.getAttribute('height')).toBe('32');
    expect(svgElement.getAttribute('stroke-width')).toBe('3');
  });

  it('should not render svg if icon name is null or invalid', () => {
    component.name = null;
    component.ngOnChanges({
      name: {
        currentValue: null,
        previousValue: 'user',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    const svgElement = fixture.nativeElement.querySelector('svg');
    expect(svgElement).toBeNull();
  });
});
