
import { throwError as observableThrowError,  Observable, AsyncSubject } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { error } from 'protractor';

export interface LinkObject {
    readonly href: string;
    readonly templated?: boolean;
}

export interface ApiLinksObject {
    readonly self: LinkObject;
    [propName: string]: LinkObject;
}

export interface ApiObject {
    readonly _links: ApiLinksObject;
    [propName: string]: any;
}

function isApiObject(toTest: any): toTest is ApiObject {
    return '_links' in toTest;
}

function isApiLinksObject(toTest: any): toTest is ApiLinksObject {
    return 'self' in toTest;
}

function isLinkObject(toTest: any): toTest is LinkObject {
    return 'href' in toTest;
}

@Injectable()
export class BaseApiService {

    private backendServerUri: string;

    private runningRequests: Map<string, AsyncSubject<unknown>> = new Map<string, AsyncSubject<unknown>>();

    constructor(private http: HttpClient) {}

    setBackendServerUri(uri: string) {
        this.backendServerUri = uri;
    }

    private extractUrl(url: string|LinkObject|ApiLinksObject|ApiObject): string {
        if (typeof url === 'string' || url instanceof String) {
            url = (url as string);
        } else {
            if (isApiObject(url)) {
                url = url._links;
            }
            if (isApiLinksObject(url)) {
                url = url.self;
            }
            if (isLinkObject(url)) {
                url = url.href;
            }
        }

        // Make sure exactly one slash exists between backenServerUri and url
        if (this.backendServerUri.endsWith('/')) {
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
        } else {
            if (! url.startsWith('/')) {
                url = '/' + url;
            }
        }

        // Make sure url ends with slash
        if (!url.endsWith('/')) {
            if ((url.lastIndexOf('.') < 0) || (url.lastIndexOf('/') > url.lastIndexOf('.'))) {
                url = url + '/';
            }
        }

        return this.backendServerUri + url;
    }

    private headers(token?: string, mimetypeJSON: boolean= true): {headers: HttpHeaders, [prop: string]: any} {
        const headers: {[prop: string]: string} = {};
        if (mimetypeJSON) {
            headers['Content-Type'] = 'application/json';
        }
        if (token != null) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        return { headers: new HttpHeaders(headers) };
    }

    private getErrorMessage(error: any): string {
        if (error.error !== undefined && error.error.message !== undefined
            && (typeof error.error.message === 'string' || error.error.message instanceof String)
            && error.error.message.length > 0) {
            return error.error.message;
        } else if (error.message !== undefined
            && (typeof error.message === 'string' || error.message instanceof String)
            && error.message.length > 0) {
            return error.message;
        } else if (error.json !== undefined && error.json().error !== undefined
            && (typeof error.json().error === 'string' || error.json().error instanceof String)
            && error.json().error.length > 0) {
            return error.json().console.error();
        } else if (error.status != null && error.status !== 0) {
            return 'Server error. Code:' + error.status;
        } else {
            return 'Server error.'
        }
    }

    private getErrorContent(error: any): any {
        if (error.status != null && error.status !== 0) {
            return {
                    status: error.status,
                    message: this.getErrorMessage(error)
                };
        }
        return this.getErrorMessage(error);
    }

    get<T>(url: string|LinkObject|ApiLinksObject|ApiObject, token?: string, params?): Observable<T> {
        url = this.extractUrl(url);
        if (this.runningRequests.has(url) && params == null) {
            return this.runningRequests.get(url).asObservable() as Observable<T>;
        }
        const options = this.headers(token);
        if (params != null) {
            options.params = params;
        }

        const request = new AsyncSubject<T>();
        this.runningRequests.set(url, request);
        this.http.get<T>(url, options).subscribe((res) => {
            request.next(res);
            request.complete();
            this.runningRequests.delete(url as string);
        }, (error: any) => {
            this.runningRequests.delete(url as string);
            console.log(error);
            request.error(this.getErrorContent(error));
        });
        return request;
    }

    put<T>(url: string|LinkObject|ApiLinksObject|ApiObject, data, token?: string): Observable<T> {
        url = this.extractUrl(url);
        return this.http.put<T>(url, JSON.stringify(data), this.headers(token)).pipe(
            catchError((error: any) => {
                console.log(error);
                return observableThrowError(this.getErrorContent(error));
            }),
        );
    }

    post<T>(url: string|LinkObject|ApiLinksObject|ApiObject, data, token?: string): Observable<T> {
        url = this.extractUrl(url);
        return this.http.post<T>(url, JSON.stringify(data), this.headers(token)).pipe(
            catchError((error: any) => {
                console.log(error);
                return observableThrowError(this.getErrorContent(error));
            }),
        );
    }

    uploadFile<T>(url: string|LinkObject|ApiLinksObject|ApiObject, data: FormData, token?: string): Observable<T> {
        url = this.extractUrl(url);
        const options = this.headers(token, false);
        return this.http.post<T>(url, data, options).pipe(
            catchError((error: any) => {
                console.log(error);
                return observableThrowError(this.getErrorContent(error));
            }),
        );
    }

    downloadFile(url: string|LinkObject|ApiLinksObject|ApiObject, token?: string): Observable<Response> {
        url = this.extractUrl(url);
        const options = this.headers(token, false);
        options.responseType = 'blob';
        options.observe = 'response';
        return this.http.get<Response>(url, options).pipe(
            catchError((error: any) => {
                console.log(error);
                return observableThrowError(this.getErrorContent(error));
            }),
        );
    }

    delete<T>(url: string|LinkObject|ApiLinksObject|ApiObject, token?: string, data?): Observable<T> {
        url = this.extractUrl(url);
        const options = this.headers(token);
        if (data != null) {
            options.body = data;
        }
        return this.http.delete<T>(url, options).pipe(
            catchError((error: any) => {
                console.log(error);
                return observableThrowError(this.getErrorContent(error));
            }),
        );
    }
}
