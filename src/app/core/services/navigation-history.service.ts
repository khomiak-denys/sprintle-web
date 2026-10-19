import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  private readonly router = inject(Router);
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;

  constructor() {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects || event.url;
      });
  }

  getPreviousUrl(): string | null {
    return this.previousUrl;
  }

  setPreviousUrl(url: string | null): void {
    this.previousUrl = url;
  }
}
