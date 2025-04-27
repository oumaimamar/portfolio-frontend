import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../_services/profile.service';

import {TokenService} from '../../_services/token.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {MediaType, UserMediaRequest, UserMediaResponse} from '../../_models/user-media';
import {UserMediaService} from '../../_services/user-media.service';


@Component({
  selector: 'app-user-media',
  standalone: false,
  templateUrl: './user-media.component.html',
  styleUrls: ['./user-media.component.scss'] // <-- Fixed here (styleUrls)
})
export class UserMediaComponent implements OnInit {
  userId: number;

  mediaTypes = Object.values(MediaType);

  documentCategories = [
    'Certificates',
    'CVs & Resumes',
    'Education Documents',
    'Personal Projects',
    'Work Samples',
    'Other'
  ];

  profileForm!: FormGroup;
  usermediaForm!: FormGroup;
  usermedias: UserMediaResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private tokenService: TokenService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private userMediaService: UserMediaService
  ) {
    this.userId = this.tokenService.getUser().id;
  }

  ngOnInit(): void {
    this.initForms();
    this.loadExistingData();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      diploma: [''],
      bio: [''],
      profilePicture: ['']
    });

    this.usermediaForm = this.fb.group({
      name: ['', Validators.required],
      filePath: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      mediaType: [MediaType.DOCUMENT, Validators.required],
      verified: [false]
    });
  }

  loadExistingData(): void {
    this.profileService.getProfile(this.userId).subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
      }
    });
    this.loadUserMedias();
  }

  loadUserMedias(): void {
    this.userMediaService.getAllUserMedia(this.userId).subscribe({
      next: (medias) => this.usermedias = medias,
      error: (err) => {
        console.error('Failed to load documents:', err);
        this.snackBar.open('Failed to load documents', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addUserMedia(): void {
    if (this.usermediaForm.valid) {
      const request: UserMediaRequest = this.usermediaForm.value;
      this.userMediaService.createUserMedia(this.userId, request).subscribe({
        next: (newDoc) => {
          this.usermedias.push(newDoc);
          this.usermediaForm.reset({
            name: '',
            filePath: '',
            description: '',
            category: '',
            mediaType: MediaType.DOCUMENT,
            verified: false
          });
          this.snackBar.open('Document added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Failed to add document:', err);
          this.snackBar.open(err.error?.message || 'Failed to add document', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteUserMedia(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Document',
        message: 'Are you sure you want to delete this document?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userMediaService.deleteUserMedia(this.userId, id).subscribe({
          next: () => {
            this.usermedias = this.usermedias.filter(s => s.id !== id);
            this.snackBar.open('Document deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete document:', err);
            this.snackBar.open('Failed to delete document', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }


  editingDocId: number | null = null;
  editUserMedia(doc: UserMediaResponse): void {
    this.editingDocId = doc.id;
    this.usermediaForm.patchValue({
      name: doc.name,
      filePath: doc.filePath,
      description: doc.description,
      category: doc.category,
      mediaType: doc.mediaType,
      verified: doc.verified
    });
  }

  updateUserMedia(): void {
    if (this.usermediaForm.valid && this.editingDocId !== null) {
      const request: UserMediaRequest = this.usermediaForm.value;
      this.userMediaService.updateUserMedia(this.userId, this.editingDocId, request).subscribe({
        next: (updatedDoc) => {
          const index = this.usermedias.findIndex(d => d.id === updatedDoc.id);
          if (index !== -1) {
            this.usermedias[index] = updatedDoc;
          }
          this.snackBar.open('Document updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.usermediaForm.reset({
            mediaType: MediaType.DOCUMENT,
            verified: false
          });
          this.editingDocId = null;
        },
        error: (err) => {
          console.error('Failed to update document:', err);
          this.snackBar.open(err.error?.message || 'Failed to update document', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }



}

