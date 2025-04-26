import {Component, OnInit} from '@angular/core';
import {TokenService} from '../../_services/token.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Experience} from '../../_models/experience';
import {Formation} from '../../_models/formation';
import {Language} from '../../_models/language';
import {SoftSkillRequest, SoftSkillResponse} from '../../_models/soft-skill';
import {TechSkillRequest, TechSkillResponse} from '../../_models/tech-skill';
import {CertificationRequest, CertificationResponse} from '../../_models/certification';
import {ProjectRequest, ProjectResponse, ProjectStatus} from '../../_models/project';
import {ProfileService} from '../../_services/profile.service';
import {ExperienceService} from '../../_services/experience.service';
import {FormationService} from '../../_services/formation.service';
import {SoftSkillService} from '../../_services/soft-skill.service';
import {LanguageService} from '../../_services/language.service';
import {TechSkillService} from '../../_services/tech-skill.service';
import {CertificationService} from '../../_services/certification.service';
import {ProjectService} from '../../_services/project.service';
import { Router } from '@angular/router';
import {ProfileUpdateRequest} from '../../_models/profile';
import { HttpEventType } from '@angular/common/http';

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

// Add these to your component class
  previewUrl: string | ArrayBuffer | null = null;
  uploadProgress: number | null = null;

  // Forms
  profileForm!: FormGroup;
  experienceForm!: FormGroup;
  formationForm!: FormGroup;
  languageForm!: FormGroup;
  softSkillForm!: FormGroup;
  techSkillForm!: FormGroup;
  certificationForm!: FormGroup;
  projectForm!: FormGroup;

  // Data lists
  experiences: Experience[] = [];
  formations: Formation[] = [];
  languages: Language[] = [];
  softSkills: SoftSkillResponse[] = [];
  techSkills: TechSkillResponse[] = [];
  certifications: CertificationResponse[] = [];
  projects: ProjectResponse[] = [];

  // Status options
  projectStatuses = Object.values(ProjectStatus);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private formationService: FormationService,
    private languageService: LanguageService,
    private softSkillService: SoftSkillService,
    private techSkillService: TechSkillService,
    private certificationService: CertificationService,
    private projectService: ProjectService,
    private tokenService: TokenService,
    private router: Router
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

    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      description: [''],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false]
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

    this.languageForm = this.fb.group({
      name: ['', Validators.required],
      proficiency: ['', Validators.required]
    });

    this.softSkillForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.techSkillForm = this.fb.group({
      name: ['', Validators.required],
      level: [1, [Validators.min(1), Validators.max(10)]],
      category: ['']
    });

    this.certificationForm = this.fb.group({
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      issueDate: [''],
      expirationDate: [''],
      credentialId: [''],
      credentialUrl: ['']
    });

    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      status: [ProjectStatus.PLANNED, Validators.required],
      technologies: [[]],
      projectUrl: [''],
      repositoryUrl: ['']
    });
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
    this.loadProjects();
  }

  loadExperiences(): void {
    this.experienceService.getExperiences(this.userId).subscribe({
      next: (experiences) => this.experiences = experiences,
      error: (err) => console.error('Failed to load experiences:', err)
    });
  }

  loadFormations(): void {
    this.formationService.getFormations(this.userId).subscribe({
      next: (formations) => this.formations = formations,
      error: (err) => console.error('Failed to load formations:', err)
    });
  }

  loadLanguages(): void {
    this.languageService.getLanguages(this.userId).subscribe({
      next: (languages) => this.languages = languages,
      error: (err) => console.error('Failed to load languages:', err)
    });
  }

  loadSoftSkills(): void {
    this.softSkillService.getAllSoftSkills(this.userId).subscribe({
      next: (skills) => this.softSkills = skills,
      error: (err) => console.error('Failed to load soft skills:', err)
    });
  }

  loadTechSkills(): void {
    this.techSkillService.getAllTechSkills(this.userId).subscribe({
      next: (skills) => this.techSkills = skills,
      error: (err) => console.error('Failed to load tech skills:', err)
    });
  }

  loadCertifications(): void {
    this.certificationService.getAllCertifications(this.userId).subscribe({
      next: (certs) => this.certifications = certs,
      error: (err) => console.error('Failed to load certifications:', err)
    });
  }

  loadProjects(): void {
    this.projectService.getAllProjects(this.userId).subscribe({
      next: (projects) => this.projects = projects,
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Reset progress
      this.uploadProgress = 0;

      // Create preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewUrl = reader.result;
      };

      // Validate file type and size
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        alert('Only JPEG, PNG, or GIF images are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      this.profileService.uploadProfilePicture(this.userId, file).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Update progress
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            // Handle successful upload
            this.uploadProgress = null;

            // Assuming backend returns the image path or URL
            const imagePath = event.body?.path || event.body?.url || event.body?.filename;

            if (imagePath) {
              // Update form with the new image path
              this.profileForm.patchValue({ profilePicture: imagePath });

              // Reset preview (will now use the form value)
              this.previewUrl = null;

              // Show success message
              alert('Profile picture updated successfully!');
            }
          }
        },
        error: (err) => {
          console.error('Upload error:', err);
          this.uploadProgress = null;
          this.previewUrl = null;
          alert('Error uploading image. Please try again.');
        }
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

  addLanguage(): void {
    if (this.languageForm.valid) {
      this.languageService.createLanguage(this.userId, this.languageForm.value).subscribe({
        next: (newLanguage) => {
          this.languages.push(newLanguage);
          this.languageForm.reset();
        },
        error: (err) => console.error('Failed to add language:', err)
      });
    }
  }

  addSoftSkill(): void {
    if (this.softSkillForm.valid) {
      const request: SoftSkillRequest = { name: this.softSkillForm.value.name };
      this.softSkillService.createSoftSkill(this.userId, request).subscribe({
        next: (newSkill) => {
          this.softSkills.push(newSkill);
          this.softSkillForm.reset();
        },
        error: (err) => console.error('Failed to add soft skill:', err)
      });
    }
  }

  addTechSkill(): void {
    if (this.techSkillForm.valid) {
      const request: TechSkillRequest = {
        name: this.techSkillForm.value.name,
        level: this.techSkillForm.value.level,
        category: this.techSkillForm.value.category
      };
      this.techSkillService.createTechSkill(this.userId, request).subscribe({
        next: (newSkill) => {
          this.techSkills.push(newSkill);
          this.techSkillForm.reset();
        },
        error: (err) => console.error('Failed to add tech skill:', err)
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

  addProject(): void {
    if (this.projectForm.valid) {
      const request: ProjectRequest = this.projectForm.value;
      this.projectService.createProject(this.userId, request).subscribe({
        next: (newProject) => {
          this.projects.push(newProject);
          this.projectForm.reset();
        },
        error: (err) => console.error('Failed to add project:', err)
      });
    }
  }

  deleteExperience(id: number): void {
    if (confirm('Are you sure you want to delete this experience?')) {
      this.experienceService.deleteExperience(id).subscribe({
        next: () => this.experiences = this.experiences.filter(e => e.id !== id),
        error: (err) => console.error('Failed to delete experience:', err)
      });
    }
  }

  deleteFormation(id: number): void {
    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => this.formations = this.formations.filter(f => f.id !== id),
        error: (err) => console.error('Failed to delete formation:', err)
      });
    }
  }

  deleteLanguage(id: number): void {
    if (confirm('Are you sure you want to delete this language?')) {
      this.languageService.deleteLanguage(id).subscribe({
        next: () => this.languages = this.languages.filter(l => l.id !== id),
        error: (err) => console.error('Failed to delete language:', err)
      });
    }
  }

  deleteSoftSkill(id: number): void {
    if (confirm('Are you sure you want to delete this soft skill?')) {
      this.softSkillService.deleteSoftSkill(this.userId, id).subscribe({
        next: () => this.softSkills = this.softSkills.filter(s => s.id !== id),
        error: (err) => console.error('Failed to delete soft skill:', err)
      });
    }
  }

  deleteTechSkill(id: number): void {
    if (confirm('Are you sure you want to delete this tech skill?')) {
      this.techSkillService.deleteTechSkill(this.userId, id).subscribe({
        next: () => this.techSkills = this.techSkills.filter(s => s.id !== id),
        error: (err) => console.error('Failed to delete tech skill:', err)
      });
    }
  }

  deleteCertification(id: number): void {
    if (confirm('Are you sure you want to delete this certification?')) {
      this.certificationService.deleteCertification(id).subscribe({
        next: () => this.certifications = this.certifications.filter(c => c.id !== id),
        error: (err) => console.error('Failed to delete certification:', err)
      });
    }
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.projects = this.projects.filter(p => p.id !== id),
        error: (err) => console.error('Failed to delete project:', err)
      });
    }
  }

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
      this.experiences.length > 0,
      this.formations.length > 0,
      this.languages.length > 0,
      this.softSkills.length > 0,
      this.techSkills.length > 0,
      this.projects.length > 0
    ].filter(Boolean).length;

    return (completed / this.totalSteps) * 100;
  }
}
