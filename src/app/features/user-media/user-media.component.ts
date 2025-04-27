import {Component, OnInit} from '@angular/core';
import {SkillLevel} from '../../_models/tech-skill';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CertificationType, ProficiencyLevel} from '../../_models/language';
import {ProfileService} from '../../_services/profile.service';

import {TokenService} from '../../_services/token.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {UserMediaRequest, UserMediaResponse} from '../../_models/user-media';
import {UserMediaService} from '../../_services/user-media.service';


@Component({
  selector: 'app-user-media',
  standalone: false,
  templateUrl: './user-media.component.html',
  styleUrl: './user-media.component.scss'
})
export class UserMediaComponent implements OnInit {
  userId: number;

// Add to component class --SELECTED
  skillLevels = Object.values(SkillLevel);
  proficiencyLevels = Object.values(ProficiencyLevel);
  certificationTypes = Object.values(CertificationType);


  // Add to your component class --Suggestion
  skillCategories = [
    'Certificates',
    'CVs & Resumes',
    'Education Documents',
    'Personal Projects',
    'Work Samples',
    'Other'
  ];
  softSkillExamples = [
    'Communication',
    'Teamwork',
    'Problem Solving',
    'Leadership',
    'Time Management',
    'Adaptability',
    'Creativity',
    'Critical Thinking'
  ];


// Forms
  profileForm!: FormGroup;
  usermediaForm!: FormGroup;

  // Data lists
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
      level: [SkillLevel.INTERMEDIATE, Validators.required],
      category: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
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
      next: (skills) => this.usermedias = skills,
      error: (err) => {
        console.error('Failed to load tech skills:', err);
        this.snackBar.open('Failed to load technical skills', 'Close', {
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
        next: (newSkill) => {
          this.usermedias.push(newSkill);
          this.usermediaForm.reset({
            level: SkillLevel.INTERMEDIATE,
            yearsOfExperience: 0,
            verified: false
          });
          this.snackBar.open('Technical skill added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Failed to add tech skill:', err);
          this.snackBar.open(err.error?.message || 'Failed to add technical skill', 'Close', {
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
        title: 'Delete Technical Skill',
        message: 'Are you sure you want to delete this technical skill?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userMediaService.deleteUserMedia(this.userId, id).subscribe({
          next: () => {
            this.usermedias = this.usermedias.filter(s => s.id !== id);
            this.snackBar.open('Technical skill deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete tech skill:', err);
            this.snackBar.open('Failed to delete technical skill', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }


}
