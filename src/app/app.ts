import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { NavigationHistoryService } from './core/services/navigation-history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Eagerly injects NavigationHistoryService to track route transitions from application launch. */
  protected readonly navHistory = inject(NavigationHistoryService);
}
