import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BaseService {
    constructor(
        protected http: HttpClient,
    ) { }

    private _rootUrl: string = '/api';

    get rootUrl(): string {
        return this._rootUrl;
    }

    set rootUrl(rootUrl: string) {
        this._rootUrl = rootUrl;
    }
}