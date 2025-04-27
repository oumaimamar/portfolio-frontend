import {Component, OnInit} from '@angular/core';
import {ProjectRequest, ProjectResponse, ProjectStatus} from '../../_models/project';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../_services/project.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  projects: ProjectResponse[] = [];
  projectStatuses = Object.values(ProjectStatus);
  newSkill: string = ''; // Added for skill input
  currentProjectId: number | null = null;
  isEditing = false;

  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      status: [ProjectStatus.PLANNED, Validators.required],
      skills: [[]]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    const profileId = 1; // Replace with actual profile ID logic
    this.projectService.getAllProjects(profileId).subscribe({
      next: (projects) => this.projects = projects,
      error: (err) => this.showError('Failed to load projects', err)
    });
  }

  addProject(): void {
    if (this.projectForm.valid) {
      const request: ProjectRequest = this.projectForm.value;
      const operation = this.isEditing
        ? this.projectService.updateProject(this.currentProjectId!, request)
        : this.projectService.createProject(1, request); // Replace with profile ID

      operation.subscribe({
        next: (project) => {
          this.isEditing ? this.updateProjectInList(project) : this.projects.push(project);
          this.resetForm();
          this.showSuccess(`Project ${this.isEditing ? 'updated' : 'added'} successfully`);
        },
        error: (err) => this.showError(`Failed to ${this.isEditing ? 'update' : 'add'} project`, err)
      });
    }
  }

  editProject(project: ProjectResponse): void {
    this.currentProjectId = project.id;
    this.isEditing = true;
    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      skills: project.skills || []
    });
  }

  deleteProject(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: {
        title: 'Delete Project',
        message: 'Are you sure you want to delete this project?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.projectService.deleteProject(id).subscribe({
          next: () => {
            this.projects = this.projects.filter(p => p.id !== id);
            this.showSuccess('Project deleted successfully');
          },
          error: (err) => this.showError('Failed to delete project', err)
        });
      }
    });
  }

  addSkillFromInput(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (value) {
      const currentSkills = this.projectForm.get('skills')?.value || [];
      if (!currentSkills.includes(value)) {
        this.projectForm.get('skills')?.setValue([...currentSkills, value]);
      }
      this.newSkill = '';
      input.value = '';
    }
  }

  removeSkill(skill: string): void {
    const currentSkills = this.projectForm.get('skills')?.value || [];
    this.projectForm.get('skills')?.setValue(currentSkills.filter((s: string) => s !== skill));
  }

  resetForm(): void {
    this.projectForm.reset({
      status: ProjectStatus.PLANNED,
      skills: []
    });
    this.isEditing = false;
    this.currentProjectId = null;
    this.newSkill = '';
  }

  private updateProjectInList(updatedProject: ProjectResponse): void {
    const index = this.projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      this.projects[index] = updatedProject;
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
