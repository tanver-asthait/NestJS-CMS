import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Placement, CreatePlacementDto, UpdatePlacementDto } from '../models/placement.model';

@Injectable({
  providedIn: 'root',
})
export class Placements {
  private apiUrl = `${environment.apiUrl}/placements`;

  constructor(private http: HttpClient) {}

  getAllPlacements(): Observable<Placement[]> {
    return this.http.get<Placement[]>(this.apiUrl);
  }

  getPlacement(id: string): Observable<Placement> {
    return this.http.get<Placement>(`${this.apiUrl}/${id}`);
  }

  getPlacementsBySubCategory(subCategory: string): Observable<Placement[]> {
    return this.http.get<Placement[]>(`${this.apiUrl}/subcategory/${subCategory}`);
  }

  createPlacement(placementData: CreatePlacementDto): Observable<Placement> {
    return this.http.post<Placement>(this.apiUrl, placementData);
  }

  updatePlacement(id: string, placementData: UpdatePlacementDto): Observable<Placement> {
    return this.http.patch<Placement>(`${this.apiUrl}/${id}`, placementData);
  }

  deletePlacement(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
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
