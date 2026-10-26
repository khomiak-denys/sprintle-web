import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandLogoComponent } from './brand-logo';

describe('BrandLogoComponent', () => {
  let component: BrandLogoComponent;
  let fixture: ComponentFixture<BrandLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandLogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title Sprintle', () => {
    const titleEl = fixture.nativeElement.querySelector('.header-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Sprintle');
  });

  it('should render custom title when provided', () => {
    fixture.componentRef.setInput('title', 'My App');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.header-title');
    expect(titleEl.textContent.trim()).toBe('My App');
  });

  it('should hide title when showTitle is false', () => {
    fixture.componentRef.setInput('showTitle', false);
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.header-title');
    expect(titleEl).toBeNull();
  });

  it('should set custom size on svg element', () => {
    fixture.componentRef.setInput('size', 32);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });
});
