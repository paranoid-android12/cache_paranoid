import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Froggy';
}

export const mainPort = "https://indigo-caribou-270666.hostingersite.com";
// export const mainPort = "http://localhost";