import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebappSettingsService {
  constructor(private readonly http: HttpClient) { }

  getWebappSettings(): Observable<WebappSettings> {
    return this.http.get<WebappSettings>('webappSettings.json');
  }
}

/**
 * Immutable representation of the settings configured in webappSettings.json
 */
export class WebappSettings {
    readonly backendServerUri: string;
    readonly backendRootResourceLocation: string;
    readonly maxStringLength: number;
    constructor(backendUri: string, backendRootResourceLocation: string, maxStringLength: number) {
        this.backendServerUri = backendUri;
        this.backendRootResourceLocation = backendRootResourceLocation;
        this.maxStringLength = maxStringLength;
    }
}
