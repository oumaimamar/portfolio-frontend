import {Component, OnInit} from '@angular/core';
import {ProfileService} from '../../_services/profile.service';
import {ExperienceService} from '../../_services/experience.service';
import {FormationService} from '../../_services/formation.service';
import {LanguageService} from '../../_services/language.service';
import {SkillService} from '../../_services/skill.service';
import {TokenService} from '../../_services/token.service';

@Component({
  selector: 'app-portfolio',
  standalone: false,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  userId: number;
  profile: any;
  experiences: any[] = [];
  formations: any[] = [];
  languages: any[] = [];
  skills: any[] = [];
  isLoading = true;

  constructor(
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private formationService: FormationService,
    private languageService: LanguageService,
    private skillService: SkillService,
    protected tokenService: TokenService
  ) {
    this.userId = this.tokenService.getUser().id;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.profileService.getProfile(this.userId).subscribe(profile => {
      this.profile = profile;
    });

    this.experienceService.getExperiences(this.userId).subscribe(experiences => {
      this.experiences = experiences;
    });

    this.formationService.getFormations(this.userId).subscribe(formations => {
      this.formations = formations;
    });

    this.languageService.getLanguages(this.userId).subscribe(languages => {
      this.languages = languages;
    });

    this.skillService.getSkills(this.userId).subscribe(skills => {
      this.skills = skills;
      this.isLoading = false;
    });
  }

  getCompletionPercentage(): number {
    const completedSections = [
      this.profile?.completedSteps?.profile,
      this.experiences.length > 0,
      this.formations.length > 0,
      this.languages.length > 0,
      this.skills.length > 0
    ].filter(Boolean).length;

    return (completedSections / 5) * 100;
  }
}
