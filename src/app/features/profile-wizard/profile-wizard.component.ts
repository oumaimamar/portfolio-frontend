import {Component, OnInit} from '@angular/core';
import {TokenService} from '../../_services/token.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Experience} from '../../_models/experience';
import {Formation} from '../../_models/formation';
import {SoftSkillRequest, SoftSkillResponse} from '../../_models/soft-skill';
import {SkillLevel, TechSkillRequest, TechSkillResponse} from '../../_models/tech-skill';
import {CertificationRequest, CertificationResponse} from '../../_models/certification';
// import {ProjectRequest, ProjectResponse, ProjectStatus} from '../../_models/project';
import {ProfileService} from '../../_services/profile.service';
import {ExperienceService} from '../../_services/experience.service';
import {FormationService} from '../../_services/formation.service';
import {SoftSkillService} from '../../_services/soft-skill.service';
import {LanguageService} from '../../_services/language.service';
import {TechSkillService} from '../../_services/tech-skill.service';
import {CertificationService} from '../../_services/certification.service';
// import {ProjectService} from '../../_services/project.service';
import { Router } from '@angular/router';
import {ProfileUpdateRequest} from '../../_models/profile';
import { HttpEventType } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {CertificationType, LanguageRequest, LanguageResponse, ProficiencyLevel} from '../../_models/language';

@Component({
  selector: 'app-profile-wizard',
  standalone: false,
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.scss']
})
export class ProfileWizardComponent  implements OnInit {
  currentStep = 1;
  totalSteps = 7;
  userId: number;

// Add these As Profile Picture
  previewUrl: string | ArrayBuffer | null = null;
  uploadProgress: number | null = null;


// Add to component class --SELECTED
  skillLevels = Object.values(SkillLevel);
  proficiencyLevels = Object.values(ProficiencyLevel);
  certificationTypes = Object.values(CertificationType);



  // Add to your component class --Suggestion
  skillCategories = [
    'Programming',
    'Database',
    'DevOps',
    'Cloud',
    'Frontend',
    'Backend',
    'Mobile',
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
  languageExamples = [
    'Arabe',
    'Français',
    'Anglais',
    'Espagnol',
    'Allemand',
    'Italien',
    'Chinois',
    'Japonais',
    'Portugais',
    'Russe',
    'Néerlandais',
    'Turc',
    'Coréen',
    'Hindi',
    'Bengali',
    'Suédois',
    'Polonais',
    'Vietnamien',
    'Grec',
    'Thaïlandais'
  ];



  // Forms
  profileForm!: FormGroup;
  experienceForm!: FormGroup;
  formationForm!: FormGroup;
  languageForm!: FormGroup;
  softSkillForm!: FormGroup;
  techSkillForm!: FormGroup;
  certificationForm!: FormGroup;
  // projectForm!: FormGroup;

  // Data lists
  experiences: Experience[] = [];
  formations: Formation[] = [];
  languages: LanguageResponse[] = [];
  softSkills: SoftSkillResponse[] = [];
  techSkills: TechSkillResponse[] = [];
  certifications: CertificationResponse[] = [];
  // projects: ProjectResponse[] = [];

  // Status options
  // projectStatuses = Object.values(ProjectStatus);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private formationService: FormationService,
    private languageService: LanguageService,
    private softSkillService: SoftSkillService,
    private techSkillService: TechSkillService,
    private certificationService: CertificationService,
    // private projectService: ProjectService,
    private tokenService: TokenService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.userId = this.tokenService.getUser().id;
  }

  ngOnInit(): void {
    this.initForms();
    this.loadExistingData();
    this.setupAutoSave();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email:['', Validators.required],
      phoneNumber: [''],
      diploma: [''],
      bio: [''],
      profilePicture: ['']
    });

    this.formationForm = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      fieldOfStudy: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: ['']
    });

    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false]
    });

    this.certificationForm = this.fb.group({
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      issueDate: [''],
      expirationDate: [''],
      credentialId: [''],
      credentialUrl: ['']
    });

    this.techSkillForm = this.fb.group({
      name: ['', Validators.required],
      level: [SkillLevel.INTERMEDIATE, Validators.required],
      category: ['', Validators.required],
      yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      verified: [false]
    });

    this.softSkillForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.languageForm = this.fb.group({
      name: ['', Validators.required],
      proficiency: [ProficiencyLevel.INTERMEDIATE, Validators.required],
      certification: [''],
      certificateUrl: [''],
      nativeLanguage: [false]
    });

    // this.projectForm = this.fb.group({
    //   title: ['', Validators.required],
    //   description: ['', Validators.required],
    //   startDate: [''],
    //   endDate: [''],
    //   status: [ProjectStatus.PLANNED, Validators.required],
    //   technologies: [[]],
    //   projectUrl: [''],
    //   repositoryUrl: ['']
    // });
  }

  loadExistingData(): void {
    this.profileService.getProfile(this.userId).subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
      }
    });

    this.loadExperiences();
    this.loadFormations();
    this.loadLanguages();
    this.loadSoftSkills();
    this.loadTechSkills();
    this.loadCertifications();
    // this.loadProjects();
  }

  loadFormations(): void {
    this.formationService.getFormations(this.userId).subscribe({
      next: (formations) => {
        this.formations = formations;
      },
      error: (err) => {
        console.error('Failed to load formations:', err);
        this.snackBar.open('Failed to load formations', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadExperiences(): void {
    this.experienceService.getExperiences(this.userId).subscribe({
      next: (experiences: Experience[]) => {
        this.experiences = experiences.map(e => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: e.current ? undefined : (e.endDate ? new Date(e.endDate) : undefined)
        }));
      },
      error: (err) => {
        console.error('Failed to load experiences:', err);
        this.snackBar.open('Failed to load work experiences', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadCertifications(): void {
    this.certificationService.getAllCertifications(this.userId).subscribe({
      next: (certs) => this.certifications = certs,
      error: (err) => console.error('Failed to load certifications:', err)
    });
  }

  loadTechSkills(): void {
    this.techSkillService.getAllTechSkills(this.userId).subscribe({
      next: (skills) => this.techSkills = skills,
      error: (err) => {
        console.error('Failed to load tech skills:', err);
        this.snackBar.open('Failed to load technical skills', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadSoftSkills(): void {
    this.softSkillService.getAllSoftSkills(this.userId).subscribe({
      next: (skills) => this.softSkills = skills,
      error: (err) => console.error('Failed to load soft skills:', err)
    });
  }

  loadLanguages(): void {
    this.languageService.getLanguages(this.userId).subscribe({
      next: (languages) => this.languages = languages,
      error: (err) => console.error('Failed to load languages:', err)
    });
  }

  // loadProjects(): void {
  //   this.projectService.getAllProjects(this.userId).subscribe({
  //     next: (projects) => this.projects = projects,
  //     error: (err) => console.error('Failed to load projects:', err)
  //   });
  // }



  // -----------------Upload Image + Save Profile

// This method should be added to your component
  getProfilePictureUrl(): string {
    if (this.previewUrl) {
      return this.previewUrl as string;
    }

    const profilePicture = this.profileForm.get('profilePicture')?.value;
    if (!profilePicture) {
      return 'assets/default-avatar.png';
    }

    // If the path already starts with http:// or https://, return it as is
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }

    // Otherwise, prepend the base URL
    return this.profileService.getFullImageUrl(profilePicture);
  }



// Add this property to your component class
  verificationMessage: string | null = null;
  verificationResult: 'human' | 'not-human' | null = null;

// Modify the onFileSelected method
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadProgress = 0;
      this.verificationMessage = null;
      this.verificationResult = null;

      // Create preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewUrl = reader.result;
      };

      // Validate file type and size
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        this.snackBar.open('Only JPEG, PNG, or GIF images are allowed', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size should be less than 5MB', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.profileService.uploadProfilePicture(this.userId, file).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            const response = event.body;

            // Handle blocked upload
            if (response.error) {
              this.uploadProgress = null;
              this.previewUrl = null;
              this.snackBar.open(response.message, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              return;
            }

            // Handle successful upload
            this.uploadProgress = null;

            if (response.verification) {
              this.verificationMessage = response.verification.message;
              this.verificationResult = response.verification.isHuman ? 'human' : 'not-human';

              this.snackBar.open(response.verification.message, 'Close', {
                duration: 5000,
                panelClass: [response.verification.isHuman ? 'success-snackbar' : 'warning-snackbar']
              });
            }

            if (response.profile?.profilePicture) {
              this.profileForm.patchValue({ profilePicture: response.profile.profilePicture });
              this.previewUrl = null;
            }
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.uploadProgress = null;
          this.previewUrl = null;
          this.snackBar.open('Error uploading image. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }



  saveProfile(): void {
    if (this.profileForm.valid) {
      const profileData: ProfileUpdateRequest = {
        ...this.profileForm.value,
        socialLinks: []
      };

      this.profileService.updateProfile(this.userId, profileData).subscribe({
        next: () => {
          this.snackBar.open('Profile saved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Failed to save profile:', err);
          this.snackBar.open('Error saving profile. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private setupAutoSave(): void {
    this.profileForm.valueChanges.pipe(
      debounceTime(120000),
      distinctUntilChanged(),
      filter(() => this.profileForm.valid)
    ).subscribe(() => {
      this.saveProfile();
    });
  }

//-----------------------------------------



  addFormation(): void {
    if (this.formationForm.valid) {
      this.formationService.createFormation(this.userId, this.formationForm.value).subscribe({
        next: (newFormation) => {
          this.formations.push(newFormation);
          this.formationForm.reset();
        },
        error: (err) => console.error('Failed to add formation:', err)
      });
    }
  }

  addExperience(): void {
    if (this.experienceForm.valid) {
      this.experienceService.createExperience(this.userId, this.experienceForm.value).subscribe({
        next: (newExperience) => {
          this.experiences.push(newExperience);
          this.experienceForm.reset();
        },
        error: (err) => console.error('Failed to add experience:', err)
      });
    }
  }

  addCertification(): void {
    if (this.certificationForm.valid) {
      const request: CertificationRequest = this.certificationForm.value;
      this.certificationService.createCertification(this.userId, request).subscribe({
        next: (newCert) => {
          this.certifications.push(newCert);
          this.certificationForm.reset();
        },
        error: (err) => console.error('Failed to add certification:', err)
      });
    }
  }

  addTechSkill(): void {
    if (this.techSkillForm.valid) {
      const request: TechSkillRequest = this.techSkillForm.value;
      this.techSkillService.createTechSkill(this.userId, request).subscribe({
        next: (newSkill) => {
          this.techSkills.push(newSkill);
          this.techSkillForm.reset({
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

  addSoftSkill(): void {
    if (this.softSkillForm.valid) {
      const request: SoftSkillRequest = { name: this.softSkillForm.value.name };

      const snackbarRef = this.snackBar.open('Adding soft skill...', 'Close', {
        duration: 0
      });

      this.softSkillService.createSoftSkill(this.userId, request).subscribe({
        next: (newSkill) => {
          snackbarRef.dismiss();
          this.softSkills.push(newSkill);
          this.softSkillForm.reset();
          this.snackBar.open('Soft skill added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          snackbarRef.dismiss();
          console.error('Failed to add soft skill:', err);
          this.snackBar.open(err.error?.message || 'Failed to add soft skill', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  addLanguage(): void {
    if (this.languageForm.valid) {
      const request: LanguageRequest = this.languageForm.value;

      const snackbarRef = this.snackBar.open('Adding language...', 'Close', {
        duration: 0
      });

      this.languageService.createLanguage(this.userId, request).subscribe({
        next: (newLanguage) => {
          snackbarRef.dismiss();
          this.languages.push(newLanguage);
          this.languageForm.reset({
            proficiency: ProficiencyLevel.INTERMEDIATE,
            nativeLanguage: false
          });
          this.snackBar.open('Language added successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          snackbarRef.dismiss();
          console.error('Failed to add language:', err);
          this.snackBar.open(err.error?.message || 'Failed to add language', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // addProject(): void {
  //   if (this.projectForm.valid) {
  //     const request: ProjectRequest = this.projectForm.value;
  //     this.projectService.createProject(this.userId, request).subscribe({
  //       next: (newProject) => {
  //         this.projects.push(newProject);
  //         this.projectForm.reset();
  //       },
  //       error: (err) => console.error('Failed to add project:', err)
  //     });
  //   }
  // }


  deleteFormation(formationId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Delete Formation',
        message: 'This will permanently remove the formation record. This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep It',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.formationService.deleteFormation(this.userId, formationId).subscribe({
          next: () => {
            this.formations = this.formations.filter(f => f.id !== formationId);
            this.snackBar.open('Formation deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete formation:', err);
            this.snackBar.open('Failed to delete formation', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteExperience(experienceId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Delete Experience',
        message: 'This will permanently remove this work experience. This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep It',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.experienceService.deleteExperience(this.userId, experienceId).subscribe({
          next: () => {
            this.experiences = this.experiences.filter(e => e.id !== experienceId);
            this.snackBar.open('Experience deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete experience:', err);
            this.snackBar.open('Failed to delete experience', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteCertification(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Delete Certification',
        message: 'This will permanently remove this certification. This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep It',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.certificationService.deleteCertification(id).subscribe({
          next: () => {
            this.certifications = this.certifications.filter(c => c.id !== id);
            this.snackBar.open('Certification deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete certification:', err);
            this.snackBar.open('Failed to delete certification', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteTechSkill(id: number): void {
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
        this.techSkillService.deleteTechSkill(this.userId, id).subscribe({
          next: () => {
            this.techSkills = this.techSkills.filter(s => s.id !== id);
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

  deleteSoftSkill(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Soft Skill',
        message: 'Are you sure you want to delete this soft skill?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.softSkillService.deleteSoftSkill(this.userId, id).subscribe({
          next: () => {
            this.softSkills = this.softSkills.filter(s => s.id !== id);
            this.snackBar.open('Soft skill deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete soft skill:', err);
            this.snackBar.open('Failed to delete soft skill', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteLanguage(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Language',
        message: 'Are you sure you want to delete this language?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.languageService.deleteLanguage(this.userId, id).subscribe({
          next: () => {
            this.languages = this.languages.filter(l => l.id !== id);
            this.snackBar.open('Language deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            console.error('Failed to delete language:', err);
            this.snackBar.open('Failed to delete language', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }


  // deleteProject(id: number): void {
  //   if (confirm('Are you sure you want to delete this project?')) {
  //     this.projectService.deleteProject(id).subscribe({
  //       next: () => this.projects = this.projects.filter(p => p.id !== id),
  //       error: (err) => console.error('Failed to delete project:', err)
  //     });
  //   }
  // }



  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  skipWizard(): void {
    this.router.navigate(['/portfolio']);
  }

  completeProfile(): void {
    if (this.profileForm.valid) {
      const profileData: ProfileUpdateRequest = {
        ...this.profileForm.value,
        socialLinks: [],
        completed: true
      };

      this.profileService.updateProfile(this.userId, profileData).subscribe({
        next: () => this.router.navigate(['/portfolio']),
        error: (err) => console.error('Failed to complete profile:', err)
      });
    }
  }

  calculateProgress(): number {
    const completed = [
      this.profileForm.valid,
      this.formations.length > 0,
      this.experiences.length > 0,
      this.certifications.length > 0,
      this.techSkills.length > 0,
      this.softSkills.length > 0,
      this.languages.length > 0,
      // this.projects.length > 0
    ].filter(Boolean).length;

    return (completed / this.totalSteps) * 100;
  }
}
