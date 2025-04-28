import {Component, OnInit} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {HttpEventType} from '@angular/common/http';
import {MediaType, UserMedia} from '../../_models/user-media';
import {UserMediaService} from '../../_services/user-media.service';
import {TokenService} from '../../_services/token.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-user-media',
  standalone: false,
  templateUrl: './user-media.component.html',
  styleUrls: ['./user-media.component.scss'] // <-- Fixed here (styleUrls)
})
export class UserMediaComponent implements OnInit {
  profileId!: number;
  userId: number;
  mediaTypes = Object.values(MediaType);
  selectedFiles: File[] = [];
  selectedMediaType: MediaType = MediaType.IMAGE;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  userMediaForm!: FormGroup;
  mediaList: UserMedia[] = [];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userMediaService: UserMediaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private tokenService: TokenService,
  ) { this.userId = this.tokenService.getUser().id;}

  ngOnInit(): void {
    this.initForms();
    this.loadMedia();

  }


  initForms(): void {
    this.userMediaForm = this.fb.group({
      fileName: ['', Validators.required],
      filePath: ['',],
      fileType: [''],
      fileSize: [''],
      mediaType: [''],
      uploadDate: ['']
    });
  }

  loadMedia(): void {
    this.userMediaService.getProjectMediaP(this.userId).subscribe({
      next: (media) => this.mediaList = media,
      error: (err) => this.showError('Failed to load media', err)
    });
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadMedia(): void {
    if (!this.selectedFiles.length || !this.selectedMediaType) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.selectedFiles.forEach(file => {
      this.userMediaService.uploadMediaP(this.userId, file, this.selectedMediaType).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          } else if (event.type === HttpEventType.Response) {
            this.loadMedia();
            this.selectedFiles = [];
            this.isUploading = false;
            this.showSuccess('Media uploaded successfully');
          }
        },
        error: (err) => {
          this.showError('Failed to upload media', err);
          this.isUploading = false;
        }
      });
    });
  }

  deleteMedia(mediaId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Media',
        message: 'Are you sure you want to delete this media?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userMediaService.deleteMediaP(mediaId).subscribe({
          next: () => {
            this.mediaList = this.mediaList.filter(m => m.id !== mediaId);
            this.showSuccess('Media deleted successfully');
          },
          error: (err) => this.showError('Failed to delete media', err)
        });
      }
    });
  }

  downloadMedia(media: UserMedia): void {
    this.userMediaService.downloadMediaP(media.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = media.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => this.showError('Failed to download media', err)
    });
  }

  getMediaIcon(mediaType: MediaType): string {
    switch (mediaType) {
      case MediaType.IMAGE: return 'image';
      case MediaType.DOCUMENT: return 'description';
      case MediaType.VIDEO: return 'videocam';
      case MediaType.PRESENTATION: return 'slideshow';
      case MediaType.CODE: return 'code';
      default: return 'insert_drive_file';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string, error: any): void {
    console.error(message, error);
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
