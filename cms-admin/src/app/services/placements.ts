import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Placement, CreatePlacementDto, UpdatePlacementDto } from '../models/placement.model';
import { StandardResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class Placements {
  private apiUrl = `${environment.apiUrl}/placements`;

  constructor(private http: HttpClient) {}

  getAllPlacements(): Observable<Placement[]> {
    return this.http.get<StandardResponse<Placement[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getPlacement(id: string): Observable<Placement> {
    return this.http.get<StandardResponse<Placement>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getPlacementsBySubCategory(subCategory: string): Observable<Placement[]> {
    return this.http.get<StandardResponse<Placement[]>>(`${this.apiUrl}/subcategory/${subCategory}`)
      .pipe(map(response => response.data));
  }

  createPlacement(placementData: CreatePlacementDto): Observable<Placement> {
    return this.http.post<StandardResponse<Placement>>(this.apiUrl, placementData)
      .pipe(map(response => response.data));
  }

  updatePlacement(id: string, placementData: UpdatePlacementDto): Observable<Placement> {
    return this.http.patch<StandardResponse<Placement>>(`${this.apiUrl}/${id}`, placementData)
      .pipe(map(response => response.data));
  }

  deletePlacement(id: string): Observable<{ message: string }> {
    return this.http.delete<StandardResponse<{ message: string }>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
